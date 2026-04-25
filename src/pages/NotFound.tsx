import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Frown } from 'react-feather';

const NotFound: React.FC = () => (
  <div style={{
    minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 20, textAlign: 'center', padding: '40px 24px',
  }}>
    <div style={{
      fontSize: 96, fontFamily: 'Orbitron, sans-serif', fontWeight: 900,
      background: 'linear-gradient(135deg, #ff2d78, #9b5de5)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      lineHeight: 1,
    }}>
      404
    </div>
    <Frown size={48} color="#8888aa" />
    <h2 style={{ color: '#f0f0ff', fontSize: 22, fontWeight: 700, margin: 0 }}>Page Not Found</h2>
    <p style={{ color: '#8888aa', fontSize: 15, margin: 0 }}>This page seems to have vanished into another dimension.</p>
    <Link to="/" style={{ textDecoration: 'none' }}>
      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Home size={16} /> Back to Gallery
      </button>
    </Link>
  </div>
);

export default NotFound;
