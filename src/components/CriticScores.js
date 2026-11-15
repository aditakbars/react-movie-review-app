import React, { useEffect, useState } from 'react';
import { getCritics } from '../api/omdb';
import '../App.css';

/*
  Painted score plates (IMDb, Rotten Tomatoes, Metacritic), the film's awards line,
  and a note when critics and audiences (TMDb's vote) split by 20 points or more.
*/
const verdict = (rt, audience) => {
    const critics = parseInt(rt, 10);
    if (!critics || !audience) return null;
    const crowd = Math.round(audience * 10);
    if (critics - crowd >= 20) return `Critics loved it more than audiences did: ${critics}% against ${crowd}%.`;
    if (crowd - critics >= 20) return `Audiences loved it more than critics did: ${crowd}% against ${critics}%.`;
    return null;
};

const CriticScores = ({ imdbId, heading, audience }) => {
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
    const split = verdict(scores.rt, audience);
    return (
        <section className="critics" aria-label={heading || "The critics' scores"}>
            {heading && <h2 className="critics__head">{heading}</h2>}
            {plates.length > 0 && (
                <ul className="critics__plates">
                    {plates.map(([name, value, unit]) => (
                        <li key={name} className="critics__plate">
                            <span className="critics__value num">{value}</span>
                            <span className="critics__name">{name} <span className="critics__unit">{unit}</span></span>
                        </li>
                    ))}
                </ul>
            )}
            {scores.awards && <p className="critics__awards">{scores.awards}</p>}
            {split && <p className="critics__split">{split}</p>}
        </section>
    );
};

export default CriticScores;
