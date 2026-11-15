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
import RegionSwitch from '../components/RegionSwitch';
import StreamingNow from '../components/StreamingNow';
import CastRow from '../components/CastRow';
import { useTitle, useDiary } from '../hooks';
import RecentlyWatched from '../components/RecentlyWatched';
import { REGIONS, useRegion } from '../region';

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
    const [region] = useRegion();
    useTitle(null);
    const diary = useDiary();
    const [lists, setLists] = useState({ now: [], trending: [], upcoming: [], top: [], local: [] });
    const [loaded, setLoaded] = useState(false);
    const [genres, setGenres] = useState([]);
    const [strand, setStrand] = useState(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [people, setPeople] = useState([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const get = (path, params = {}) =>
            axios.get(`${TMDB_BASE}${path}`, { params: { api_key: TMDB_KEY, language: 'en-US', ...params } });
        const today = new Date().toISOString().slice(0, 10);
        const daysFrom = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
        Promise.all([
            get('/movie/now_playing', { region }), get('/trending/movie/day'),
            get('/discover/movie', { region, sort_by: 'popularity.desc', 'release_date.gte': today, with_release_type: '2|3' }),
            get('/movie/top_rated'), get('/genre/movie/list'),
            region === 'ID'
                ? get('/discover/movie', { region, with_original_language: 'id', sort_by: 'popularity.desc', 'release_date.gte': daysFrom(-120), 'release_date.lte': daysFrom(90), with_release_type: '2|3' })
                : Promise.resolve({ data: { results: [] } }),
        ]).then(([now, trending, upcoming, top, g, local]) => {
            setLists({ now: now.data.results, trending: trending.data.results, upcoming: upcoming.data.results, top: top.data.results, local: local.data.results });
            setGenres(g.data.genres);
        }).catch(() => setError('The film boards did not load. Check your connection, then refresh the page.'))
          .finally(() => setLoaded(true));
    }, [region]);

    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); setPeople([]); setSearched(false); return; }
        try {
            const params = { api_key: TMDB_KEY, query: q, include_adult: false };
            const [films, persons] = await Promise.all([
                axios.get(`${TMDB_BASE}/search/movie`, { params }),
                axios.get(`${TMDB_BASE}/search/person`, { params }),
            ]);
            setResults(films.data.results);
            // Only people known for something, best known first.
            setPeople(persons.data.results
                .filter((p) => p.known_for?.length || p.profile_path)
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 6)
                .map((p) => ({
                    id: p.id, name: p.name, profile_path: p.profile_path,
                    character: [p.known_for_department === 'Acting' ? 'Actor' : p.known_for_department,
                        (p.known_for || []).map((k) => k.title || k.name).filter(Boolean).slice(0, 2).join(', ')].filter(Boolean).join(' · '),
                })));
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
                        <div className="mast__side">
                            <p className="mast__count">{loaded && lists.now.length > 0 && <><span className="num">{lists.now.length}</span> films showing in {REGIONS[region].name}</>}</p>
                            <RegionSwitch />
                        </div>
                    </div>
                </header>
                <section className="facade" aria-labelledby="feature-title">
                    <div className="wrap">
                        <p className="facade__marquee" aria-hidden="true">Tonight's feature</p>
                        {feature ? (
                            <Link to={`/movies/${feature.id}`} className="facade__board">
                                <span className="facade__frame">
                                    <img src={`https://image.tmdb.org/t/p/w1280${feature.backdrop_path}`} srcSet={`https://image.tmdb.org/t/p/w780${feature.backdrop_path} 780w, https://image.tmdb.org/t/p/w1280${feature.backdrop_path} 1280w`} sizes="(max-width: 1416px) 100vw, 1320px" fetchpriority="high" width="1280" height="720" alt={`A still from ${feature.title}`} />
                                </span>
                                <span className="facade__banner">
                                    <span id="feature-title" className="facade__title">{feature.title}</span>
                                    <span className="facade__go">See the film <FiArrowRight aria-hidden="true" /></span>
                                </span>
                            </Link>
                        ) : (
                            <div className="facade__board facade__board--rest" aria-hidden="true">
                                <span className="facade__frame" />
                                <span className="facade__banner"><span className="facade__title">&nbsp;</span><span className="facade__go">&nbsp;</span></span>
                            </div>
                        )}
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
                    <Heading id="now" local="Now showing" english={`In ${region === 'ID' ? 'Indonesian' : 'US'} cinemas this week`} />
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
                            key: m.id, tmdbId: m.id, to: `/movies/${m.id}`, title: m.title,
                            image: m.poster_path && `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                            meta: [(m.genre_ids || []).slice(0, 2).map((id) => genreName[id]).filter(Boolean).join(', '), m.release_date?.slice(0, 4), m.vote_average > 0 && m.vote_average.toFixed(1)],
                        }))} />
                        : <p className="empty">No {strandName} films are showing this week. <button className="text-btn" onClick={() => setStrand(null)}>Show them all</button></p>}
                </section>

                {diary.entries.length > 0 && (
                    <section className="block wrap" aria-labelledby="watched">
                        <Heading id="watched" local="Recently watched" english="Adit's latest logs on Letterboxd" />
                        <RecentlyWatched entries={diary.entries} />
                        <p className="more"><Link className="arrow-link" to="/diary">The whole diary <FiArrowRight aria-hidden="true" /></Link></p>
                    </section>
                )}

                <section className="block wrap" aria-labelledby="soon">
                    <Heading id="soon" local="Coming soon" english={`Opening in ${REGIONS[region].name} in the weeks ahead`} />
                    {!loaded ? <LoadingSpinner /> : upcoming.length
                        ? <Billboards movies={upcoming} limit={8} note={(m) => `Opens ${opens(m.release_date)}`} />
                        : <p className="empty">Nothing in {strandName} opens soon.</p>}
                </section>

                {region === 'ID' && loaded && inStrand(lists.local).some((m) => m.poster_path) && (
                    <section className="block wrap" aria-labelledby="local">
                        <Heading id="local" local="Made in Indonesia" english="Indonesian films in cinemas now and opening soon" />
                        <Billboards movies={inStrand(lists.local)} limit={8} note={(m) => (m.release_date > new Date().toISOString().slice(0, 10) ? `Opens ${opens(m.release_date)}` : m.release_date?.slice(0, 4))} />
                    </section>
                )}

                <section className="block wrap" aria-labelledby="stream">
                    <Heading id="stream" local="Streaming tonight" english={`What's on at home in ${REGIONS[region].name}`} />
                    <StreamingNow region={region} genre={strand} />
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
                                key: m.id, tmdbId: m.id, to: `/movies/${m.id}`, title: m.title,
                                image: m.poster_path && `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                                meta: [m.release_date?.slice(0, 4), `Rated ${m.vote_average.toFixed(1)}`],
                            }))}
                        />
                    )}
                </section>

                <section className="block wrap" aria-labelledby="find">
                    <Heading id="find" local="Find a film" english="Search every title, actor and director" />
                    <div className="archive">
                        <FiSearch aria-hidden="true" />
                        <input type="search" aria-label="Film title or person" placeholder="A film or a name, e.g. Joko Anwar" value={query} onChange={(e) => setQuery(e.target.value)} />
                        {query && <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear the search"><FiX /></button>}
                    </div>
                    {searched && results.length === 0 && people.length === 0 && <p className="empty">Nothing called "{query}". Try the original title, or a name.</p>}
                    {people.length > 0 && (
                        <div className="found">
                            <h3 className="found__head">People</h3>
                            <CastRow cast={people} />
                        </div>
                    )}
                    {results.length > 0 && (
                        <div className="found">
                            {people.length > 0 && <h3 className="found__head">Films</h3>}
                            <Billboards movies={results} limit={16} />
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
