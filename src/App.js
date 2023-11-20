import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//Pages
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import About from './pages/About';
import './Styles.css';

//components
import SplashScreen from './components/SplashScreen';

function App() {

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Fungsionalitas atau proses apa pun yang memerlukan waktu
    // Contoh: Memuat data dari API
    const fetchData = async () => {
      try {
        // Gantilah dengan kode pengambilan data sesuai kebutuhan
        // Simulasikan penundaan selama 2 detik
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/:id" element={<ReviewDetail />}/>
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;