import React, { useState } from 'react';
import { Menu, X } from 'react-feather';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-6 flex justify-between items-center">
        {/* Logo */}
        <div>
          <a href="/" className="text-white text-lg font-bold">Company Name</a>
        </div>

        {/* Hamburger icon for mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-300 focus:outline-none">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menu */}
        <div className="hidden md:flex space-x-4">
          <Link to={'/'} className="text-gray-300">Home</Link>
          <Link to={'/tags'} className="text-gray-300">Tags</Link>
          <Link to={'/trending'} className="text-gray-300">Trending</Link>
        </div>

        {/* Sign-in button */}
        <div className="hidden md:block">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Sign In</button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-gray-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link to={'/'} className="block text-gray-300 py-2 px-4">Home</Link>
          <Link to={'/tags'} className="block text-gray-300 py-2 px-4">Tags</Link>
          <Link to={'/trending'} className="block text-gray-300 py-2 px-4">Trending</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
