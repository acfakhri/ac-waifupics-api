import React from 'react';

interface TrendingItemProps {
  id: number;
  name: string;
  slug: string;
  cover_url: string;
  views: number;
  link: string;
}

const TrendingItem: React.FC<TrendingItemProps> = ({ name, cover_url, views, link }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <img className="w-full" src={cover_url} alt={name} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{name}</div>
        <p className="text-gray-700 text-base">
          {views.toLocaleString()} views
        </p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <a href={link} className="inline-block bg-blue-500 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2">
          Watch
        </a>
      </div>
    </div>
  );
};

export default TrendingItem;
