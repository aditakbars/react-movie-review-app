import React from 'react';
import ProgrammeList from './ProgrammeList';
import { readingTime } from '../api/reviews';

const ReviewList = ({ reviews, films = {} }) => {
    if (!reviews?.length) return null;
    return (
        <ProgrammeList
            label="Reviews"
            items={reviews.map((r) => {
                const film = films[r.imdb_id];
                return {
                    key: r.review_id, to: `/reviews/${r.review_id}`, title: r.movie_title,
                    sub: r.review_title, image: r.poster_url,
                    meta: [film?.year, r.review_content && `${readingTime(r.review_content)} min read`],
                };
            })}
        />
    );
};

export default ReviewList;
