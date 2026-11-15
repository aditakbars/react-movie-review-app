import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiRepeat, FiHeart } from 'react-icons/fi';
import '../App.css';

import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import Stars from '../components/Stars';
import Billboards from '../components/Billboards';
import { useDiary, useTitle } from '../hooks';

const monthName = (d) => new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

/* The Letterboxd diary as a printed programme: a month per section, a film per night. */
const Diary = () => {
    useTitle('Diary');
    const { entries, ratings, watchedCount, profileUrl, updated, loaded } = useDiary();

    const months = useMemo(() => {
        const groups = [];
        entries.forEach((e) => {
            const key = (e.watched || '').slice(0, 7);
            if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, label: monthName(e.watched), items: [] });
            groups[groups.length - 1].items.push(e);
        });
        return groups;
    }, [entries]);

    // Stats come from every rating (the export's ratings), falling back to diary entries.
    const rated = ratings.length ? ratings : entries.filter((e) => e.rating);
    const average = rated.length ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1) : null;
    const fiveStars = rated.filter((r) => r.rating === 5 && r.tmdbId && r.poster);
    const spread = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => ({ v, n: rated.filter((r) => r.rating === v).length }));
    const tallest = Math.max(1, ...spread.map((s) => s.n));
    const since = entries.length ? monthName(entries[entries.length - 1].watched) : null;
    const years = [...new Set(entries.map((e) => e.watched.slice(0, 4)))]
        .map((y) => ({ y, n: entries.filter((e) => e.watched.startsWith(y)).length }));

    return (
        <div>
            <NavBar />
            <main id="main" className="wrap">
                <header className="page-head">
                    <h1>Diary</h1>
                    <p className="mast__lede">
                        Every film I log on <a href={profileUrl || 'https://letterboxd.com/aditjh/'} target="_blank" rel="noreferrer">Letterboxd</a>, newest first,
                        with the short reviews I write there. It updates itself every day.
                    </p>
                </header>

                {!loaded && <LoadingSpinner rows={4} />}
                {loaded && entries.length === 0 && <p className="empty">The diary is empty for now.</p>}

                {entries.length > 0 && (
                    <dl className="tally">
                        <div><dt>Diary entries</dt><dd className="num">{entries.length}</dd></div>
                        {watchedCount > 0 && <div><dt>Films seen, all time</dt><dd className="num">{watchedCount}</dd></div>}
                        {average && <div><dt>Average rating</dt><dd><span className="num">{average}</span> <span className="tally__unit">/ 5 across {rated.length}</span></dd></div>}
                        {since && <div><dt>Diary since</dt><dd className="tally__films">{since}</dd></div>}
                    </dl>
                )}

                {rated.length > 9 && (
                    <section className="spread-wrap" aria-labelledby="spread-head">
                        <h2 id="spread-head" className="found__head">How I rate</h2>
                        <ul className="spread">
                            {spread.map(({ v, n }) => (
                                <li key={v} aria-label={`${n} films rated ${v} out of 5`}>
                                    <span className="spread__n num" aria-hidden="true">{n || ''}</span>
                                    <span className="spread__bar" style={{ height: `${Math.max(2, (n / tallest) * 100)}%` }} aria-hidden="true" />
                                    <span className="spread__v" aria-hidden="true">{`${Math.floor(v) || ''}${v % 1 ? '½' : ''}`}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="spread__legend" aria-hidden="true">Stars given, from half a star to five</p>
                    </section>
                )}

                {fiveStars.length > 0 && (
                    <section className="block" aria-labelledby="five-head">
                        <div className="block__head"><h2 id="five-head">Five stars</h2><p className="block__en">Every film I've given full marks</p></div>
                        <Billboards movies={fiveStars.map((r) => ({ id: r.tmdbId, title: r.title, poster_path: r.poster, release_date: r.year }))} limit={12} />
                    </section>
                )}

                {years.length > 1 && (
                    <nav className="years" aria-label="Jump to a year">
                        {years.map(({ y, n }) => <a key={y} href={`#y-${y}`}>{y} <span className="num">{n}</span></a>)}
                    </nav>
                )}

                {months.map((m) => (
                    <section key={m.key} id={months.find((x) => x.key.slice(0, 4) === m.key.slice(0, 4)) === m ? `y-${m.key.slice(0, 4)}` : undefined} className="month" aria-labelledby={`m-${m.key}`}>
                        <h2 id={`m-${m.key}`} className="month__head">{m.label}</h2>
                        <ol className="month__list">
                            {m.items.map((e) => (
                                <li key={e.id} className="entry">
                                    <span className="entry__day num" aria-hidden="true">{Number(e.watched.slice(8, 10))}</span>
                                    {e.poster
                                        ? <img className="entry__poster" src={`https://image.tmdb.org/t/p/w154${e.poster}`} alt="" width="154" height="231" loading="lazy" />
                                        : <span className="entry__poster" />}
                                    <div className="entry__text">
                                        <h3 className="entry__title">
                                            {e.tmdbId ? <Link to={`/movies/${e.tmdbId}`}>{e.title}</Link> : e.title}
                                            {e.year && <span className="entry__year num"> {e.year}</span>}
                                        </h3>
                                        <p className="entry__line">
                                            <span className="sr-only">Watched {new Date(e.watched).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}. </span>
                                            {e.rating ? <Stars rating={e.rating} /> : <span className="entry__muted">No rating</span>}
                                            {e.rewatch && <span className="entry__muted"><FiRepeat aria-hidden="true" /> Rewatch</span>}
                                            {e.liked && <span className="entry__muted"><FiHeart aria-hidden="true" /> Liked</span>}
                                        </p>
                                        {e.review && (e.spoiler
                                            ? <p className="entry__muted">Review hidden: it has spoilers. <a href={e.url} target="_blank" rel="noreferrer">Read it on Letterboxd</a></p>
                                            : <p className="entry__review">{e.review}</p>)}
                                    </div>
                                    <a className="entry__lb" href={e.url} target="_blank" rel="noreferrer" aria-label={`${e.title} on Letterboxd`}><FiExternalLink aria-hidden="true" /></a>
                                </li>
                            ))}
                        </ol>
                    </section>
                ))}

                {updated && <p className="diary__updated">Last synced {new Date(updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>}
            </main>
            <Footer />
        </div>
    );
};

export default Diary;
