import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Billboards from './Billboards';
import LoadingSpinner from './LoadingSpinner';
import '../App.css';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

/* The services worth a chip in each country, in the order people reach for them. */
const SERVICES = {
    ID: [8, 119, 122, 489, 1899, 159], // Netflix, Prime Video, Disney+, Vidio, HBO Max, Catchplay
    US: [8, 9, 337, 1899, 15, 350],    // Netflix, Prime Video, Disney+, HBO Max, Hulu, Apple TV
};

/* "What's on tonight": pick a service, see its most popular films in this country right now. */
const StreamingNow = ({ region, genre }) => {
    const [services, setServices] = useState([]);
    const [picked, setPicked] = useState(SERVICES[region][0]);
    const [films, setFilms] = useState(null);

    useEffect(() => {
        let alive = true;
        setPicked(SERVICES[region][0]);
        axios.get(`${TMDB_BASE}/watch/providers/movie`, { params: { api_key: TMDB_KEY, watch_region: region } })
            .then((r) => {
                const byId = Object.fromEntries((r.data.results || []).map((p) => [p.provider_id, p]));
                alive && setServices(SERVICES[region].map((id) => byId[id]).filter(Boolean));
            })
            .catch(() => {});
        return () => { alive = false; };
    }, [region]);

    useEffect(() => {
        let alive = true;
        setFilms(null);
        axios.get(`${TMDB_BASE}/discover/movie`, {
            params: {
                api_key: TMDB_KEY, watch_region: region, with_watch_providers: picked,
                with_watch_monetization_types: 'flatrate', sort_by: 'popularity.desc', 'vote_count.gte': 50,
                ...(genre ? { with_genres: genre } : {}),
            },
        }).then((r) => alive && setFilms(r.data.results)).catch(() => alive && setFilms([]));
        return () => { alive = false; };
    }, [region, picked, genre]);

    const name = services.find((s) => s.provider_id === picked)?.provider_name;
    return (
        <>
            {services.length > 0 && (
                <div className="services" role="group" aria-label="Streaming service">
                    {services.map((s) => (
                        <button key={s.provider_id} type="button" aria-pressed={picked === s.provider_id} onClick={() => setPicked(s.provider_id)}>
                            <img src={`https://image.tmdb.org/t/p/w92${s.logo_path}`} alt="" width="28" height="28" />
                            {s.provider_name}
                        </button>
                    ))}
                </div>
            )}
            {films === null ? <LoadingSpinner rows={4} />
                : films.length ? <Billboards movies={films} limit={8} />
                    : <p className="empty">Nothing{genre ? ' in this genre' : ''} on {name || 'this service'} right now.</p>}
        </>
    );
};

export default StreamingNow;
