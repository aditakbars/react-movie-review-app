import React from 'react';
import ProgrammeList from './ProgrammeList';

const ReviewList = ({ reviews }) => {
    if (!reviews?.length) return null;
    return (
        <ProgrammeList
            label="Reviews"
            items={reviews.map((r) => ({
                key: r.review_id, to: `/reviews/${r.review_id}`, title: r.movie_title,
                sub: r.review_title, image: r.poster_url, meta: [],
            }))}
        />
    );
};

export default ReviewList;
