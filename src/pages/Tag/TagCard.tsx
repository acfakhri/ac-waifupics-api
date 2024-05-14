import React from 'react';
import { Tag } from './types';

interface TagCardProps {
  tag: Tag;
}

const TagCard: React.FC<TagCardProps> = ({ tag }) => {
  return (
<div className="max-w-sm rounded overflow-hidden shadow-lg p-4 m-4 transition duration-300 ease-in-out transform hover:scale-105 hover:border-gray-500 border border-transparent hover:border-solid">
  <div className="relative">
    <img className="w-full h-64 object-cover mb-4" src={tag.wide_image_url} alt={tag.text} />
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white text-sm">
      <p className="font-bold">{tag.text}</p>
      <p className="text-xs">{tag.description}</p>
    </div>
  </div>
  <div className="text-center mt-2">
    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-2">Button 1</button>
    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">Button 2</button>
  </div>
</div>


  );
};

export default TagCard;
