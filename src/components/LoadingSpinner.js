import React from 'react';
import '../App.css';

const LoadingSpinner = ({ rows = 6 }) => (
    <div className="resting" aria-busy="true" aria-label="Loading">
        {Array.from({ length: rows }, (_, i) => <span key={i} className="resting__row" />)}
    </div>
);

export default LoadingSpinner;
