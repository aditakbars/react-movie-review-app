import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';

//components
import ReviewList from "../components/ReviewList";
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';


const Reviews = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(
                    'https://my-movie-review.onrender.com/reviews'
                );
                setReviews(response.data.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, []);

    return(
        <div>
            <NavBar/>
            <main>
                <article>
                <div className='content' id='reviews'>
                    <ReviewList reviews={reviews}/>
                </div>
                </article>
                </main>
            <Footer/>
        </div>
    )

}

export default Reviews;