import React from 'react';

const ReviewContent = ({ content, stills ,title}) => {
    // Memisahkan teks menjadi paragraf menggunakan karakter newline (\n)
    const paragraphs = content.split('\n');

    return (
        <div>
            {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))
            }
            {stills && (
                <div class="review-image-container">
                    <article class="moviecard-review">
                        <div class="postercard">
                            <img src={stills} alt={`${title} stills`}/>
                        </div>
                    </article>
                </div>
                )}
                <br/>
        </div>
    );
};

export default ReviewContent;