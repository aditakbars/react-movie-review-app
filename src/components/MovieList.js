import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const MovieList = ({ movies }) => {
    return (
        <div className='card-container' id='movies-container'>
            {movies.map((movie) => (
                <article className='moviecard'>
                <div className='postercard' key={movie.id}>
                    <Link to={`/movies/${movie.id}`}>
                        <img
                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : `https://source.unsplash.com/300x450/?${movie.title}`}
                            alt={movie.title}
                        />
                    </Link>
                    <h3 className='movie-title'>
                        {movie.title} {movie.release_date ? `(${movie.release_date.slice(0, 4)})` : ''}
                    </h3>
                </div>
                </article>
            ))}
        </div>
    );
};

export default MovieList;
