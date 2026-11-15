import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { useReviewed } from '../hooks';

/*
  Films hung as cinema-front billboards. Each board hangs from its top edge;
  on hover or focus it swings a little, like a board in the wind on its scaffold.
  The first board in a lead set is the big one. Films Adit has reviewed carry a
  painted "Reviewed" tab; `current` marks the film whose page this is.
*/
const Billboards = ({ movies, lead = false, limit = 12, note, current }) => {
    const reviewed = useReviewed();
    return (
        <ul className={`boards${lead ? ' boards--lead' : ''}`}>
            {movies.filter((m) => m.poster_path).slice(0, limit).map((m, i) => {
                const here = current === m.id;
                const body = (
                    <>
                        <span className="board__frame">
                            <img
                                src={`https://image.tmdb.org/t/p/${lead && i === 0 ? 'w780' : 'w342'}${m.poster_path}`}
                                alt=""
                                width="342" height="513"
                                loading={i < 4 ? 'eager' : 'lazy'}
                            />
                            {reviewed.has(m.id) && <span className="board__badge">Reviewed</span>}
                            {here && <span className="board__badge board__badge--here">You are here</span>}
                        </span>
                        <span className="board__plate">
                            <span className="board__title">{m.title}</span>
                            <span className="board__meta">
                                {note ? note(m, i) : m.release_date?.slice(0, 4)}
                                {m.vote_average > 0 && <span>Rated {m.vote_average.toFixed(1)}</span>}
                            </span>
                        </span>
                    </>
                );
                return (
                    <li key={m.id} className={lead && i === 0 ? 'boards__big' : undefined}>
                        {here
                            ? <div className="board board--here" aria-current="page">{body}</div>
                            : <Link to={`/movies/${m.id}`} className="board">{body}</Link>}
                    </li>
                );
            })}
        </ul>
    );
};

export default Billboards;
