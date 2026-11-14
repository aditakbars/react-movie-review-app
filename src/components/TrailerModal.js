import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import '../App.css';

const TrailerModal = ({ videoKey, title, onClose }) => {
    const closeRef = useRef(null);
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [onClose]);

    return (
        <div className="screening" role="dialog" aria-modal="true" aria-label={`${title || 'Film'} trailer`} onClick={onClose}>
            <div className="screening__frame" onClick={(e) => e.stopPropagation()}>
                <button ref={closeRef} className="screening__close" onClick={onClose}>Close <FiX aria-hidden="true" /></button>
                <iframe
                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                    title={`${title || 'Film'} trailer`}
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export default TrailerModal;
