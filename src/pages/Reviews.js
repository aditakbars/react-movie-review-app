import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';

//components
import MovieList from '../components/MovieList';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';


const Reviews = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5000/reviews',
                );
                setReviews(response.data.results);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, []);

    return(
        <div>
            <NavBar/>
            
            <Footer/>
        </div>
    )

}

export default Reviews;