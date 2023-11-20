import React from 'react';
import '../App.css';

const LoadingSpinner = () => {
    const placeholders = Array.from({ length: 6 }, (_, index) => (
        <div className="moviecard" key={index}>
        <div className="postercard placeholder">
            <div className="loading-spinner"></div>
        </div>
        <h3 className="movie-title placeholder">Loading...</h3>
        </div>
    ));

    return <div className="card-container" id="movies-container">{placeholders}</div>;
};

export default LoadingSpinner;