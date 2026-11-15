#!/usr/bin/env node
/*
  Imports a full Letterboxd export (Settings → Data → Export your data) into
  public/letterboxd.json. Run it about once a month, or after editing old reviews:

    npm run letterboxd:import -- ~/Downloads/letterboxd-aditjh-2026-11-15.zip

  The export is the source of truth for everything it covers: edited ratings and
  reviews are picked up, and logs deleted on Letterboxd are removed. Logs newer
  than the export (from the daily feed) are kept. Only the diary, reviews,
  ratings, likes and watched count are read; profile.csv (email etc.) is ignored,
  and the zip itself is never copied into the project.
*/
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { readEnvKey, readDiary, writeDiary, entryKey, filmKey, sortEntries, tmdb } = require('./letterboxd-lib');

const source = process.argv[2];
if (!source) {
    console.error('Usage: npm run letterboxd:import -- <path to the Letterboxd export .zip or its unzipped folder>');
    process.exit(1);
}

/* Reads a file from the zip or the folder; missing files read as empty. */
const reader = (() => {
    if (fs.statSync(source).isDirectory()) {
        return (name) => { try { return fs.readFileSync(path.join(source, name), 'utf8'); } catch (e) { return ''; } };
    }
    const zip = new AdmZip(source);
    return (name) => zip.getEntry(name)?.getData().toString('utf8') || '';
})();

/* RFC 4180 CSV: quoted fields, doubled quotes, newlines inside quotes. */
const parseCsv = (text) => {
    const rows = []; let row = []; let field = ''; let quoted = false;
    for (let i = 0; i < text.length; i += 1) {
        const c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; } else if (c === '"') quoted = false; else field += c;
        } else if (c === '"') quoted = true;
        else if (c === ',') { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i += 1;
            row.push(field); rows.push(row); row = []; field = '';
        } else field += c;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    const [head, ...body] = rows.filter((r) => r.some((f) => f !== ''));
    return body.map((r) => Object.fromEntries((head || []).map((h, i) => [h.replace(/^﻿/, ''), r[i] ?? ''])));
};

const main = async () => {
    const diary = parseCsv(reader('diary.csv'));
    if (!diary.length) { console.error('No diary.csv found in that export.'); process.exit(1); }
    const reviews = parseCsv(reader('reviews.csv'));
    const ratings = parseCsv(reader('ratings.csv'));
    const watched = parseCsv(reader('watched.csv'));
    const liked = new Set(parseCsv(reader('likes/films.csv')).map((f) => filmKey(f.Name, f.Year)));
    const reviewByUri = new Map(reviews.map((r) => [r['Letterboxd URI'], r]));

    const existing = readDiary();
    const old = existing.entries || [];
    const oldByKey = new Map(old.map((e) => [entryKey(e), e]));
    const films = new Map(); // filmKey -> { tmdbId, poster }
    [...old, ...(existing.ratings || [])].forEach((e) => { if (e.tmdbId) films.set(filmKey(e.title, e.year), { tmdbId: e.tmdbId, poster: e.poster ?? null }); });

    const latestInExport = diary.reduce((m, d) => (d['Watched Date'] > m ? d['Watched Date'] : m), '');
    const entries = diary.map((d) => {
        const review = reviewByUri.get(d['Letterboxd URI']);
        const base = { title: d.Name, year: d.Year, watched: d['Watched Date'] || d.Date };
        const prev = oldByKey.get(entryKey(base));
        const film = films.get(filmKey(d.Name, d.Year));
        return {
            id: prev?.id || `lb-${d['Letterboxd URI'].split('/').pop()}`,
            ...base,
            tmdbId: prev?.tmdbId || film?.tmdbId || null,
            rating: d.Rating ? Number(d.Rating) : null,
            rewatch: d.Rewatch === 'Yes',
            liked: liked.has(filmKey(d.Name, d.Year)),
            review: review?.Review ? review.Review.replace(/\r\n/g, '\n').trim() : null,
            spoiler: prev?.spoiler || false,
            url: prev?.url || d['Letterboxd URI'],
            lbPoster: prev?.lbPoster || null,
            poster: prev?.poster ?? film?.poster,
        };
    });
    // Logs newer than the export (picked up by the daily feed since) stay.
    const imported = new Set(entries.map(entryKey));
    const newer = old.filter((e) => !imported.has(entryKey(e)) && (e.watched || '') > latestInExport);
    const removed = old.filter((e) => !imported.has(entryKey(e)) && (e.watched || '') <= latestInExport);

    const rated = ratings.map((r) => ({ title: r.Name, year: r.Year, rating: Number(r.Rating), rated: r.Date }));

    // Fill in TMDb ids and posters, a few requests at a time.
    const key = readEnvKey();
    const unmatched = [];
    if (key) {
        const api = tmdb(key);
        const need = new Map();
        [...entries, ...rated].forEach((e) => {
            const k = filmKey(e.title, e.year);
            if (!e.tmdbId && !films.get(k)?.tmdbId) need.set(k, e);
        });
        const queue = [...need.entries()];
        let done = 0;
        const worker = async () => {
            while (queue.length) {
                const [k, e] = queue.shift();
                try {
                    const hit = await api.find(e.title, e.year);
                    if (hit) films.set(k, hit); else unmatched.push(`${e.title} (${e.year})`);
                } catch (err) { unmatched.push(`${e.title} (${e.year}): ${err.message}`); }
                done += 1;
                if (done % 50 === 0) console.log(`  matched ${done} of ${need.size} films on TMDb…`);
            }
        };
        await Promise.all([1, 2, 3, 4].map(worker));
        for (const e of entries) {
            if (e.tmdbId && e.poster === undefined) { try { e.poster = await api.poster(e.tmdbId); } catch (err) { /* next time */ } }
        }
    } else {
        console.warn('No TMDb key (REACT_APP_TMDB_KEY): films without a known TMDb id will not link to their pages.');
    }
    const withFilm = (e) => {
        const f = films.get(filmKey(e.title, e.year));
        return { ...e, tmdbId: e.tmdbId || f?.tmdbId || null, poster: e.poster ?? f?.poster ?? null };
    };

    const out = {
        ...existing,
        profile: existing.profile || 'aditjh',
        profileUrl: existing.profileUrl || 'https://letterboxd.com/aditjh/',
        updated: new Date().toISOString(),
        imported: new Date().toISOString().slice(0, 10),
        watchedCount: watched.length,
        entries: sortEntries([...entries.map(withFilm), ...newer]),
        ratings: rated.map(withFilm),
    };
    writeDiary(out);

    console.log(`Imported ${entries.length} diary entries (${entries.filter((e) => e.review).length} with reviews), ${rated.length} ratings, ${watched.length} films watched.`);
    if (newer.length) console.log(`Kept ${newer.length} newer log(s) from the daily feed.`);
    if (removed.length) console.log(`Removed ${removed.length} log(s) no longer on Letterboxd: ${removed.map((e) => e.title).join(', ')}`);
    if (unmatched.length) console.log(`Not found on TMDb (shown without a film link):\n  ${unmatched.join('\n  ')}`);
};

main().catch((e) => { console.error(e.message); process.exit(1); });
