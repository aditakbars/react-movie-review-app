import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import '../App.css';
import ReviewContent from './ReviewContent';
import CriticScores from './CriticScores';
import { findFilm, readingTime } from '../api/reviews';

const ReviewCard = ({ review }) => {
    const [film, setFilm] = useState(null);
    useEffect(() => {
        let alive = true;
        setFilm(null);
        findFilm(review?.imdb_id).then((f) => alive && setFilm(f)).catch(() => {});
        return () => { alive = false; };
    }, [review?.imdb_id]);

    if (!review) return null;
    return (
        <article className="review">
            <header className="review__head">
                <p className="review__film">{review.movie_title}{film?.year && <span className="num"> ({film.year})</span>}</p>
                <h1>{review.review_title}</h1>
                <p className="note__line">
                    <span>Review by Aditya Akbar</span>
                    <span>In Bahasa Indonesia</span>
                    <span className="num">{readingTime(review.review_content)} min read</span>
                </p>
            </header>
            <img className="review__poster" src={review.poster_url} alt={`${review.movie_title} poster`} />
            <ReviewContent title={review.movie_title} content={review.review_content} stills={review.movie_stills} />
            <div className="review__end">
                <CriticScores imdbId={review.imdb_id} heading="What the critics said" />
                {film && (
                    <Link className="review__film-link" to={`/movies/${film.id}`}>
                        <span className="review__film-link-label">The film</span>
                        <span className="review__film-link-title">{review.movie_title}</span>
                        <span className="review__film-link-go">Trailer, cast and where to watch <FiArrowRight aria-hidden="true" /></span>
                    </Link>
                )}
                {review.imdb_id && (
                    <a className="arrow-link" href={`https://www.imdb.com/title/${review.imdb_id}`} target="_blank" rel="noreferrer">
                        {review.movie_title} on IMDb <FiExternalLink aria-hidden="true" />
                    </a>
                )}
            </div>
        </article>
    );
};

export default ReviewCard;
