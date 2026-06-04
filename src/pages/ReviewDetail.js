import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

import ReviewCard from '../components/ReviewCard';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await axios.get(
                    `https://my-movie-review.onrender.com/reviews/${id}`
                );
                setReview(response.data.data);
            } catch (err) {
                setError('Could not load this review. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReview();
    }, [id]);

    return (
        <div>
            <NavBar />
            <main>
                <button className='back-btn' onClick={() => navigate(-1)}>← Back</button>

                {error && <div className='error-banner'>⚠ {error}</div>}

                {isLoading ? (
                    <div className='card' style={{ textAlign: 'center', padding: '40px', color: '#6a8099' }}>
                        <div className='loading-spinner' style={{ margin: '0 auto 16px' }} />
                        Loading review...
                    </div>
                ) : (
                    <article className='card' id='welcome'>
                        <ReviewCard review={review} />
                    </article>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ReviewDetail;
