import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    const searchMovies = async () => {
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
                <article id="welcome">
                <h2>WELCOME</h2>
                <p>
                    Hey there, welcome to my website, folks! I've created this so-called website to share some of my movie reviews, and trust me, they can get pretty goofy at times (haha). So, if you're in the mood for some light-hearted, offbeat takes on some of my favorite films, you're in the right place. I've spent countless hours dissecting and pondering the intricacies of cinema, and I thought, "Why not turn these passionate ramblings into something others can enjoy?".
                </p>
                <p>
                    So, if you're curious about my unique perspective on the film world, just head over to the "Reviews" section in the navigation bar above.
                    There, you'll find a treasure trove of my thoughts, rants, and maybe a few raves about the movies that have left an impression on me.
                    <br/> 
                </p>
                <p>
                    By the way, I also have added the feature to show movies that are currently in theatres and you can also search a movie using the search feature below. So, Enjoy your stay!
                    <br/>
                </p>
                </article>
                <br/>
                <div className='content' id='reviews'>
                <article>
                <h1>Now Playing Movies</h1>
                <MovieList movies={movies} />
                
                <h1>Search Movies</h1>
                {/* Search Input */}
                <div id='searchContainer'>
                    <input
                        id='searchBar'
                        type="text"
                        placeholder="Search for a movie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div>
                        <button onClick={searchMovies} id='searchButton'>Search</button>
                    </div>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <>
                    <h4>Search Results</h4>
                    <MovieList movies={searchResults} />
                    </>
                )}

                </article>
                </div>
            </main>
        <Footer/>
        </div>
    );
};

export default Home;
