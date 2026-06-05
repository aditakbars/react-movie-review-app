import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

import MovieList from '../components/MovieList';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const ActorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [person, setPerson] = useState(null);
    const [filmography, setFilmography] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullBio, setShowFullBio] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const fetch = async () => {
            try {
                const response = await axios.get(`${TMDB_BASE}/person/${id}`, {
                    params: {
                        api_key: TMDB_KEY,
                        append_to_response: 'movie_credits',
                    },
                });
                setPerson(response.data);
                const cast = response.data.movie_credits?.cast || [];
                setFilmography(
                    cast
                        .filter(m => m.poster_path)
                        .sort((a, b) => b.popularity - a.popularity)
                        .slice(0, 24)
                );
            } catch {
                setError('Could not load this person. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [id]);

    const BIO_LIMIT = 500;
    const bio = person?.biography || '';
    const shortBio = bio.length > BIO_LIMIT ? bio.slice(0, BIO_LIMIT) + '…' : bio;

    return (
        <div>
            <NavBar />
            <main>
                <button className='back-btn' onClick={() => navigate(-1)}>← Back</button>

                {error && <div className='error-banner'>⚠ {error}</div>}

                {isLoading ? (
                    <div className='detail-skeleton'>
                        <div className='detail-skeleton-poster' style={{ height: '320px', width: '213px', borderRadius: '50%' }} />
                        <div className='detail-skeleton-info'>
                            <div className='skeleton-line wide' style={{ height: '24px' }} />
                            <div className='skeleton-line medium' />
                            <div className='skeleton-line short' />
                            <div className='skeleton-line full' />
                            <div className='skeleton-line full' />
                            <div className='skeleton-line full' />
                        </div>
                    </div>
                ) : person && (
                    <article className='card'>
                        <div className='actor-profile-layout'>
                            <div className='actor-profile-photo'>
                                {person.profile_path
                                    ? <img src={`https://image.tmdb.org/t/p/w300${person.profile_path}`} alt={person.name} />
                                    : <div className='actor-profile-placeholder'>👤</div>
                                }
                            </div>
                            <div className='actor-profile-info'>
                                <h2 style={{ marginTop: 0 }}>{person.name}</h2>

                                {person.known_for_department && (
                                    <div className='info-row'>
                                        <span className='info-label'>Known for</span>
                                        <span>{person.known_for_department}</span>
                                    </div>
                                )}
                                {person.birthday && (
                                    <div className='info-row'>
                                        <span className='info-label'>Born</span>
                                        <span>
                                            {person.birthday}
                                            {person.place_of_birth ? ` · ${person.place_of_birth}` : ''}
                                        </span>
                                    </div>
                                )}
                                {person.deathday && (
                                    <div className='info-row'>
                                        <span className='info-label'>Died</span>
                                        <span>{person.deathday}</span>
                                    </div>
                                )}

                                {bio && (
                                    <div className='bio-section'>
                                        <p className='actor-bio'>
                                            {showFullBio ? bio : shortBio}
                                        </p>
                                        {bio.length > BIO_LIMIT && (
                                            <button
                                                className='bio-toggle'
                                                onClick={() => setShowFullBio(p => !p)}
                                            >
                                                {showFullBio ? 'Show less' : 'Read more'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                )}

                {filmography.length > 0 && (
                    <>
                        <div className='section-heading'>
                            <h2>Filmography</h2>
                            <span className='filter-count'>{filmography.length} films</span>
                        </div>
                        <MovieList movies={filmography} />
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ActorDetail;
