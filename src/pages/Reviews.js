import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';

//components
import ReviewList from "../components/ReviewList";
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from "../components/LoadingSpinner";


const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(
                    'https://my-movie-review.onrender.com/reviews'
                );
                setReviews(response.data.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally{
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return(
        <div>
            <NavBar/>
            <main>
                <article className="card" id="welcome">
                <h2>Movie Review</h2>
                    <p>
                        Here are a few of my movie reviews, but fair warning, they're all written in Bahasa Indonesia,
                        so I kindly ask that you don't set your expectations too high when it comes to my writing skills (hehe).
                        While I may not be a professional critic, I pour my heart and soul into these reviews, sharing my candid thoughts and feelings about the films I've watched, often in a delightfully unpretentious and occasionally goofy manner.
                    </p>
                </article>
                {isLoading? (
                    <LoadingSpinner/>
                ) : (
                    <div className="card-container" id="movies-container">
                        <div className='content' id='reviews'>
                            <ReviewList reviews={reviews}/>
                        </div>
                    </div>
                    )
                }
            </main>
            <Footer/>
        </div>
    )

}

export default Reviews;