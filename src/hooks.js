import { useEffect, useState } from 'react';
import { cachedReviews, loadReviews, findFilm, reviewedFilms } from './api/reviews';
import { loadDiary, indexByFilm } from './api/letterboxd';

/* Cached reviews at once, then the fresh list. `slow` flips on if the server is asleep and nothing is cached. */
export const useReviews = () => {
    const [reviews, setReviews] = useState(cachedReviews);
    const [loading, setLoading] = useState(true);
    const [slow, setSlow] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let alive = true;
        const timer = window.setTimeout(() => alive && setSlow(true), 2500);
        loadReviews()
            .then((data) => alive && setReviews(data))
            .catch(() => alive && setError(true))
            .finally(() => { window.clearTimeout(timer); if (alive) { setLoading(false); setSlow(false); } });
        return () => { alive = false; window.clearTimeout(timer); };
    }, []);

    return { reviews, loading, slow, error };
};

/* { [imdb_id]: { id, year, rating } } for a list of reviews, filled in as lookups return. */
export const useFilms = (reviews) => {
    const [films, setFilms] = useState({});
    const ids = (reviews || []).map((r) => r.imdb_id).filter(Boolean).join(',');
    useEffect(() => {
        let alive = true;
        ids.split(',').filter(Boolean).forEach((imdb) => {
            findFilm(imdb).then((f) => alive && f && setFilms((prev) => ({ ...prev, [imdb]: f }))).catch(() => {});
        });
        return () => { alive = false; };
    }, [ids]);
    return films;
};

/* "Fight Club · Adit's Cinema" in the browser tab; just the site name when there's no title yet. */
export const useTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} · Adit's Cinema` : "Adit's Cinema";
    }, [title]);
};

/* Map of TMDb film id -> review_id for the films Adit has reviewed. */
export const useReviewed = () => {
    const [map, setMap] = useState(() => new Map());
    useEffect(() => {
        let alive = true;
        reviewedFilms().then((m) => alive && setMap(m)).catch(() => {});
        return () => { alive = false; };
    }, []);
    return map;
};

/* Adit's Letterboxd diary: entries newest first, and a TMDb id -> latest entry map. */
export const useDiary = () => {
    const [diary, setDiary] = useState({ entries: [], ratings: [], watchedCount: 0, byFilm: new Map(), profileUrl: null, loaded: false });
    useEffect(() => {
        let alive = true;
        loadDiary().then((d) => alive && setDiary({
            entries: d.entries || [], byFilm: indexByFilm(d.entries || [], d.ratings || []), ratings: d.ratings || [], watchedCount: d.watchedCount, profileUrl: d.profileUrl, updated: d.updated, loaded: true,
        }));
        return () => { alive = false; };
    }, []);
    return diary;
};
