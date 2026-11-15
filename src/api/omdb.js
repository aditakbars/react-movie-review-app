import axios from 'axios';

/*
  OMDb: the critics' scores (IMDb, Rotten Tomatoes, Metacritic) for a film by its
  IMDb id. The free key allows 1,000 requests a day, so answers are kept for a week
  in localStorage and each film is only asked about once per device per week.
*/
const KEY = process.env.REACT_APP_OMDB_KEY;
const STORE = 'adits-cinema-omdb-v2';
const WEEK = 7 * 24 * 60 * 60 * 1000;

const read = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } };
const save = (all) => {
    try {
        const entries = Object.entries(all).sort((a, b) => b[1].at - a[1].at).slice(0, 300);
        localStorage.setItem(STORE, JSON.stringify(Object.fromEntries(entries)));
    } catch (e) { /* full or private */ }
};

const shape = (d) => {
    if (!d || d.Response === 'False') return null;
    const src = Object.fromEntries((d.Ratings || []).map((r) => [r.Source, r.Value]));
    const scores = {
        imdb: d.imdbRating && d.imdbRating !== 'N/A' ? d.imdbRating : null,
        rt: src['Rotten Tomatoes'] || null,
        meta: d.Metascore && d.Metascore !== 'N/A' ? d.Metascore : null,
        awards: d.Awards && d.Awards !== 'N/A' ? d.Awards : null,
    };
    return scores.imdb || scores.rt || scores.meta || scores.awards ? scores : null;
};

export const getCritics = async (imdbId) => {
    if (!imdbId || !KEY) return null;
    const all = read();
    if (all[imdbId] && Date.now() - all[imdbId].at < WEEK) return all[imdbId].scores;
    const r = await axios.get('https://www.omdbapi.com/', { params: { i: imdbId, apikey: KEY }, timeout: 8000 });
    const scores = shape(r.data);
    save({ ...read(), [imdbId]: { at: Date.now(), scores } });
    return scores;
};
