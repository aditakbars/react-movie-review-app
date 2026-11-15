import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAlertCircle } from 'react-icons/fi';
import '../App.css';

import ReviewList from '../components/ReviewList';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('https://my-movie-review.onrender.com/reviews')
            .then((r) => setReviews(r.data.data))
            .catch(() => setError('The reviews did not load. The server sleeps when idle, so give it 30 seconds and refresh.'))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div>
            <NavBar />
            <main id="main" className="wrap">
                <header className="page-head">
                    <h1>Reviews</h1>
                    <p className="mast__lede">
                        Written in Bahasa Indonesia, so keep your expectations of my prose modest. I'm not a critic:
                        these are candid notes on films I've watched, unpretentious and occasionally goofy.
                    </p>
                </header>
                {error && <p className="alert" role="alert"><FiAlertCircle aria-hidden="true" /> {error}</p>}
                {isLoading ? <LoadingSpinner /> : reviews.length > 0
                    ? <ReviewList reviews={reviews} />
                    : !error && <p className="empty">No reviews yet.</p>}
            </main>
            <Footer />
        </div>
    );
};

export default Reviews;
