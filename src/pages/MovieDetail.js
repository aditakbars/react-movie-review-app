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
import CriticScores from '../components/CriticScores';
import Stills from '../components/Stills';
import { useTitle } from '../hooks';
import { REGIONS, regionalRelease, useRegion } from '../region';

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
    const [region] = useRegion();
    const [series, setSeries] = useState(null);
    const [inEnglish, setInEnglish] = useState(false);

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
            params: { api_key: TMDB_KEY, language: 'en-US', append_to_response: 'credits,videos,watch/providers,release_dates,recommendations,similar,keywords,translations,images', include_image_language: 'id,en,null' },
        }).then((r) => setMovie(r.data))
          .catch(() => setError('This film did not load. It may have left TMDb, or the service is down.'))
          .finally(() => setIsLoading(false));
    }, [id]);

    // The franchise, in release order.
    const collectionId = movie?.belongs_to_collection?.id;
    useEffect(() => {
        setSeries(null);
        if (!collectionId) return undefined;
        let alive = true;
        axios.get(`${TMDB_BASE}/collection/${collectionId}`, { params: { api_key: TMDB_KEY, language: 'en-US' } })
            .then((r) => alive && setSeries({
                name: r.data.name,
                parts: (r.data.parts || []).filter((m) => m.release_date).sort((a, b) => a.release_date.localeCompare(b.release_date)),
            }))
            .catch(() => {});
        return () => { alive = false; };
    }, [collectionId]);

    useEffect(() => { setInEnglish(false); }, [id]);
    useTitle(movie?.title);

    const crew = movie?.credits?.crew || [];
    const cast = movie?.credits?.cast || [];
    const videos = movie?.videos?.results || [];
    const trailer = videos.find((v) => v.type === 'Trailer' && v.official && v.site === 'YouTube')
        || videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || videos.find((v) => v.site === 'YouTube');
    const local = regionalRelease(movie, region);
    const cert = local.cert;
    // In Indonesia mode: the Indonesian title, synopsis and poster where TMDb has them.
    const idText = region === 'ID' ? movie?.translations?.translations?.find((t) => t.iso_639_1 === 'id')?.data : null;
    const idTitle = idText?.title && idText.title.toLowerCase() !== movie?.title?.toLowerCase() ? idText.title : null;
    const idOverview = idText?.overview && idText.overview !== movie?.overview ? idText.overview : null;
    const idPoster = region === 'ID' ? movie?.images?.posters?.find((p) => p.iso_639_1 === 'id')?.file_path : null;
    const poster = idPoster || movie?.poster_path;
    const keywords = (movie?.keywords?.keywords || []).slice(0, 12);
    const stills = (movie?.images?.backdrops || []).filter((b) => !b.iso_639_1 && b.file_path !== movie?.backdrop_path);
    const showOverview = idOverview && !inEnglish ? idOverview : movie?.overview;
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
                                <img src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} srcSet={`https://image.tmdb.org/t/p/w780${movie.backdrop_path} 780w, https://image.tmdb.org/t/p/w1280${movie.backdrop_path} 1280w`} sizes="(max-width: 1416px) 100vw, 1320px" fetchpriority="high" width="1280" height="720" alt={`A still from ${movie.title}`} />
                            </figure>
                        )}
                        <header className="note__head">
                            <h1>{movie.title}</h1>
                            {idTitle && <p className="note__local" lang="id">In Indonesia: <span>{idTitle}</span></p>}
                            <p className="note__line">
                                {[movie.release_date?.slice(0, 4), runtime, movie.genres?.map((g) => g.name).join(', ')].filter(Boolean).map((t, i) => <span key={i}>{t}</span>)}
                                {cert && <span className="cert" title={`${REGIONS[local.certRegion].board} rating, ${REGIONS[local.certRegion].short}`}>{local.certRegion !== region ? `US ${cert}` : cert}</span>}
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
                                {poster && <img className="note__poster" src={`https://image.tmdb.org/t/p/w500${poster}`} srcSet={`https://image.tmdb.org/t/p/w342${poster} 342w, https://image.tmdb.org/t/p/w500${poster} 500w`} sizes="(max-width: 639px) 220px, 320px" width="500" height="750" loading="lazy" alt={`${movie.title} poster`} />}
                                <MovieCard movie={movie} crew={crew} region={region} localDate={local.date} />
                                <WatchProviders providers={movie['watch/providers']?.results} region={region} />
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
                                {showOverview && (
                                    <div className="note__synopsis">
                                        <p className="note__overview" lang={idOverview && !inEnglish ? 'id' : 'en'}>{showOverview}</p>
                                        {idOverview && movie.overview && (
                                            <button className="text-btn" onClick={() => setInEnglish((v) => !v)}>
                                                {inEnglish ? 'Baca dalam Bahasa Indonesia' : 'Read it in English'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                <CriticScores imdbId={movie.imdb_id} audience={movie.vote_average} />
                                {keywords.length > 0 && (
                                    <ul className="tags" aria-label="Keywords">
                                        {keywords.map((k) => <li key={k.id}><Link to={`/keywords/${k.id}`}>{k.name}</Link></li>)}
                                    </ul>
                                )}
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

                {stills.length > 1 && (
                    <section className="block">
                        <div className="block__head"><h2>Stills</h2></div>
                        <Stills stills={stills} title={movie.title} />
                    </section>
                )}
                {series?.parts?.length > 1 && (
                    <section className="block">
                        <div className="block__head"><h2>The series, in order</h2><p className="block__en">{series.name}</p></div>
                        <Billboards movies={series.parts} limit={24} current={movie?.id} note={(m, i) => `Part ${i + 1} · ${m.release_date.slice(0, 4)}`} />
                    </section>
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
