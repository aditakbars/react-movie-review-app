import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../App.css';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const fetchMovie = async () => {
        try {
            const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}`,
            {
                params: {
                api_key: '68614c1e94153665aa5592b00e68c7ac',
                language: 'en-US',
                },
            }
            );
            setMovie(response.data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
        };

        fetchMovie();
    }, [id]);

    return (
        <div>
        <NavBar />
        <main>
            <article className='card'>

            {movie && (
                <>
                <h3>{movie.title}</h3>
                <div className='review-image-container'>

                <article className='moviecard-review'>
                <div className='postercard'> 
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
                <p>Vote Average: {movie.vote_average}</p>
                {movie.imdb_id && (
                                <p className='imdb-link'><a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel='noreferrer'>Click here to go to the IMDB Page</a></p>
                            )}
                </>
            )}
            </article>
        </main>
        <Footer/>
        </div>
    );
};

export default MovieDetail;
