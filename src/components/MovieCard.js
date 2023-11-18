import React from 'react';
import '../App.css';

const MovieCard = ({ movie, onClick }) => {
    return (
        <div onClick={() => onClick(movie.id)} style={{ cursor: 'pointer' }}>
        <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} />
        <p>{movie.title}</p>
        </div>
    );
};

export default MovieCard;
