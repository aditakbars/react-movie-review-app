import { useEffect, useState } from 'react';
import { cachedReviews, loadReviews, findFilm } from './api/reviews';

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
