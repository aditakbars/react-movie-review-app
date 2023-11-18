import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//Pages
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Review from './pages/Review';
import About from './pages/About';
import './Styles.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/reviews" element={<Review />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;