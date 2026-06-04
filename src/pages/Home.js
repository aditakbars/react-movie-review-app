import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

import MovieList from '../components/MovieList';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TMDB_KEY = '68614c1e94153665aa5592b00e68c7ac';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [trending, setTrending] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(
                    'https://api.themoviedb.org/3/movie/now_playing',
                    { params: { api_key: TMDB_KEY, language: 'en-US', page: 1 } }
                );
                setMovies(response.data.results);
            } catch (error) {
                console.error('Error fetching now playing:', error);
            }
        };

        const fetchTrending = async () => {
            try {
                const response = await axios.get(
                    'https://api.themoviedb.org/3/trending/movie/day',
                    { params: { api_key: TMDB_KEY, language: 'en-US' } }
                );
                setTrending(response.data.results);
            } catch (error) {
                console.error('Error fetching trending:', error);
            }
        };

        fetchMovies();
        fetchTrending();
    }, []);

    const searchMovies = async () => {
        if (!searchQuery.trim()) return;
        try {
            const response = await axios.get(
                'https://api.themoviedb.org/3/search/movie',
                { params: { api_key: TMDB_KEY, query: searchQuery, include_adult: false } }
            );
            setSearchResults(response.data.results);
        } catch (error) {
            console.error('Error searching movies:', error);
        }
    };

    const handleSearchKey = (e) => {
        if (e.key === 'Enter') searchMovies();
    };

    return (
        <div>
            <NavBar />
            <main>
                <article id="welcome">
                    <h2>Welcome</h2>
                    <p>
                        Hey there, welcome to my website! I've created this to share some of my movie reviews,
                        and trust me, they can get pretty goofy at times. So if you're in the mood for some
                        light-hearted, offbeat takes on some of my favorite films, you're in the right place.
                    </p>
                    <p>
                        Head over to the <strong>Reviews</strong> section to find my thoughts, rants, and maybe
                        a few raves about the films that have left an impression on me.
                    </p>
                    <p>
                        I've also added now-playing and trending movies from TMDb, plus a search feature below.
                        Enjoy your stay!
                    </p>
                </article>

                <br />

                <div className='section-heading'>
                    <h2>Now Playing</h2>
                </div>
                <MovieList movies={movies} />

                <div className='section-heading'>
                    <h2>Trending Today</h2>
                </div>
                <MovieList movies={trending} />

                <div className='section-heading'>
                    <h2>Search Movies</h2>
                </div>
                <article id='welcome'>
                    <div id='searchContainer'>
                        <input
                            id='searchBar'
                            type="text"
                            placeholder="Search for a movie..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKey}
                        />
                        <button onClick={searchMovies} id='searchButton'>Search</button>
                    </div>
                    {searchResults.length > 0 && (
                        <>
                            <h5 style={{ color: '#6a8099', marginTop: '16px', marginBottom: '0' }}>
                                {searchResults.length} results for "{searchQuery}"
                            </h5>
                            <MovieList movies={searchResults} />
                        </>
                    )}
                </article>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
