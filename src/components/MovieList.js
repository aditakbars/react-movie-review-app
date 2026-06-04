import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const MovieList = ({ movies }) => {
    return (
        <div className='card-container' id='movies-container'>
            {movies.map((movie) => {
                const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
                const posterSrc = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : `https://source.unsplash.com/300x450/?${encodeURIComponent(movie.title)}`;

                return (
                    <article className='moviecard' key={movie.id}>
                        <Link to={`/movies/${movie.id}`} className='poster-link'>
                            <div className='postercard'>
                                <img
                                    className='poster-img'
                                    src={posterSrc}
                                    alt={movie.title}
                                />
                                <div className='movie-overlay'>
                                    <h3 className='movie-title' title={movie.title}>
                                        {movie.title}
                                        {year && <span className='movie-year'>{year}</span>}
                                    </h3>
                                    {movie.vote_average > 0 && (
                                        <span className='rating-badge'>
                                            ★ {movie.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </article>
                );
            })}
        </div>
    );
};

export default MovieList;
