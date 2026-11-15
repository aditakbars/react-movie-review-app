import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../App.css';

const IMG = 'https://image.tmdb.org/t/p/';

/* A contact sheet of stills; one opens large in the screening room, with arrow keys to step through. */
const Stills = ({ stills, title, limit = 9 }) => {
    const list = (stills || []).slice(0, limit);
    const [open, setOpen] = useState(null);
    const closeRef = useRef(null);
    const close = useCallback(() => setOpen(null), []);
    const step = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

    useEffect(() => {
        if (open === null) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [open, close, step]);

    if (list.length < 2) return null;
    return (
        <>
            <ul className="stills">
                {list.map((s, i) => (
                    <li key={s.file_path}>
                        <button type="button" className="stills__thumb" onClick={() => setOpen(i)} aria-label={`Open still ${i + 1} of ${list.length}`}>
                            <img src={`${IMG}w300${s.file_path}`} alt="" loading="lazy" width="300" height="169" />
                        </button>
                    </li>
                ))}
            </ul>
            {open !== null && (
                <div className="screening" role="dialog" aria-modal="true" aria-label={`Stills from ${title}`} onClick={close}>
                    <div className="screening__frame screening__frame--still" onClick={(e) => e.stopPropagation()}>
                        <button ref={closeRef} className="screening__close" onClick={close}>Close <FiX aria-hidden="true" /></button>
                        <img src={`${IMG}w1280${list[open].file_path}`} alt={`Still ${open + 1} of ${list.length} from ${title}`} />
                        <button className="stills__step stills__step--prev" onClick={() => step(-1)} aria-label="Previous still"><FiChevronLeft aria-hidden="true" /></button>
                        <button className="stills__step stills__step--next" onClick={() => step(1)} aria-label="Next still"><FiChevronRight aria-hidden="true" /></button>
                        <p className="stills__count num" aria-live="polite">{open + 1} / {list.length}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default Stills;
