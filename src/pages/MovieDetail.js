import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiPlay, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import '../App.css';

import MovieCard from '../components/MovieCard';
import Billboards from '../components/Billboards';
import CastRow from '../components/CastRow';
import WatchProviders from '../components/WatchProviders';
import TrailerModal from '../components/TrailerModal';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { cachedReviews, loadReviews, reviewForImdb } from '../api/reviews';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [myReview, setMyReview] = useState(null);

    // Did Adit review this one? Cached list first, then the fresh one.
    useEffect(() => {
        if (!movie?.imdb_id) { setMyReview(null); return undefined; }
        let alive = true;
        setMyReview(reviewForImdb(movie.imdb_id, cachedReviews()));
        loadReviews().then((list) => alive && setMyReview(reviewForImdb(movie.imdb_id, list))).catch(() => {});
        return () => { alive = false; };
    }, [movie?.imdb_id]);

    useEffect(() => {
        setIsLoading(true); setError(null); setMovie(null);
        window.scrollTo(0, 0);
        axios.get(`${TMDB_BASE}/movie/${id}`, {
            params: { api_key: TMDB_KEY, language: 'en-US', append_to_response: 'credits,videos,watch/providers,release_dates,recommendations,similar' },
        }).then((r) => setMovie(r.data))
          .catch(() => setError('This film did not load. It may have left TMDb, or the service is down.'))
          .finally(() => setIsLoading(false));
    }, [id]);

    const crew = movie?.credits?.crew || [];
    const cast = movie?.credits?.cast || [];
    const videos = movie?.videos?.results || [];
    const trailer = videos.find((v) => v.type === 'Trailer' && v.official && v.site === 'YouTube')
        || videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || videos.find((v) => v.site === 'YouTube');
    const cert = (movie?.release_dates?.results || []).find((r) => r.iso_3166_1 === 'US')
        ?.release_dates?.find((rd) => rd.certification)?.certification;
    const runtime = movie?.runtime > 0 ? `${Math.floor(movie.runtime / 60)}h ${String(movie.runtime % 60).padStart(2, '0')}m` : null;

    return (
        <div>
            <NavBar />
            <main id="main" className="wrap">
                <button className="back" onClick={() => navigate(-1)}><FiArrowLeft aria-hidden="true" /> Back</button>
                {error && <p className="alert" role="alert"><FiAlertCircle aria-hidden="true" /> {error}</p>}
                {isLoading && <LoadingSpinner rows={4} />}

                {movie && (
                    <article className="note">
                        {movie.backdrop_path && (
                            <figure className="note__still">
                                <img src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} alt={`A still from ${movie.title}`} />
                            </figure>
                        )}
                        <header className="note__head">
                            <h1>{movie.title}</h1>
                            <p className="note__line">
                                {[movie.release_date?.slice(0, 4), runtime, movie.genres?.map((g) => g.name).join(', ')].filter(Boolean).map((t, i) => <span key={i}>{t}</span>)}
                                {cert && <span className="cert" title="US rating">{cert}</span>}
                            </p>
                            <div className="note__actions">
                                {trailer && <button className="btn" onClick={() => setShowTrailer(true)}><FiPlay aria-hidden="true" /> Play the trailer</button>}
                                {movie.imdb_id && (
                                    <a className="arrow-link" href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noreferrer">
                                        Open on IMDb <FiExternalLink aria-hidden="true" />
                                    </a>
                                )}
                            </div>
                        </header>

                        <div className="note__grid">
                            <aside className="note__side">
                                {movie.poster_path && <img className="note__poster" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`${movie.title} poster`} />}
                                <MovieCard movie={movie} crew={crew} />
                                <WatchProviders providers={movie['watch/providers']?.results} />
                            </aside>
                            <div className="note__body">
                                {myReview && (
                                    <Link className="reviewed" to={`/reviews/${myReview.review_id}`}>
                                        <span className="reviewed__label">Adit reviewed this</span>
                                        <span className="reviewed__title">{myReview.review_title}</span>
                                        <span className="reviewed__go">Read the review <FiArrowRight aria-hidden="true" /></span>
                                    </Link>
                                )}
                                {movie.tagline && <p className="note__tagline">{movie.tagline}</p>}
                                {movie.overview && <p className="note__overview">{movie.overview}</p>}
                                {cast.length > 0 && (
                                    <section aria-labelledby="cast-title">
                                        <h2 id="cast-title" className="note__h2">Cast</h2>
                                        <CastRow cast={cast} />
                                    </section>
                                )}
                            </div>
                        </div>
                    </article>
                )}

                {movie?.recommendations?.results?.length > 0 && (
                    <section className="block">
                        <div className="block__head"><h2>If you liked it</h2></div>
                        <Billboards movies={movie.recommendations.results} limit={8} />
                    </section>
                )}
                {movie?.similar?.results?.length > 0 && (
                    <section className="block">
                        <div className="block__head"><h2>Related films</h2></div>
                        <Billboards movies={movie.similar.results} limit={8} />
                    </section>
                )}

                {showTrailer && trailer && <TrailerModal videoKey={trailer.key} title={movie?.title} onClose={() => setShowTrailer(false)} />}
            </main>
            <Footer />
        </div>
    );
};

export default MovieDetail;
