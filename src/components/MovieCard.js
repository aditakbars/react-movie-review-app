import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const fmt = (n) => (n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : `$${n.toLocaleString()}`);

// The programme card: the film's facts as a credits block.
const MovieCard = ({ movie, crew }) => {
    if (!movie) return null;
    const director = crew.filter((c) => c.job === 'Director');
    const writers = crew.filter((c) => c.department === 'Writing').slice(0, 3);
    const people = (list) => list.map((p, i) => (
        <span key={p.credit_id}><Link to={`/actors/${p.id}`}>{p.name}</Link>{i < list.length - 1 ? ', ' : ''}</span>
    ));

    const rows = [
        director.length > 0 && ['Directed by', people(director)],
        writers.length > 0 && ['Written by', people(writers)],
        movie.release_date && ['Released', new Date(movie.release_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
        movie.production_countries?.length > 0 && ['Country', movie.production_countries.map((c) => c.name).join(', ')],
        movie.vote_average > 0 && ['Audience', <span><span className="num">{movie.vote_average.toFixed(1)}</span> / 10, {movie.vote_count?.toLocaleString()} votes</span>],
        movie.budget > 0 && ['Budget', <span className="num">{fmt(movie.budget)}</span>],
        movie.revenue > 0 && ['Box office', (
            <span>
                <span className="num">{fmt(movie.revenue)}</span>
                {movie.budget > 0 && <span className={movie.revenue >= movie.budget ? 'gain' : 'loss'}> {movie.revenue >= movie.budget ? 'earned back' : 'lost'} {fmt(Math.abs(movie.revenue - movie.budget))}</span>}
            </span>
        )],
    ].filter(Boolean);

    return (
        <dl className="factsheet">
            {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
    );
};

export default MovieCard;
