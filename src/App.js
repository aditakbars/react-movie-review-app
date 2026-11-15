import React, { useEffect } from 'react';
import { wakeReviews } from './api/reviews';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import '@fontsource/bowlby-one/400';
import '@fontsource/archivo/400';
import '@fontsource/archivo/400-italic';
import '@fontsource/archivo/600';
import '@fontsource/archivo/800';
import './Styles.css';

import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import About from './pages/About';
import ActorDetail from './pages/ActorDetail';
import KeywordFilms from './pages/KeywordFilms';
import Diary from './pages/Diary';

function App() {
  // Nudge the sleeping reviews server awake on any first page, idle-time so it never competes with TMDb.
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1500));
    idle(wakeReviews);
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/movies/:id"  element={<MovieDetail />} />
          <Route path="/reviews"     element={<Reviews />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/actors/:id"  element={<ActorDetail />} />
          <Route path="/about"       element={<About />} />
          <Route path="/keywords/:id" element={<KeywordFilms />} />
          <Route path="/diary"       element={<Diary />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
