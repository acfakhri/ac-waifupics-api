import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WaifuPics from './pages/WaifuPics';
import NekosBest from './pages/NekosBest';
import Jikan from './pages/Jikan';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Router>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<WaifuPics />} />
          <Route path="/nekos" element={<NekosBest />} />
          <Route path="/anime" element={<Jikan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  </div>
);

export default App;
