// Footer.tsx

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-white mb-4">About Us</h2>
            <p className="text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
            <ul>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition duration-300">Home</a></li>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition duration-300">About</a></li>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition duration-300">Services</a></li>
              <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition duration-300">Contact</a></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300">123 Main Street</p>
            <p className="text-gray-300">City, State ZIP</p>
            <p className="text-gray-300">Email: info@example.com</p>
            <p className="text-gray-300">Phone: 123-456-7890</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4">
          <p className="text-base text-gray-300">© 2024 My Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
