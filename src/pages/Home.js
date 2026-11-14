import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiX, FiArrowRight, FiSearch } from 'react-icons/fi';
import '../App.css';

import Billboards from '../components/Billboards';
import ProgrammeList from '../components/ProgrammeList';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const opens = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : '');

const Heading = ({ id, local, english }) => (
    <div className="sign">
        <h2 id={id}>{local}</h2>
        <p>{english}</p>
    </div>
);

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
        }).catch(() => setError('The film boards did not load. Check your connection, then refresh the page.'))
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
    const feature = lists.trending.find((m) => m.backdrop_path);
    const now = inStrand(lists.now);
    const upcoming = inStrand(lists.upcoming).slice().sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
    const top = inStrand(lists.top).slice(0, 10);
    const strandName = strand && genreName[strand];

    return (
        <div>
            <NavBar />
            <main id="main">
                <header className="mast wrap">
                    <h1 className="mast__name">Adit's Cinema</h1>
                    <div className="mast__rule">
                        <p className="mast__lede">Film reviews written in Bahasa Indonesia, hung beside everything on screen this week. Honest, sometimes goofy, never professional.</p>
                        <p className="mast__count">{loaded && lists.now.length > 0 && <><span className="num">{lists.now.length}</span> films showing</>}</p>
                    </div>
                </header>
                <section className="facade" aria-labelledby="feature-title">
                    <div className="wrap">
                        <p className="facade__marquee" aria-hidden="true">Tonight's feature</p>
                        {feature ? (
                            <Link to={`/movies/${feature.id}`} className="facade__board">
                                <span className="facade__frame">
                                    <img src={`https://image.tmdb.org/t/p/w1280${feature.backdrop_path}`} alt={`A still from ${feature.title}`} />
                                </span>
                                <span className="facade__banner">
                                    <span id="feature-title" className="facade__title">{feature.title}</span>
                                    <span className="facade__go">See the film <FiArrowRight aria-hidden="true" /></span>
                                </span>
                            </Link>
                        ) : <div className="facade__board facade__board--rest" />}
                    </div>
                </section>

                {error && (
                    <div className="wrap">
                        <p className="alert" role="alert">
                            <FiAlertCircle aria-hidden="true" /> {error}
                            <button className="icon-btn" onClick={() => setError(null)} aria-label="Dismiss"><FiX /></button>
                        </p>
                    </div>
                )}

                <section className="block wrap" aria-labelledby="now">
                    <Heading id="now" local="Now showing" english="In cinemas this week" />
                    {genres.length > 0 && (
                        <div className="strands" role="group" aria-label="Filter by genre">
                            <button aria-pressed={strand === null} onClick={() => setStrand(null)}>All</button>
                            {genres.map((g) => (
                                <button key={g.id} aria-pressed={strand === g.id} onClick={() => setStrand(strand === g.id ? null : g.id)}>{g.name}</button>
                            ))}
                        </div>
                    )}
                    {!loaded ? <LoadingSpinner /> : now.length
                        ? <ProgrammeList label="Now showing" items={now.map((m) => ({
                            key: m.id, to: `/movies/${m.id}`, title: m.title,
                            image: m.poster_path && `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                            meta: [(m.genre_ids || []).slice(0, 2).map((id) => genreName[id]).filter(Boolean).join(', '), m.release_date?.slice(0, 4), m.vote_average > 0 && m.vote_average.toFixed(1)],
                        }))} />
                        : <p className="empty">No {strandName} films are showing this week. <button className="text-btn" onClick={() => setStrand(null)}>Show them all</button></p>}
                </section>

                <section className="block wrap" aria-labelledby="soon">
                    <Heading id="soon" local="Coming soon" english="Opening in the weeks ahead" />
                    {!loaded ? <LoadingSpinner /> : upcoming.length
                        ? <Billboards movies={upcoming} limit={8} note={(m) => `Opens ${opens(m.release_date)}`} />
                        : <p className="empty">Nothing in {strandName} opens soon.</p>}
                </section>

                <section className="block wrap" aria-labelledby="buzz">
                    <Heading id="buzz" local="Everyone's talking" english="Trending today" />
                    {loaded && <Billboards movies={inStrand(lists.trending)} limit={8} />}
                </section>

                <section className="block wrap" aria-labelledby="best">
                    <Heading id="best" local="Best of all time" english="By audience vote" />
                    {loaded && top.length > 0 && (
                        <ProgrammeList
                            ranked
                            label="Best of all time"
                            items={top.map((m) => ({
                                key: m.id, to: `/movies/${m.id}`, title: m.title,
                                image: m.poster_path && `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                                meta: [m.release_date?.slice(0, 4), `Rated ${m.vote_average.toFixed(1)}`],
                            }))}
                        />
                    )}
                </section>

                <section className="block wrap" aria-labelledby="find">
                    <Heading id="find" local="Find a film" english="Search every title" />
                    <div className="archive">
                        <FiSearch aria-hidden="true" />
                        <input type="search" aria-label="Film title" placeholder="Film title, e.g. Satan's Slaves" value={query} onChange={(e) => setQuery(e.target.value)} />
                        {query && <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear the search"><FiX /></button>}
                    </div>
                    {searched && results.length === 0 && <p className="empty">Nothing called "{query}". Try the original title.</p>}
                    {results.length > 0 && <Billboards movies={results} limit={16} />}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
