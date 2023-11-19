import React from 'react';
import '../App.css';

const ReviewCard = ({ review, onClick }) => {
    return (
        <div>
            {review && (
                <>
                <h3>{review.review_title}</h3>
                <h6>by Aditya Akbar</h6>
                <div className='review-image-container'>
                <article className='moviecard-review'>
                    <div className='postercard'> 
                        <img
                            src={review.poster_url}
                            alt={review.movie_title}
                        />
                    </div>
                </article>
                </div>
                <p>{review.review_content}</p>
                {review.imdb_id && (
                    <p className='imdb-link'>
                        <a href={`https://www.imdb.com/title/${review.imdb_id}`} target="_blank" rel='noreferrer'>Click here to go to the IMDB Page</a>
                    </p>
                )}
                </>
            )}
        </div>
    );
};

export default ReviewCard;
