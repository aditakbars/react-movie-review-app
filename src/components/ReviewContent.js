import React from 'react';

const ReviewContent = ({ content, stills, title }) => {
    const paragraphs = content.split('\n');

    return (
        <div className='review-content'>
            {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
            {stills && (
                <div className="review-image-container">
                    <article className="moviecard-review">
                        <div className="postercard">
                            <img src={stills} alt={`${title} stills`} />
                        </div>
                    </article>
                </div>
            )}
        </div>
    );
};

export default ReviewContent;
