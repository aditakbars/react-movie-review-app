import React, { useEffect } from 'react';
import '../App.css';

const TrailerModal = ({ videoKey, onClose }) => {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal-inner' onClick={(e) => e.stopPropagation()}>
                <button className='modal-close' onClick={onClose}>✕</button>
                <iframe
                    className='modal-iframe'
                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                    title="Movie Trailer"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export default TrailerModal;
