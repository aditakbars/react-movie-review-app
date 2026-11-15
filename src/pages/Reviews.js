import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import '../App.css';

import ReviewList from '../components/ReviewList';
import LoadingSpinner from '../components/LoadingSpinner';
import WarmingUp from '../components/WarmingUp';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useReviews, useFilms, useTitle } from '../hooks';

const Reviews = () => {
    useTitle('Reviews');
    const { reviews, loading, slow, error } = useReviews();
    const films = useFilms(reviews);
    const has = reviews?.length > 0;

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
                    <Link className="arrow-link" to="/diary">Shorter takes, in English: my Letterboxd diary <FiArrowRight aria-hidden="true" /></Link>
                </header>
                {error && !has && (
                    <p className="alert" role="alert"><FiAlertCircle aria-hidden="true" /> {navigator.onLine === false ? "You're offline, and this device hasn't saved the reviews yet." : 'The reviews did not load. The server may still be waking; refresh in a moment.'}</p>
                )}
                {has && <ReviewList reviews={reviews} films={films} />}
                {!has && loading && (slow ? <WarmingUp /> : <LoadingSpinner />)}
                {!has && !loading && !error && <p className="empty">No reviews yet.</p>}
            </main>
            <Footer />
        </div>
    );
};

export default Reviews;
