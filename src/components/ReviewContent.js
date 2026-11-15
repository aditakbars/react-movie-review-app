import React from 'react';

const ReviewContent = ({ content, stills, title }) => {
    const paragraphs = (content || '').split('\n').filter((p) => p.trim());
    const middle = Math.ceil(paragraphs.length / 2);
    return (
        <div className="prose prose--review">
            {paragraphs.slice(0, middle).map((p, i) => <p key={i}>{p}</p>)}
            {stills && (
                <figure className="review__still">
                    <img src={stills} alt={`A still from ${title}`} />
                </figure>
            )}
            {paragraphs.slice(middle).map((p, i) => <p key={middle + i}>{p}</p>)}
        </div>
    );
};

export default ReviewContent;
