import React, { useEffect, useState } from 'react';
import TagCard from './TagCard';
import { Tag } from './types';

const Taglist: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    // Replace this with your actual API call
    const fetchTags = async () => {
      const response = await fetch('https://multi-pai.vercel.app/hanime/tags'); // Replace 'your-api-url' with your actual API endpoint
      const data = await response.json();
      setTags(data.results);
    };

    fetchTags();
  }, []);

  return (
    <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Popular Tags</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {tags.map(tag => (
          <TagCard key={tag.id} tag={tag} />
        ))}
      </div>
    </div>
  );
};

export default Taglist;
