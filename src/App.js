import React from 'react';
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
