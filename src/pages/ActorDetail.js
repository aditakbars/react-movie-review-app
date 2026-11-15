import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { FaUser } from 'react-icons/fa';
import '../App.css';

import ProgrammeList from '../components/ProgrammeList';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTitle } from '../hooks';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const BIO_LIMIT = 700;
const longDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const ActorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [person, setPerson] = useState(null);
    const [films, setFilms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fullBio, setFullBio] = useState(false);
    useTitle(person?.name);

    useEffect(() => {
        setIsLoading(true);
        window.scrollTo(0, 0);
        axios.get(`${TMDB_BASE}/person/${id}`, { params: { api_key: TMDB_KEY, append_to_response: 'movie_credits' } })
            .then((r) => {
                setPerson(r.data);
                const seen = new Set();
                const credits = [
                    ...(r.data.movie_credits?.cast || []).map((m) => ({ ...m, part: m.character })),
                    ...(r.data.movie_credits?.crew || []).map((m) => ({ ...m, part: m.job })),
                ];
                setFilms(credits
                    .filter((m) => m.release_date && m.poster_path && !seen.has(m.id) && seen.add(m.id))
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 30)
                    .sort((a, b) => b.release_date.localeCompare(a.release_date)));
            })
            .catch(() => setError('This person did not load. Try again in a moment.'))
            .finally(() => setIsLoading(false));
    }, [id]);

    const bio = person?.biography || '';
    const shownBio = fullBio || bio.length <= BIO_LIMIT ? bio : `${bio.slice(0, BIO_LIMIT).trim()}…`;

    return (
        <div>
            <NavBar />
            <main id="main" className="wrap">
                <button className="back" onClick={() => navigate(-1)}><FiArrowLeft aria-hidden="true" /> Back</button>
                {error && <p className="alert" role="alert"><FiAlertCircle aria-hidden="true" /> {error}</p>}
                {isLoading && <LoadingSpinner rows={4} />}
                {person && (
                    <article className="profile">
                        <div className="profile__photo">
                            {person.profile_path
                                ? <img src={`https://image.tmdb.org/t/p/h632${person.profile_path}`} alt={person.name} />
                                : <span className="credits__blank"><FaUser aria-hidden="true" /></span>}
                        </div>
                        <div className="profile__text">
                            <h1>{person.name}</h1>
                            <p className="note__line">
                                {[person.known_for_department, person.birthday && `Born ${longDate(person.birthday)}`, person.place_of_birth, person.deathday && `Died ${longDate(person.deathday)}`]
                                    .filter(Boolean).map((t, i) => <span key={i}>{t}</span>)}
                            </p>
                            {bio && (
                                <div className="prose">
                                    {shownBio.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                                    {bio.length > BIO_LIMIT && (
                                        <button className="text-btn" onClick={() => setFullBio((v) => !v)}>
                                            {fullBio ? 'Show less' : 'Read the full biography'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </article>
                )}
                {films.length > 0 && (
                    <section className="block">
                        <div className="block__head"><h2>Filmography</h2></div>
                        <ProgrammeList
                            label={`Films with ${person?.name}`}
                            items={films.map((m) => ({
                                key: m.id, tmdbId: m.id, to: `/movies/${m.id}`, title: m.title, sub: m.part,
                                image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, meta: [m.release_date.slice(0, 4)],
                            }))}
                        />
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ActorDetail;
