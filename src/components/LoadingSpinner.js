import React from 'react';
import '../App.css';

const LoadingSpinner = () => {
    return (
        <div className="card-container" id="movies-container">
            {Array.from({ length: 8 }, (_, i) => (
                <div className="skeleton-card" key={i} />
            ))}
        </div>
    );
};

export default LoadingSpinner;
