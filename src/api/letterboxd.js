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

/*
  TMDb film id -> what Adit thinks of it: the latest diary entry (with how many
  times it was logged), or just the rating for films rated but never logged.
  `rating` is always the film's current rating, which is what badges show.
*/
export const indexByFilm = (entries, ratings = []) => {
    const map = new Map();
    ratings.forEach((r) => { if (r.tmdbId) map.set(r.tmdbId, { ...r, ratedOnly: true, logs: 0 }); });
    const current = new Map(ratings.filter((r) => r.tmdbId).map((r) => [r.tmdbId, r.rating]));
    entries.forEach((e) => {
        if (!e.tmdbId) return;
        const seen = map.get(e.tmdbId);
        if (!seen || seen.ratedOnly) map.set(e.tmdbId, { ...e, logs: 1, entryRating: e.rating, rating: current.get(e.tmdbId) ?? e.rating });
        else seen.logs += 1;
    });
    return map;
};
