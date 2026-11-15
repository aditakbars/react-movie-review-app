import React from 'react';
import { starLabel, starText } from '../api/letterboxd';

/* Letterboxd-style stars, read out properly by screen readers. */
const Stars = ({ rating, className = 'stars' }) => (rating
    ? <span className={className} role="img" aria-label={starLabel(rating)}>{starText(rating)}</span>
    : null);

export default Stars;
