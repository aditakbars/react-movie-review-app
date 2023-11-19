import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const ReviewList = ({ reviews }) => {
    if (!reviews) {
        return <main><article>Loading.........</article></main>;
    }
    return (
        <div className='card-container' id='movies-container'>
            {reviews.map((review) => (
                <article className='moviecard'>
                <div className='postercard' key={review.review_id}>
                    <Link to={`/reviews/${review.review_id}`}>
                        <img
                            src={review.poster_url}
                            alt={review.movie_title}
                        />
                    </Link>
                    <h3 className='movie-title'>{review.movie_title}</h3>
                </div>
                </article>
            ))}
        </div>
    );
};

export default ReviewList;
