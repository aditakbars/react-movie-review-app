import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

import LoadingSpinner from './LoadingSpinner';

const ReviewList = ({ reviews }) => {
    if (!reviews) {
        <LoadingSpinner/>
    }
    return (
        <div className='card-container' id='movies-container'>
            {reviews.map((review) => (
                <article className='moviecard'>
                <div className='postercard' key={review.review_id}>
                    <Link to={`/reviews/${review.review_id}`}>
                        <img
                            id='poster-image'
                            src={review.poster_url}
                            alt={review.movie_title}
                        />
                    </Link>
                </div>
                <h3 className='movie-title'>{review.movie_title}</h3>
                </article>
            ))}
        </div>
    );
};

export default ReviewList;
