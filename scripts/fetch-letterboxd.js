#!/usr/bin/env node
/*
  Fetches Adit's Letterboxd diary (the public RSS feed) and saves it as
  public/letterboxd.json, which the site reads. Run by a daily GitHub Action,
  or by hand with: npm run letterboxd

  - Entries are merged into the existing file, so the diary keeps growing past
    the feed's ~50-entry window.
  - With a TMDb key (REACT_APP_TMDB_KEY, from .env or the environment) each new
    film gets its TMDb poster, so the site doesn't hotlink Letterboxd's images.
  - If Letterboxd can't be reached, the existing file is left untouched and the
    script exits successfully, so a deploy never fails because of it.
*/
const { readEnvKey, readDiary, writeDiary, entryKey, sortEntries, tmdb } = require('./letterboxd-lib');

const USER = process.env.LETTERBOXD_USER || 'aditjh';
const FEED = `https://letterboxd.com/${USER}/rss/`;

const decode = (s) => s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

const tag = (name, xml) => {
    const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
    return m ? m[1].trim() : null;
};

const parse = (xml) => (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map((item) => {
    const title = tag('letterboxd:filmTitle', item);
    if (!title) return null; // lists and other non-diary items
    const html = (tag('description', item) || '').replace(/^<!\[CDATA\[|\]\]>$/g, '');
    const poster = (html.match(/<img src="([^"]+)"/) || [])[1] || null;
    const spoiler = /This review may contain spoilers/i.test(html);
    const paragraphs = (html.match(/<p>([\s\S]*?)<\/p>/g) || [])
        .map((p) => decode(p.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').trim()))
        .filter((p) => p && !/^Watched on /.test(p) && !/^This review may contain spoilers/i.test(p));
    const rating = tag('letterboxd:memberRating', item);
    return {
        id: (tag('guid', item) || '').replace('letterboxd-', ''),
        title: decode(title),
        year: tag('letterboxd:filmYear', item),
        tmdbId: Number(tag('tmdb:movieId', item)) || null,
        watched: tag('letterboxd:watchedDate', item),
        rating: rating ? Number(rating) : null,
        rewatch: tag('letterboxd:rewatch', item) === 'Yes',
        liked: tag('letterboxd:memberLike', item) === 'Yes',
        review: paragraphs.join('\n\n') || null,
        spoiler,
        url: tag('link', item),
        lbPoster: poster,
    };
}).filter(Boolean);

const main = async () => {
    const existing = readDiary();

    let xml;
    try {
        const res = await fetch(FEED, { headers: { 'User-Agent': 'adits-cinema-diary/1.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        xml = await res.text();
    } catch (e) {
        console.warn(`Letterboxd feed unavailable (${e.message}); keeping the existing diary.`);
        return;
    }

    const fresh = parse(xml).filter((e) => e.id);
    const byId = new Map((existing.entries || []).map((e) => [e.id, e]));
    const byKey = new Map((existing.entries || []).map((e) => [entryKey(e), e]));
    // Fresh copies win, so edited ratings or reviews are picked up. An entry that
    // came from the monthly export is recognised by film + year + date, not id.
    fresh.forEach((e) => {
        const prev = byId.get(e.id) || byKey.get(entryKey(e));
        if (prev && prev.id !== e.id) byId.delete(prev.id);
        byId.set(e.id, { ...prev, ...e, poster: prev?.poster });
    });

    const key = readEnvKey();
    if (key) {
        const api = tmdb(key);
        for (const e of [...byId.values()].filter((x) => x.tmdbId && x.poster === undefined)) {
            try { e.poster = await api.poster(e.tmdbId); } catch (err) { /* try again next run */ }
        }
    }

    const entries = sortEntries([...byId.values()]);
    if (JSON.stringify(existing.entries || []) === JSON.stringify(entries)) {
        console.log(`No new diary entries (${entries.length} saved).`);
        return;
    }
    writeDiary({
        ...existing,
        profile: USER,
        profileUrl: `https://letterboxd.com/${USER}/`,
        updated: new Date().toISOString(),
        entries,
    });
    console.log(`Diary saved: ${entries.length} entries (${fresh.length} in the feed).`);
};

main().catch((e) => { console.warn(`Diary update skipped: ${e.message}`); });
