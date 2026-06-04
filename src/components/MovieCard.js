import React from 'react';
import '../App.css';

const MovieCard = ({ movie }) => {
    if (!movie) return null;

    const posterSrc = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : `https://source.unsplash.com/300x450/?${encodeURIComponent(movie.title)}`;

    return (
        <div id='movie-detail'>
            <h2>{movie.title}</h2>
            <div className='movie-detail-layout'>
                <div className='movie-detail-poster'>
                    <img src={posterSrc} alt={movie.title} />
                </div>
                <div className='movie-detail-info'>
                    {movie.genres && movie.genres.length > 0 && (
                        <div className='info-row'>
                            <span className='info-label'>Genres</span>
                            <div className='genre-tags'>
                                {movie.genres.map(genre => (
                                    <span key={genre.id} className='genre-tag'>{genre.name}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className='info-row'>
                        <span className='info-label'>Released</span>
                        <span>{movie.release_date}</span>
                    </div>
                    <div className='info-row'>
                        <span className='info-label'>Runtime</span>
                        <span>{movie.runtime} min</span>
                    </div>
                    {movie.vote_average > 0 && (
                        <div className='info-row'>
                            <span className='info-label'>Rating</span>
                            <span className='rating-display'>
                                ★ {movie.vote_average.toFixed(1)}
                                <span className='rating-sub'> / 10</span>
                            </span>
                        </div>
                    )}
                    <div className='info-row'>
                        <span className='info-label'>Overview</span>
                        <p className='overview-text'>{movie.overview}</p>
                    </div>
                    {movie.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target="_blank"
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
