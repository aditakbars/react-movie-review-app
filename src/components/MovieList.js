import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

// A poster wall: posters only, titled underneath in the listing face.
const MovieList = ({ movies, limit = 16 }) => (
    <ul className="wall">
        {movies.filter((m) => m.poster_path).slice(0, limit).map((movie) => (
            <li key={movie.id}>
                <Link to={`/movies/${movie.id}`} className="wall__item">
                    <img src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} alt="" loading="lazy" />
                    <span className="wall__title">{movie.title}</span>
                    <span className="wall__year">{movie.release_date?.slice(0, 4)}</span>
                </Link>
            </li>
        ))}
    </ul>
);

export default MovieList;
