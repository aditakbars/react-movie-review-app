import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { FiX, FiChevronLeft, FiChevronRight, FiDownload, FiShare } from 'react-icons/fi';
import { drawCard, loadFonts, loadImage, fileName } from '../share/drawCard';
import '../App.css';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const IMG = 'https://image.tmdb.org/t/p/';

/*
  The share preview: draws a diary entry as an Instagram Story card, lets you
  step through the film's stills, then hands the PNG to the phone's share menu
  (Instagram, WhatsApp…) or downloads it.
*/
const ShareCard = ({ entry, onClose }) => {
    const canvasRef = useRef(null);
    const closeRef = useRef(null);
    const [film, setFilm] = useState(null);
    const [stills, setStills] = useState([]);
    const [pick, setPick] = useState(0);
    const [blob, setBlob] = useState(null);
    const [status, setStatus] = useState('Painting the card…');

    // Film facts and stills for this entry
    useEffect(() => {
        let alive = true;
        axios.get(`https://api.themoviedb.org/3/movie/${entry.tmdbId}`, {
            params: { api_key: TMDB_KEY, language: 'en-US', append_to_response: 'credits,images', include_image_language: 'null' },
        }).then(({ data }) => {
            if (!alive) return;
            const backdrops = (data.images?.backdrops || []).map((b) => b.file_path);
            const list = [data.backdrop_path, ...backdrops.filter((p) => p !== data.backdrop_path)].filter(Boolean).slice(0, 12);
            setStills(list);
            setFilm({
                title: entry.title, year: entry.year,
                director: (data.credits?.crew || []).filter((c) => c.job === 'Director').map((c) => c.name).slice(0, 2).join(' & '),
                runtime: data.runtime, genres: (data.genres || []).map((x) => x.name),
                poster: entry.poster || data.poster_path,
            });
        }).catch(() => alive && setFilm({ title: entry.title, year: entry.year, poster: entry.poster }));
        return () => { alive = false; };
    }, [entry]);

    // Draw (again) whenever the film loads or another still is picked
    useEffect(() => {
        if (!film) return undefined;
        let alive = true;
        setBlob(null); setStatus('Painting the card…');
        Promise.all([loadFonts(), loadImage(stills[pick] && `${IMG}w1280${stills[pick]}`), loadImage(film.poster && `${IMG}w500${film.poster}`)])
            .then(([, still, poster]) => {
                if (!alive || !canvasRef.current) return;
                drawCard(canvasRef.current, {
                    ...film, rating: entry.rating, watched: entry.watched, liked: entry.liked, rewatch: entry.rewatch,
                    review: entry.spoiler ? null : entry.review,
                }, { still, poster }, undefined, new URLSearchParams(window.location.search).get('brand') || undefined, { name: new URLSearchParams(window.location.search).get('name') || undefined, date: new URLSearchParams(window.location.search).get('date') || undefined }); // TEMP: style preview
                canvasRef.current.toBlob((b) => { if (alive) { setBlob(b); setStatus(''); } }, 'image/png');
            });
        return () => { alive = false; };
    }, [film, stills, pick, entry]);

    // Escape closes; focus the close button; stop the page scrolling behind
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && stills.length > 1) setPick((i) => (i + 1) % stills.length);
            if (e.key === 'ArrowLeft' && stills.length > 1) setPick((i) => (i - 1 + stills.length) % stills.length);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [onClose, stills.length]);

    const file = useMemo(() => (blob ? new File([blob], fileName(entry), { type: 'image/png' }) : null), [blob, entry]);
    const canShareFile = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));

    const share = useCallback(async () => {
        try { await navigator.share({ files: [file], title: `${entry.title} · Adit's Cinema` }); } catch (e) { /* cancelled */ }
    }, [file, entry.title]);

    const download = useCallback(() => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName(entry);
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, [blob, entry]);

    return (
        <div className="screening sharecard" role="dialog" aria-modal="true" aria-label={`Share card for ${entry.title}`} onClick={onClose}>
            <div className="sharecard__box" onClick={(e) => e.stopPropagation()}>
                <button ref={closeRef} className="screening__close sharecard__close" onClick={onClose}>Close <FiX aria-hidden="true" /></button>
                <div className="sharecard__stage">
                    <canvas ref={canvasRef} className="sharecard__canvas" role="img"
                        aria-label={`Story card: ${entry.title}${entry.rating ? `, ${entry.rating} out of 5 stars` : ''}${entry.review && !entry.spoiler ? `, “${entry.review}”` : ''}`} />
                    {status && <p className="sharecard__status" role="status">{status}</p>}
                </div>
                {stills.length > 1 && (
                    <div className="sharecard__stills">
                        <button className="icon-btn" onClick={() => setPick((i) => (i - 1 + stills.length) % stills.length)} aria-label="Previous still"><FiChevronLeft aria-hidden="true" /></button>
                        <span className="num" aria-live="polite">Still {pick + 1} of {stills.length}</span>
                        <button className="icon-btn" onClick={() => setPick((i) => (i + 1) % stills.length)} aria-label="Next still"><FiChevronRight aria-hidden="true" /></button>
                    </div>
                )}
                {entry.spoiler && <p className="sharecard__note">Your review is left off this card because it has spoilers.</p>}
                <div className="sharecard__actions">
                    {canShareFile && <button className="btn" onClick={share} disabled={!blob}><FiShare aria-hidden="true" /> Share</button>}
                    <button className={canShareFile ? 'text-btn sharecard__dl' : 'btn'} onClick={download} disabled={!blob}><FiDownload aria-hidden="true" /> Download</button>
                </div>
            </div>
        </div>
    );
};

export default ShareCard;
