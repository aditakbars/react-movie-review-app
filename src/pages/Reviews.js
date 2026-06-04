import React, { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';

import ReviewList from "../components/ReviewList";
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from "../components/LoadingSpinner";

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('https://my-movie-review.onrender.com/reviews');
                setReviews(response.data.data);
            } catch (err) {
                setError('Could not load reviews. The server may be starting up — please try again in a moment.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <div>
            <NavBar />
            <main>
                <article className="card" id="welcome">
                    <h2>Movie Reviews</h2>
                    <p>
                        Here are a few of my movie reviews, but fair warning — they're all written in Bahasa Indonesia,
                        so please don't set your expectations too high when it comes to my writing skills (hehe).
                        I pour my heart and soul into these, sharing candid thoughts and feelings about films I've
                        watched, often in a delightfully unpretentious and occasionally goofy manner.
                    </p>
                </article>

                {error && (
                    <div className='error-banner' style={{ marginTop: '16px' }}>
                        ⚠ {error}
                        <button className='error-dismiss' onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    reviews.length > 0
                        ? <ReviewList reviews={reviews} />
                        : !error && (
                            <div className='empty-state'>No reviews found.</div>
                        )
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Reviews;
