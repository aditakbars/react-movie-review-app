import React from 'react';
import '../App.css';
import ReviewContent from './ReviewContent';

const ReviewCard = ({ review }) => {
    if (!review) return null;
    return (
        <article className="review">
            <header className="review__head">
                <p className="review__film">{review.movie_title}</p>
                <h1>{review.review_title}</h1>
                <p className="note__line"><span>Review by Aditya Akbar</span><span>In Bahasa Indonesia</span></p>
            </header>
            <img className="review__poster" src={review.poster_url} alt={`${review.movie_title} poster`} />
            <ReviewContent title={review.movie_title} content={review.review_content} stills={review.movie_stills} />
            {review.imdb_id && (
                <p className="review__end">
                    <a className="arrow-link" href={`https://www.imdb.com/title/${review.imdb_id}`} target="_blank" rel="noreferrer">
                        {review.movie_title} on IMDb
                    </a>
                </p>
            )}
        </article>
    );
};

export default ReviewCard;
