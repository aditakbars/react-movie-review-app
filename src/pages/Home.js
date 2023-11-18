import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

//components
import MovieList from '../components/MovieList';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(
                    'https://api.themoviedb.org/3/movie/now_playing',
                    {
                        params: {
                            api_key: '68614c1e94153665aa5592b00e68c7ac',
                            language: 'en-US',
                            page: 1,
                        },
                    }
                );
                setMovies(response.data.results);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        fetchMovies();
    }, []);

    const handleSearch = async () => {
        try {
            const response = await axios.get(
                `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&include_adult=true&api_key=68614c1e94153665aa5592b00e68c7ac`
            );
    
            setSearchResults(response.data.results);
        } catch (error) {
            console.error('Error searching for movies:', error);
        }
    };

    return (
        <div>
        <NavBar/>
            <main>
                <article>

                <div className='content' id='reviews'>

                <h1>Now Playing Movies</h1>
                <MovieList movies={movies} />

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div>
                <button onClick={handleSearch}>Search</button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <>
                    <h2>Search Results</h2>
                    <MovieList movies={searchResults} />
                    </>
                )}

                </div>
                </article>
            </main>
        <Footer/>
        </div>
    );
};

export default Home;
