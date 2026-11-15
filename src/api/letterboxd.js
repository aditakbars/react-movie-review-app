/*
  Adit's Letterboxd diary. scripts/fetch-letterboxd.js saves it as
  /letterboxd.json (a daily GitHub Action keeps it fresh); the site only reads it.
*/
let memo = null;
export const loadDiary = () => {
    if (!memo) {
        memo = fetch('/letterboxd.json')
            .then((r) => (r.ok ? r.json() : { entries: [] }))
            .catch(() => ({ entries: [] }));
    }
    return memo;
};

/* 3.5 -> "★★★½" */
export const starText = (rating) => (rating ? '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '') : '');
export const starLabel = (rating) => (rating ? `${rating} out of 5 stars` : 'Not rated');

/* Latest diary entry per TMDb film id, plus how many times the film was logged. */
export const indexByFilm = (entries) => {
    const map = new Map();
    entries.forEach((e) => {
        if (!e.tmdbId) return;
        const seen = map.get(e.tmdbId);
        if (!seen) map.set(e.tmdbId, { ...e, logs: 1 });
        else seen.logs += 1;
    });
    return map;
};
