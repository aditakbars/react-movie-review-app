import React, { useEffect, useState } from 'react';
import { getCritics } from '../api/omdb';
import '../App.css';

/* Three painted score plates: IMDb, Rotten Tomatoes, Metacritic. Renders nothing if OMDb has none. */
const CriticScores = ({ imdbId, heading }) => {
    const [scores, setScores] = useState(null);
    useEffect(() => {
        let alive = true;
        setScores(null);
        getCritics(imdbId).then((s) => alive && setScores(s)).catch(() => {});
        return () => { alive = false; };
    }, [imdbId]);
    if (!scores) return null;
    const plates = [
        scores.imdb && ['IMDb', scores.imdb, '/ 10'],
        scores.rt && ['Rotten Tomatoes', scores.rt, 'critics'],
        scores.meta && ['Metacritic', scores.meta, '/ 100'],
    ].filter(Boolean);
    return (
        <section className="critics" aria-label={heading || "The critics' scores"}>
            {heading && <h2 className="critics__head">{heading}</h2>}
            <ul className="critics__plates">
                {plates.map(([name, value, unit]) => (
                    <li key={name} className="critics__plate">
                        <span className="critics__value num">{value}</span>
                        <span className="critics__name">{name} <span className="critics__unit">{unit}</span></span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default CriticScores;
