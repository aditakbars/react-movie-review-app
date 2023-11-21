import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../App.css';

import MovieCard from '../components/MovieCard';
import MovieList from '../components/MovieList';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [similar, setSimilar] = useState([]);

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

        const fetchSimilar = async () => {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/movie/${id}/similar`,
                    {
                        params: {
                            api_key: '68614c1e94153665aa5592b00e68c7ac',
                            language: 'en-US',
                        },
                    }
                );
                setSimilar(response.data.results);
            } catch (error) {
                console.error('Error fetching similar movie:', error);
            }
        };
        
        fetchMovie();
        fetchSimilar();
    }, [id]);

    return (
        <div>
            <NavBar />
            <main>
                <article className='card' id='welcome'>
                    <MovieCard movie={movie} />
                </article>
                {similar && (
                    <>
                    <br/>
                    <div className='content' id='reviews'>
                        <article id='welcome'>
                            <h2>Similar Movies</h2>
                            <MovieList movies={similar} />
                        </article>
                    </div>
                    </>
                )}
            </main>
            <Footer/>
        </div>
    );
};

export default MovieDetail;
