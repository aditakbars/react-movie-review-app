import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { useReviewed } from '../hooks';

/*
  The signature: films set as a printed programme listing. Hovering or focusing a
  row brings its poster into the projection panel beside the list.
  items: [{ key, to, title, sub, meta: [], image, tmdbId? }]
*/
const ProgrammeList = ({ items, ranked = false, label }) => {
    const [active, setActive] = useState(0);
    const reviewed = useReviewed();
    if (!items.length) return null;
    const shown = Math.min(active, items.length - 1);

    return (
        <div className="prog">
            <ol className={`prog__list${ranked ? ' prog__list--ranked' : ''}`} aria-label={label}>
                {items.map((it, i) => (
                    <li key={it.key} className={i === shown ? 'is-active' : undefined}>
                        <Link
                            to={it.to}
                            className="prog__row"
                            onMouseEnter={() => setActive(i)}
                            onFocus={() => setActive(i)}
                        >
                            {ranked && <span className="prog__rank">{i + 1}</span>}
                            {it.image
                                ? <img className="prog__thumb" src={it.image} alt="" loading="lazy" />
                                : <span className="prog__thumb" />}
                            <span className="prog__text">
                                <span className="prog__title">{it.title}</span>
                                {it.tmdbId && reviewed.has(it.tmdbId) && <span className="prog__badge">Reviewed</span>}
                                {it.sub && <span className="prog__sub">{it.sub}</span>}
                            </span>
                            <span className="prog__meta">
                                {it.meta.filter(Boolean).map((m, j) => <span key={j}>{m}</span>)}
                            </span>
                        </Link>
                    </li>
                ))}
            </ol>
            <div className="prog__screen" aria-hidden="true">
                {items.map((it, i) => it.image && (
                    <img key={it.key} src={it.image} alt="" className={i === shown ? 'is-shown' : undefined} loading={i < 2 ? 'eager' : 'lazy'} />
                ))}
            </div>
        </div>
    );
};

export default ProgrammeList;
