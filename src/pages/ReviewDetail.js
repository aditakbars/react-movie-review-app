import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../App.css';

import ReviewCard from '../components/ReviewCard';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const ReviewDetail = () => {
    const { id } = useParams();
    const [review, setReview] = useState(null);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const response = await axios.get(
                    `https://my-movie-review.onrender.com/reviews/${id}`
                );
                setReview(response.data.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReview();
    }, [id]);

    return (
        <div>
        <NavBar />
        <main>
            <article className='card'>
                <ReviewCard review={review} />
            </article>
        </main>
        <Footer/>
        </div>
    );
};

export default ReviewDetail;
