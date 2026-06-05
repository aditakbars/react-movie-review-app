import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const CERT_CLASS = { G: 'cert-G', U: 'cert-G', PG: 'cert-PG', 'PG-13': 'cert-PG13', R: 'cert-R', 'NC-17': 'cert-NC17' };

const fmt = (n) => n >= 1e9
    ? `$${(n / 1e9).toFixed(2)}B`
    : n >= 1e6
    ? `$${(n / 1e6).toFixed(0)}M`
    : `$${n.toLocaleString()}`;

const MovieCard = ({ movie, certification, director, trailer, onTrailerClick }) => {
    if (!movie) return null;

    const posterSrc = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : `https://source.unsplash.com/300x450/?${encodeURIComponent(movie.title)}`;

    const certClass = CERT_CLASS[certification] || 'cert-default';

    return (
        <div id='movie-detail'>
            <div className='movie-title-row'>
                <h2>{movie.title}</h2>
                {certification && (
                    <span className={`cert-badge ${certClass}`}>{certification}</span>
                )}
            </div>

            <div className='movie-detail-layout'>
                <div className='movie-detail-poster'>
                    <img src={posterSrc} alt={movie.title} />
                    {trailer && (
                        <button className='trailer-btn' onClick={onTrailerClick}>
                            ▶ Watch Trailer
                        </button>
                    )}
                </div>

                <div className='movie-detail-info'>
                    {movie.genres?.length > 0 && (
                        <div className='info-row'>
                            <span className='info-label'>Genres</span>
                            <div className='genre-tags'>
                                {movie.genres.map(g => (
                                    <span key={g.id} className='genre-tag'>{g.name}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {director && (
                        <div className='info-row'>
                            <span className='info-label'>Director</span>
                            <Link to={`/actors/${director.id}`} className='crew-link'>
                                {director.name}
                            </Link>
                        </div>
                    )}

                    {movie.release_date && (
                        <div className='info-row'>
                            <span className='info-label'>Released</span>
                            <span>{movie.release_date}</span>
                        </div>
                    )}

                    {movie.runtime > 0 && (
                        <div className='info-row'>
                            <span className='info-label'>Runtime</span>
                            <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                        </div>
                    )}

                    {movie.vote_average > 0 && (
                        <div className='info-row'>
                            <span className='info-label'>Rating</span>
                            <span className='rating-display'>
                                ★ {movie.vote_average.toFixed(1)}
                                <span className='rating-sub'> / 10 ({movie.vote_count?.toLocaleString()} votes)</span>
                            </span>
                        </div>
                    )}

                    {movie.budget > 0 && (
                        <div className='info-row'>
                            <span className='info-label'>Budget</span>
                            <span className='money-value'>{fmt(movie.budget)}</span>
                        </div>
                    )}

                    {movie.revenue > 0 && (
                        <div className='info-row'>
                            <span className='info-label'>Revenue</span>
                            <span className={`money-value ${movie.revenue > movie.budget ? 'profit' : 'loss'}`}>
                                {fmt(movie.revenue)}
                                {movie.budget > 0 && (
                                    <span className='money-sub'>
                                        {' '}({movie.revenue > movie.budget ? '+' : ''}{fmt(movie.revenue - movie.budget)})
                                    </span>
                                )}
                            </span>
                        </div>
                    )}

                    {movie.overview && (
                        <div className='info-row overview-row'>
                            <span className='info-label'>Overview</span>
                            <p className='overview-text'>{movie.overview}</p>
                        </div>
                    )}

                    {movie.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target='_blank'
                            rel='noreferrer'
                            className='imdb-btn'
                        >
                            View on IMDb
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
