import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

import MovieList from '../components/MovieList';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [trending, setTrending] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [nowPlaying, trendingRes, genreRes] = await Promise.all([
                    axios.get(`${TMDB_BASE}/movie/now_playing`, {
                        params: { api_key: TMDB_KEY, language: 'en-US', page: 1 },
                    }),
                    axios.get(`${TMDB_BASE}/trending/movie/day`, {
                        params: { api_key: TMDB_KEY, language: 'en-US' },
                    }),
                    axios.get(`${TMDB_BASE}/genre/movie/list`, {
                        params: { api_key: TMDB_KEY },
                    }),
                ]);
                setMovies(nowPlaying.data.results);
                setTrending(trendingRes.data.results);
                setGenres(genreRes.data.genres);
            } catch (err) {
                setError('Failed to load movies. Check your connection and try refreshing.');
            }
        };
        fetchAll();
    }, []);

    const searchMovies = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }
        try {
            const response = await axios.get(`${TMDB_BASE}/search/movie`, {
                params: { api_key: TMDB_KEY, query, include_adult: false },
            });
            setSearchResults(response.data.results);
            setHasSearched(true);
        } catch (err) {
            setError('Search failed. Please try again.');
        }
    }, []);

    // Debounce: fire search 400ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => searchMovies(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery, searchMovies]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleGenre = (id) => setSelectedGenre(prev => prev === id ? null : id);

    const filterByGenre = (list) =>
        selectedGenre ? list.filter(m => m.genre_ids?.includes(selectedGenre)) : list;

    const filteredMovies = filterByGenre(movies);
    const filteredTrending = filterByGenre(trending);

    return (
        <div>
            <NavBar />
            <main>
                {error && (
                    <div className='error-banner'>
                        ⚠ {error}
                        <button className='error-dismiss' onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                <article id="welcome">
                    <h2>Welcome</h2>
                    <p>
                        Hey there, welcome to my website! I've created this to share some of my movie reviews,
                        and trust me, they can get pretty goofy at times. Head over to the{' '}
                        <strong>Reviews</strong> section to find my thoughts, rants, and maybe a few raves
                        about the films that have left an impression on me.
                    </p>
                    <p>
                        I've also added now-playing and trending movies from TMDb, plus a search feature below.
                        Enjoy your stay!
                    </p>
                </article>

                {/* Genre filter */}
                {genres.length > 0 && (
                    <div className='genre-filter'>
                        <button
                            className={`genre-btn${selectedGenre === null ? ' active' : ''}`}
                            onClick={() => setSelectedGenre(null)}
                        >All</button>
                        {genres.map(g => (
                            <button
                                key={g.id}
                                className={`genre-btn${selectedGenre === g.id ? ' active' : ''}`}
                                onClick={() => handleGenre(g.id)}
                            >{g.name}</button>
                        ))}
                    </div>
                )}

                <div className='section-heading'>
                    <h2>Now Playing</h2>
                    {selectedGenre && (
                        <span className='filter-count'>{filteredMovies.length} films</span>
                    )}
                </div>
                {filteredMovies.length > 0
                    ? <MovieList movies={filteredMovies} />
                    : selectedGenre && <p className='empty-state'>No now-playing movies in this genre.</p>
                }

                <div className='section-heading'>
                    <h2>Trending Today</h2>
                    {selectedGenre && (
                        <span className='filter-count'>{filteredTrending.length} films</span>
                    )}
                </div>
                {filteredTrending.length > 0
                    ? <MovieList movies={filteredTrending} />
                    : selectedGenre && <p className='empty-state'>No trending movies in this genre.</p>
                }

                <div className='section-heading'>
                    <h2>Search Movies</h2>
                </div>
                <article id='welcome'>
                    <div id='searchContainer'>
                        <input
                            id='searchBar'
                            type="text"
                            placeholder="Type to search movies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className='search-clear' onClick={clearSearch} title="Clear search">✕</button>
                        )}
                    </div>

                    {hasSearched && searchResults.length === 0 && (
                        <div className='empty-state'>
                            No movies found for <strong>"{searchQuery}"</strong>. Try a different title.
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <>
                            <p className='search-count'>
                                {searchResults.length} results for "{searchQuery}"
                            </p>
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
