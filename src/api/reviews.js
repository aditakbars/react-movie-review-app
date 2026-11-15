import axios from 'axios';

/*
  The reviews server (Render free tier) sleeps when idle and takes up to a minute
  to wake. So: keep the last list in localStorage and show it at once, refresh
  quietly behind it, and nudge the server awake as soon as anyone opens the site.
*/
const BASE = 'https://my-movie-review.onrender.com';
const LIST_KEY = 'adits-cinema-reviews-v1';
const FILM_KEY = 'adits-cinema-films-v1';
const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TIMEOUT = 90000;

const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or private */ } };

export const cachedReviews = () => read(LIST_KEY)?.data || null;
export const cachedReview = (id) => (cachedReviews() || []).find((r) => String(r.review_id) === String(id)) || null;

let inflight = null;
export const loadReviews = () => {
    if (!inflight) {
        inflight = axios.get(`${BASE}/reviews`, { timeout: TIMEOUT })
            .then((r) => { const data = r.data?.data || []; write(LIST_KEY, { at: Date.now(), data }); return data; })
            .finally(() => { inflight = null; });
    }
    return inflight;
};

export const loadReview = (id) =>
    axios.get(`${BASE}/reviews/${id}`, { timeout: TIMEOUT })
        .then((r) => (Array.isArray(r.data?.data) ? r.data.data[0] : r.data?.data) || null);

/* Fire-and-forget: wakes the server and refreshes the cache while the visitor browses films. */
export const wakeReviews = () => { loadReviews().catch(() => {}); };

export const readingTime = (text) => Math.max(1, Math.round((text || '').split(/\s+/).filter(Boolean).length / 200));

/* imdb_id -> the TMDb film (id, year, rating), so a review can link to its film page. */
export const findFilm = async (imdbId) => {
    if (!imdbId) return null;
    const known = read(FILM_KEY) || {};
    if (known[imdbId]) return known[imdbId];
    const r = await axios.get(`https://api.themoviedb.org/3/find/${imdbId}`, { params: { api_key: TMDB_KEY, external_source: 'imdb_id' } });
    const m = r.data?.movie_results?.[0];
    if (!m) return null;
    const film = { id: m.id, year: (m.release_date || '').slice(0, 4), rating: m.vote_average ? m.vote_average.toFixed(1) : null };
    write(FILM_KEY, { ...(read(FILM_KEY) || {}), [imdbId]: film });
    return film;
};

export const reviewForImdb = (imdbId, list) => (list || []).find((r) => r.imdb_id && r.imdb_id === imdbId) || null;

/* TMDb id -> review_id for every reviewed film, so posters anywhere can carry a "Reviewed" badge. */
let reviewedMemo = null;
export const reviewedFilms = () => {
    if (!reviewedMemo) {
        const fromList = (list) => Promise.all((list || []).filter((r) => r.imdb_id).map((r) =>
            findFilm(r.imdb_id).then((f) => (f ? [f.id, r.review_id] : null)).catch(() => null)))
            .then((pairs) => new Map(pairs.filter(Boolean)));
        const cached = cachedReviews();
        reviewedMemo = cached ? fromList(cached) : loadReviews().then(fromList);
        // Refresh once the fresh list arrives (the cached one may be stale).
        if (cached) loadReviews().then(fromList).then((m) => { reviewedMemo = Promise.resolve(m); }).catch(() => {});
        reviewedMemo.catch(() => { reviewedMemo = null; });
    }
    return reviewedMemo;
};
