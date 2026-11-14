import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiX, FiArrowRight } from 'react-icons/fi';
import '../App.css';

import ProgrammeList from '../components/ProgrammeList';
import MovieList from '../components/MovieList';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG = (path, size = 'w342') => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);
const opens = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '');

const Home = () => {
    const [lists, setLists] = useState({ now: [], trending: [], upcoming: [], top: [] });
    const [loaded, setLoaded] = useState(false);
    const [genres, setGenres] = useState([]);
    const [strand, setStrand] = useState(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const get = (path, params = {}) =>
            axios.get(`${TMDB_BASE}${path}`, { params: { api_key: TMDB_KEY, language: 'en-US', ...params } });
        Promise.all([
            get('/movie/now_playing'), get('/trending/movie/day'),
            get('/discover/movie', { sort_by: 'popularity.desc', 'primary_release_date.gte': new Date().toISOString().slice(0, 10), with_release_type: '2|3' }),
            get('/movie/top_rated'), get('/genre/movie/list'),
        ]).then(([now, trending, upcoming, top, g]) => {
            setLists({ now: now.data.results, trending: trending.data.results, upcoming: upcoming.data.results, top: top.data.results });
            setGenres(g.data.genres);
        }).catch(() => setError('The programme did not load. Check your connection, then refresh the page.'))
          .finally(() => setLoaded(true));
    }, []);

    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); setSearched(false); return; }
        try {
            const r = await axios.get(`${TMDB_BASE}/search/movie`, { params: { api_key: TMDB_KEY, query: q, include_adult: false } });
            setResults(r.data.results);
            setSearched(true);
        } catch {
            setError('The search did not go through. Try again in a moment.');
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => search(query), 400);
        return () => clearTimeout(t);
    }, [query, search]);

    const genreName = useMemo(() => Object.fromEntries(genres.map((g) => [g.id, g.name])), [genres]);
    const inStrand = (list) => (strand ? list.filter((m) => m.genre_ids?.includes(strand)) : list);
    const toItems = (list, meta) => list.map((m) => ({
        key: m.id, to: `/movies/${m.id}`, title: m.title, image: IMG(m.poster_path, 'w500'), meta: meta(m),
    }));

    const feature = lists.trending.find((m) => m.backdrop_path);
    const now = inStrand(lists.now);
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = inStrand(lists.upcoming).filter((m) => m.release_date >= today).sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
    const top = inStrand(lists.top).slice(0, 10);
    const genresOf = (m) => (m.genre_ids || []).slice(0, 2).map((id) => genreName[id]).filter(Boolean).join(', ');
    const strandName = strand && genreName[strand];

    return (
        <div>
            <NavBar />
            <main id="main">
                <header className="mast wrap">
                    <h1 className="mast__name">Adit's Cinema</h1>
                    <div className="mast__rule">
                        <p className="mast__lede">
                            Film reviews written in Bahasa Indonesia, honest and now and then goofy, set beside
                            everything on the city's screens this week.
                        </p>
                        <p className="mast__count">
                            {loaded && lists.now.length > 0 && <><span className="num">{lists.now.length}</span> films showing</>}
                        </p>
                    </div>
                </header>

                {error && (
                    <div className="wrap">
                        <p className="alert" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {error}
                            <button className="icon-btn" onClick={() => setError(null)} aria-label="Dismiss"><FiX /></button>
                        </p>
                    </div>
                )}

                {feature && (
                    <section className="feature wrap" aria-labelledby="feature-title">
                        <Link to={`/movies/${feature.id}`} className="feature__still">
                            <img src={IMG(feature.backdrop_path, 'w1280')} alt={`A still from ${feature.title}`} />
                        </Link>
                        <div className="feature__text">
                            <h2 id="feature-title">Tonight's feature: {feature.title}</h2>
                            <p>{feature.overview}</p>
                            <Link to={`/movies/${feature.id}`} className="arrow-link">
                                Read the programme note <FiArrowRight aria-hidden="true" />
                            </Link>
                        </div>
                    </section>
                )}

                <section className="block wrap" id="now-showing">
                    <div className="block__head">
                        <h2>Now showing</h2>
                        {genres.length > 0 && (
                            <div className="strands" role="group" aria-label="Filter by genre">
                                <button aria-pressed={strand === null} onClick={() => setStrand(null)}>All strands</button>
                                {genres.map((g) => (
                                    <button key={g.id} aria-pressed={strand === g.id} onClick={() => setStrand(strand === g.id ? null : g.id)}>
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {!loaded ? <LoadingSpinner /> : now.length
                        ? <ProgrammeList label="Now showing" items={toItems(now, (m) => [genresOf(m), m.release_date?.slice(0, 4), m.vote_average > 0 && m.vote_average.toFixed(1)])} />
                        : <p className="empty">No {strandName} films in cinemas this week. <button className="text-btn" onClick={() => setStrand(null)}>Show every strand</button></p>}
                </section>

                <section className="block wrap" id="opening-soon">
                    <div className="block__head"><h2>Opening soon</h2></div>
                    {!loaded ? <LoadingSpinner /> : upcoming.length
                        ? <ProgrammeList label="Opening soon" items={toItems(upcoming, (m) => [genresOf(m), `Opens ${opens(m.release_date)}`])} />
                        : <p className="empty">Nothing in the {strandName} strand opens soon.</p>}
                </section>

                <section className="block wrap" id="talked-about">
                    <div className="block__head"><h2>Most talked about today</h2></div>
                    {loaded && <MovieList movies={inStrand(lists.trending)} />}
                </section>

                <section className="block wrap" id="canon">
                    <div className="block__head"><h2>The canon, by audience vote</h2></div>
                    {!loaded ? <LoadingSpinner rows={10} /> : top.length
                        ? <ProgrammeList ranked label="Highest rated of all time" items={toItems(top, (m) => [m.release_date?.slice(0, 4), m.vote_average.toFixed(1)])} />
                        : <p className="empty">No {strandName} films in the top of the canon.</p>}
                </section>

                <section className="block wrap" id="archive">
                    <div className="block__head"><h2>Search the archive</h2></div>
                    <div className="archive">
                        <input
                            type="search"
                            aria-label="Film title"
                            placeholder="Any title, from Nosferatu to last week's release"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear the search"><FiX /></button>}
                    </div>
                    {searched && results.length === 0 && (
                        <p className="empty">The archive has nothing called "{query}". Check the spelling, or try the original-language title.</p>
                    )}
                    {results.length > 0 && <MovieList movies={results} limit={24} />}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
