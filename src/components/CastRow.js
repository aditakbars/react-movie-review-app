import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import '../App.css';

// Cast set as programme credits: name, then the part, with a small portrait.
const CastRow = ({ cast }) => (
    <ul className="credits">
        {cast.slice(0, 14).map((a) => (
            <li key={a.cast_id ?? a.id}>
                <Link to={`/actors/${a.id}`} className="credits__row">
                    {a.profile_path
                        ? <img src={`https://image.tmdb.org/t/p/w185${a.profile_path}`} alt="" loading="lazy" />
                        : <span className="credits__blank"><FaUser aria-hidden="true" /></span>}
                    <span className="credits__name">{a.name}</span>
                    <span className="credits__part">{a.character}</span>
                </Link>
            </li>
        ))}
    </ul>
);

export default CastRow;
