import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../App.css';

import MovieCard from '../components/MovieCard';
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
                <MovieCard movie={movie} />
            </article>
        </main>
        <Footer/>
        </div>
    );
};

export default MovieDetail;
