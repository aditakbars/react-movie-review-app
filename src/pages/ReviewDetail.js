import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import '../App.css';

import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';
import WarmingUp from '../components/WarmingUp';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { cachedReview, loadReview } from '../api/reviews';
import { useTitle } from '../hooks';

const hasBody = (r) => (r && r.review_content ? r : null);

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(() => hasBody(cachedReview(id)));
    const [loading, setLoading] = useState(true);
    const [slow, setSlow] = useState(false);
    const [error, setError] = useState(false);
    useTitle(review ? `${review.review_title} (${review.movie_title})` : 'Review');

    useEffect(() => {
        let alive = true;
        window.scrollTo(0, 0);
        setReview(hasBody(cachedReview(id))); setLoading(true); setError(false); setSlow(false);
        const timer = window.setTimeout(() => alive && setSlow(true), 2500);
        loadReview(id)
            .then((r) => alive && r && setReview(r))
            .catch(() => alive && setError(true))
            .finally(() => { window.clearTimeout(timer); if (alive) { setLoading(false); setSlow(false); } });
        return () => { alive = false; window.clearTimeout(timer); };
    }, [id]);

    return (
        <div>
            <NavBar />
            <main id="main" className="wrap">
                <button className="back" onClick={() => navigate(-1)}><FiArrowLeft aria-hidden="true" /> Back</button>
                {error && !review && <p className="alert" role="alert"><FiAlertCircle aria-hidden="true" /> {navigator.onLine === false ? "You're offline, and this device hasn't saved this review yet." : 'This review did not load. The server may still be waking; refresh in a moment.'}</p>}
                {review ? <ReviewCard review={review} /> : loading && (slow ? <WarmingUp /> : <LoadingSpinner rows={5} />)}
            </main>
            <Footer />
        </div>
    );
};

export default ReviewDetail;
