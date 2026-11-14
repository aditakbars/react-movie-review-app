import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

/*
  Films hung as cinema-front billboards. Each board hangs from its top edge;
  on hover or focus it swings a little, like a board in the wind on its scaffold.
  The first board in a lead set is the big one.
*/
const Billboards = ({ movies, lead = false, limit = 12, note }) => (
    <ul className={`boards${lead ? ' boards--lead' : ''}`}>
        {movies.filter((m) => m.poster_path).slice(0, limit).map((m, i) => (
            <li key={m.id} className={lead && i === 0 ? 'boards__big' : undefined}>
                <Link to={`/movies/${m.id}`} className="board">
                    <span className="board__frame">
                        <img
                            src={`https://image.tmdb.org/t/p/${lead && i === 0 ? 'w780' : 'w342'}${m.poster_path}`}
                            alt=""
                            loading={i < 4 ? 'eager' : 'lazy'}
                        />
                    </span>
                    <span className="board__plate">
                        <span className="board__title">{m.title}</span>
                        <span className="board__meta">
                            {note ? note(m) : m.release_date?.slice(0, 4)}
                            {m.vote_average > 0 && <span>Nilai {m.vote_average.toFixed(1)}</span>}
                        </span>
                    </span>
                </Link>
            </li>
        ))}
    </ul>
);

export default Billboards;
