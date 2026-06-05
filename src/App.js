import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import About from './pages/About';
import ActorDetail from './pages/ActorDetail';
import './Styles.css';

import SplashScreen from './components/SplashScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

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
