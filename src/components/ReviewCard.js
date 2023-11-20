import React from 'react';
import '../App.css';

const ReviewCard = ({ review, onClick }) => {
    return (
        <div>
            {review && (
                <>
                <div id='detail-review'>
                <h2>{review.review_title}</h2>
                <h4>by Aditya Akbar</h4>
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
                </div>
                </>
            )}
        </div>
    );
};

export default ReviewCard;
