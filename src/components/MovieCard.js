import React from 'react';
import '../App.css';

const MovieCard = ({ movie, onClick }) => {
    return (
        <div>
            {movie && (
                <>
                <div id='movie-detail'>
                <h2>{movie.title}</h2>
                <div className='review-image-container'>
                <article className='moviecard-review'>
                    <div className='postercard' id='poster'> 
                        <img
                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : `https://source.unsplash.com/300x450/?${movie.title}`}
                            alt={movie.title}
                        />
                    </div>
                </article>
                </div>
                <p>Overview:<br/> {movie.overview}</p>
                <p>Genres: {movie.genres.map(genre => genre.name).join(', ')} </p>
                <p>Release Date: {movie.release_date}</p>
                <p>Runtime: {movie.runtime} minutes</p>
                <p>Vote Average: {movie.vote_average}</p>
                {movie.imdb_id && (
                    <p className='imdb-link'>
                        <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel='noreferrer'>Click here to go to the IMDB Page</a>
                    </p>
                )}
                </div>
                </>
            )}
        </div>
    );
};

export default MovieCard;
