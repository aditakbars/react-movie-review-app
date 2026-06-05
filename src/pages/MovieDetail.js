import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

import MovieCard from '../components/MovieCard';
import MovieList from '../components/MovieList';
import CastRow from '../components/CastRow';
import WatchProviders from '../components/WatchProviders';
import TrailerModal from '../components/TrailerModal';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        setMovie(null);
        window.scrollTo(0, 0);

        const fetchMovie = async () => {
            try {
                const response = await axios.get(`${TMDB_BASE}/movie/${id}`, {
                    params: {
                        api_key: TMDB_KEY,
                        language: 'en-US',
                        append_to_response: 'credits,videos,watch/providers,release_dates,recommendations,similar',
                    },
                });
                setMovie(response.data);
            } catch {
                setError('Could not load this movie. It may not exist or the service is unavailable.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovie();
    }, [id]);

    // Extract everything from the single append_to_response call
    const cast = movie?.credits?.cast?.slice(0, 16) || [];
    const crew = movie?.credits?.crew || [];
    const videos = movie?.videos?.results || [];
    const watchProviders = movie?.['watch/providers']?.results || {};
    const releaseDates = movie?.release_dates?.results || [];
    const recommendations = movie?.recommendations?.results?.slice(0, 12) || [];
    const similar = movie?.similar?.results?.slice(0, 12) || [];

    const trailer = videos.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube')
        || videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
        || videos.find(v => v.site === 'YouTube');

    const certification = releaseDates
        .find(r => r.iso_3166_1 === 'US')
        ?.release_dates
        ?.find(rd => rd.certification)
        ?.certification || '';

    const director = crew.find(c => c.job === 'Director');

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
                ) : movie && (
                    <>
                        <article className='card' id='welcome'>
                            <MovieCard
                                movie={movie}
                                certification={certification}
                                director={director}
                                trailer={trailer}
                                onTrailerClick={() => setShowTrailer(true)}
                            />
                        </article>

                        <WatchProviders providers={watchProviders} />

                        {cast.length > 0 && (
                            <>
                                <div className='section-heading'><h2>Cast & Crew</h2></div>
                                <CastRow cast={cast} crew={crew} />
                            </>
                        )}

                        {recommendations.length > 0 && (
                            <>
                                <div className='section-heading'><h2>Recommended</h2></div>
                                <MovieList movies={recommendations} />
                            </>
                        )}

                        {similar.length > 0 && (
                            <>
                                <div className='section-heading'><h2>Similar Movies</h2></div>
                                <MovieList movies={similar} />
                            </>
                        )}
                    </>
                )}

                {showTrailer && trailer && (
                    <TrailerModal videoKey={trailer.key} onClose={() => setShowTrailer(false)} />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MovieDetail;
