import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import '../App.css';

import Billboards from '../components/Billboards';
import LoadingSpinner from '../components/LoadingSpinner';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTitle } from '../hooks';

const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

/* Every film TMDb tags with one keyword ("heist", "time loop"), most popular first. */
const KeywordFilms = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [films, setFilms] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useTitle(name ? `Films about ${name}` : null);

    useEffect(() => {
        window.scrollTo(0, 0);
        setFilms([]); setPage(1); setName(''); setError(false);
        axios.get(`${TMDB_BASE}/keyword/${id}`, { params: { api_key: TMDB_KEY } }).then((r) => setName(r.data.name)).catch(() => {});
    }, [id]);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        axios.get(`${TMDB_BASE}/discover/movie`, { params: { api_key: TMDB_KEY, with_keywords: id, sort_by: 'popularity.desc', 'vote_count.gte': 10, page } })
            .then((r) => {
                if (!alive) return;
                setFilms((prev) => (page === 1 ? r.data.results : [...prev, ...r.data.results]));
                setTotal(r.data.total_results);
            })
            .catch(() => alive && setError(true))
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [id, page]);

    return (
        <div>
            <NavBar />
            <main id="main" className="wrap">
                <button className="back" onClick={() => navigate(-1)}><FiArrowLeft aria-hidden="true" /> Back</button>
                <header className="page-head page-head--small">
                    <h1>{name || 'Keyword'}</h1>
                    {total > 0 && <p className="mast__lede"><span className="num">{total.toLocaleString()}</span> films tagged "{name}" on TMDb, most popular first.</p>}
                </header>
                {error && <p className="alert" role="alert"><FiAlertCircle aria-hidden="true" /> These films did not load. Try again in a moment.</p>}
                {films.length > 0 && <Billboards movies={films} limit={films.length} />}
                {loading ? <LoadingSpinner rows={4} /> : films.length < total && (
                    <p className="more"><button className="btn" onClick={() => setPage((p) => p + 1)}>More films</button></p>
                )}
                {!loading && !error && films.length === 0 && <p className="empty">No films carry this tag yet.</p>}
            </main>
            <Footer />
        </div>
    );
};

export default KeywordFilms;
