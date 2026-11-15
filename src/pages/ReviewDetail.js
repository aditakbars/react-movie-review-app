import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import '../App.css';

import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(`https://my-movie-review.onrender.com/reviews/${id}`)
            .then((r) => setReview(r.data.data))
            .catch(() => setError('This review did not load. The server sleeps when idle, so give it 30 seconds and refresh.'))
            .finally(() => setIsLoading(false));
    }, [id]);

    return (
        <div>
            <NavBar />
            <main id="main" className="wrap">
                <button className="back" onClick={() => navigate(-1)}><FiArrowLeft aria-hidden="true" /> Back</button>
                {error && <p className="alert" role="alert"><FiAlertCircle aria-hidden="true" /> {error}</p>}
                {isLoading ? <LoadingSpinner rows={5} /> : <ReviewCard review={review} />}
            </main>
            <Footer />
        </div>
    );
};

export default ReviewDetail;
