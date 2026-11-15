/* Shared helpers for the two Letterboxd scripts (daily feed + monthly export import). */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'letterboxd.json');

const readEnvKey = () => {
    if (process.env.REACT_APP_TMDB_KEY) return process.env.REACT_APP_TMDB_KEY;
    try {
        const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
        return (env.match(/^REACT_APP_TMDB_KEY=(.+)$/m) || [])[1]?.trim();
    } catch (e) { return undefined; }
};

const readDiary = () => {
    try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) { return { entries: [] }; }
};

/* The same viewing, however it reached us: film, year and the night it was watched. */
const entryKey = (e) => `${(e.title || '').toLowerCase()}|${e.year || ''}|${e.watched || ''}`;
const filmKey = (title, year) => `${(title || '').toLowerCase()}|${year || ''}`;

const sortEntries = (entries) => entries.sort((a, b) =>
    (b.watched || '').localeCompare(a.watched || '') || String(b.id).localeCompare(String(a.id)));

const writeDiary = (data) => {
    fs.writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
};

/* TMDb: details by id (for the poster) and search by title + year (the export has no TMDb ids). */
const tmdb = (key) => {
    const get = async (p, params = {}) => {
        const q = new URLSearchParams({ api_key: key, ...params });
        const r = await fetch(`https://api.themoviedb.org/3${p}?${q}`);
        if (!r.ok) throw new Error(`TMDb ${r.status}`);
        return r.json();
    };
    return {
        poster: async (id) => (await get(`/movie/${id}`)).poster_path || null,
        /*
          Collects results from a year-filtered and an open search, keeps only the
          same title (or original title) within a year of Letterboxd's year, and
          picks the one most people have rated. Never settles for a different title.
        */
        find: async (title, year) => {
            const searches = [{ query: title, year }, { query: title }];
            const seen = new Map();
            for (const params of searches) {
                ((await get('/search/movie', params)).results || []).forEach((m) => seen.set(m.id, m));
            }
            // Compare titles without case, accents or punctuation ("–" vs "-", "Amélie" vs "Amelie").
            const norm = (t) => (t || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim().replace(/^the /, '');
            const name = norm(title);
            const yearOf = (m) => Number((m.release_date || '').slice(0, 4)) || null;
            const near = (m, span) => !year || !yearOf(m) || Math.abs(yearOf(m) - Number(year)) <= span;
            const byVotes = (a, b) => (b.vote_count - a.vote_count);
            const all = [...seen.values()];
            // 1. Same title, within a year.
            const exact = all.filter((m) => [m.title, m.original_title].some((t) => norm(t) === name) && near(m, 1)).sort(byVotes);
            // 2. TMDb adds a subtitle ("Glass Onion: A Knives Out Mystery"): same year, and a film enough people know.
            const subtitled = all.filter((m) => [m.title, m.original_title].some((t) => norm(t).startsWith(`${name} `)) && near(m, 0) && m.vote_count >= 50).sort(byVotes);
            const pick = exact[0] || subtitled[0];
            return pick ? { tmdbId: pick.id, poster: pick.poster_path || null } : null;
        },
    };
};

module.exports = { OUT, readEnvKey, readDiary, writeDiary, entryKey, filmKey, sortEntries, tmdb };
