import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const IMG_BASE = 'https://image.tmdb.org/t/p/w185';

const CastRow = ({ cast, crew }) => {
    const director = crew?.find(c => c.job === 'Director');
    const writers = crew?.filter(c => c.department === 'Writing').slice(0, 2) || [];

    return (
        <div className='cast-section'>
            {(director || writers.length > 0) && (
                <div className='crew-line'>
                    {director && (
                        <span className='crew-item'>
                            <span className='crew-role'>Directed by </span>
                            <Link to={`/actors/${director.id}`} className='crew-name'>{director.name}</Link>
                        </span>
                    )}
                    {writers.length > 0 && (
                        <span className='crew-item'>
                            <span className='crew-role'>Written by </span>
                            {writers.map((w, i) => (
                                <span key={w.credit_id}>
                                    <Link to={`/actors/${w.id}`} className='crew-name'>{w.name}</Link>
                                    {i < writers.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </span>
                    )}
                </div>
            )}

            <div className='cast-container card-container'>
                {cast.map((actor) => (
                    <Link to={`/actors/${actor.id}`} className='actor-card' key={actor.cast_id ?? actor.id}>
                        <div className='actor-photo-wrap'>
                            {actor.profile_path
                                ? <img className='actor-photo' src={`${IMG_BASE}${actor.profile_path}`} alt={actor.name} />
                                : <div className='actor-photo-placeholder'>👤</div>
                            }
                        </div>
                        <span className='actor-name'>{actor.name}</span>
                        <span className='actor-character'>{actor.character}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CastRow;
