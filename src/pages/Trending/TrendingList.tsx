import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TrendingItem from './TrendingItem';

interface TrendingData {
  id: number;
  name: string;
  slug: string;
  cover_url: string;
  views: number;
  link: string;
}

const TrendingList: React.FC = () => {
  const [trendingData, setTrendingData] = useState<TrendingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const response = await axios.get('https://multi-pai.vercel.app/hanime/trending/day/1');
        setTrendingData(response.data.results);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {trendingData.map(item => (
          <TrendingItem
            key={item.id}
            id={item.id}
            name={item.name}
            slug={item.slug}
            cover_url={item.cover_url}
            views={item.views}
            link={item.link}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingList;
