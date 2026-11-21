import React, { useState } from 'react';
import { FiExternalLink, FiRepeat, FiHeart, FiShare } from 'react-icons/fi';
import Stars from './Stars';
import ShareCard from './ShareCard';
import '../App.css';

const longDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* "Adit on Letterboxd": his stars, when he watched it and his short review, from the diary. */
const LetterboxdTake = ({ entry }) => {
    const [reveal, setReveal] = useState(false);
    const [sharing, setSharing] = useState(false);
    if (!entry) return null;
    return (
        <section className="take" aria-labelledby="take-head">
            <h2 id="take-head" className="take__head">Adit on Letterboxd</h2>
            <p className="take__line">
                {entry.rating ? <Stars rating={entry.rating} className="stars stars--big" /> : <span>Logged, no rating</span>}
                {entry.watched && <span>Watched {longDate(entry.watched)}</span>}
                {entry.ratedOnly && <span>Rated on Letterboxd</span>}
                {entry.entryRating && entry.entryRating !== entry.rating && <span>{entry.entryRating} on the night</span>}
                {entry.rewatch && <span><FiRepeat aria-hidden="true" /> Rewatch</span>}
                {entry.liked && <span><FiHeart aria-hidden="true" /> Liked</span>}
                {entry.logs > 1 && <span>Logged {entry.logs} times</span>}
            </p>
            {entry.review && (entry.spoiler && !reveal
                ? <button className="text-btn" onClick={() => setReveal(true)}>This review has spoilers. Show it</button>
                : <blockquote className="take__review">{entry.review.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</blockquote>)}
            <div className="take__actions">
                {!entry.ratedOnly && entry.tmdbId && (
                    <button type="button" className="btn share-btn" onClick={() => setSharing(true)}><FiShare aria-hidden="true" /> Share as a Story</button>
                )}
                {entry.url && <a className="arrow-link" href={entry.url} target="_blank" rel="noreferrer">See it on Letterboxd <FiExternalLink aria-hidden="true" /></a>}
            </div>
            {sharing && <ShareCard entry={{ ...entry, rating: entry.entryRating ?? entry.rating }} onClose={() => setSharing(false)} />}
        </section>
    );
};

export default LetterboxdTake;
