import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import TrendingList from './pages/Trending/TrendingList';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import Taglist from './pages/Tag/TagList';
import PopularList from './pages/Popular/PopularList';

const App: React.FC = () => {
  return (
    <div>
    <Header />
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trending" element={<TrendingList />} />
        <Route path="/tags" element={<Taglist />}/>
        <Route path="/popular" element={<PopularList />}/>       
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    <Footer />
    </div>
  );
}

export default App;
