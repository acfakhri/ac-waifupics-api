import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import TrendingList from './pages/Trending/TrendingList';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import Taglist from './pages/Tag/TagList';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trending" element={<TrendingList />} />
        <Route path="/tags" element={<Taglist />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
