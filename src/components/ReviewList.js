import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return null;
    }

    return (
        <div className='card-container' id='movies-container'>
            {reviews.map((review) => (
                <article className='moviecard' key={review.review_id}>
                    <Link to={`/reviews/${review.review_id}`} className='poster-link'>
                        <div className='postercard'>
                            <img
                                className='poster-img'
                                src={review.poster_url}
                                alt={review.movie_title}
                            />
                            <div className='movie-overlay'>
                                <h3 className='movie-title' title={review.movie_title}>
                                    {review.movie_title}
                                </h3>
                            </div>
                        </div>
                    </Link>
                </article>
            ))}
        </div>
    );
};

export default ReviewList;
