import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import '@fontsource/big-shoulders-display/600';
import '@fontsource/big-shoulders-display/700';
import '@fontsource/big-shoulders-display/800';
import '@fontsource/newsreader/400';
import '@fontsource/newsreader/400-italic';
import '@fontsource/newsreader/500';
import '@fontsource/newsreader/600';
import './Styles.css';

import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import About from './pages/About';
import ActorDetail from './pages/ActorDetail';

function App() {
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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
