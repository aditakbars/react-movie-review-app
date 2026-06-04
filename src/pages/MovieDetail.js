import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

import MovieCard from '../components/MovieCard';
import MovieList from '../components/MovieList';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const fetchMovie = async () => {
            try {
                const response = await axios.get(`${TMDB_BASE}/movie/${id}`, {
                    params: { api_key: TMDB_KEY, language: 'en-US' },
                });
                setMovie(response.data);
            } catch (err) {
                setError('Could not load this movie. It may not exist or the service is unavailable.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSimilar = async () => {
            try {
                const response = await axios.get(`${TMDB_BASE}/movie/${id}/similar`, {
                    params: { api_key: TMDB_KEY, language: 'en-US' },
                });
                setSimilar(response.data.results);
            } catch {
                // Similar movies failing silently is acceptable
            }
        };

        fetchMovie();
        fetchSimilar();
    }, [id]);

    return (
        <div>
            <NavBar />
            <main>
                <button className='back-btn' onClick={() => navigate(-1)}>← Back</button>

                {error && <div className='error-banner'>⚠ {error}</div>}

                {isLoading ? (
                    <div className='detail-skeleton'>
                        <div className='detail-skeleton-poster' />
                        <div className='detail-skeleton-info'>
                            <div className='skeleton-line wide' />
                            <div className='skeleton-line medium' />
                            <div className='skeleton-line medium' />
                            <div className='skeleton-line short' />
                            <div className='skeleton-line full' />
                            <div className='skeleton-line full' />
                            <div className='skeleton-line medium' />
                        </div>
                    </div>
                ) : (
                    <article className='card' id='welcome'>
                        <MovieCard movie={movie} />
                    </article>
                )}

                {similar.length > 0 && (
                    <>
                        <div className='section-heading'>
                            <h2>Similar Movies</h2>
                        </div>
                        <MovieList movies={similar} />
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MovieDetail;
