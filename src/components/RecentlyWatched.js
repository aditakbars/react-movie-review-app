import React from 'react';
import { Link } from 'react-router-dom';
import Stars from './Stars';
import '../App.css';

const day = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/* The latest Letterboxd logs as billboards, each with Adit's stars and a line of his review. */
const RecentlyWatched = ({ entries, limit = 8 }) => (
    <ul className="boards boards--diary">
        {entries.filter((e) => e.tmdbId && e.poster).slice(0, limit).map((e, i) => (
            <li key={e.id}>
                <Link to={`/movies/${e.tmdbId}`} className="board">
                    <span className="board__frame">
                        <img src={`https://image.tmdb.org/t/p/w342${e.poster}`} alt="" width="342" height="513" loading={i < 4 ? 'eager' : 'lazy'} />
                    </span>
                    <span className="board__plate">
                        <span className="board__title">{e.title}</span>
                        <span className="board__meta">
                            {e.rating ? <Stars rating={e.rating} /> : <span className="board__unrated">Logged</span>}
                            <span className="board__when">{day(e.watched)}</span>
                        </span>
                        {e.review && !e.spoiler && <span className="board__quote">{e.review}</span>}
                    </span>
                </Link>
            </li>
        ))}
    </ul>
);

export default RecentlyWatched;
