import React from 'react';
import { Tag } from './types';

interface TagCardProps {
  tag: Tag;
}

const TagCard: React.FC<TagCardProps> = ({ tag }) => {
  return (
<div className="max-w-sm rounded overflow-hidden shadow-lg p-4 m-4 transition duration-300 ease-in-out transform hover:scale-105 hover:border-gray-500 border border-transparent hover:border-solid">
  <img className="w-full mb-4" src={tag.wide_image_url} alt={tag.text} />
  <div className="text-center">
    <div className="font-bold text-xl mb-2">{tag.text}</div>
    <p className="text-gray-700 text-base mb-2">{tag.description}</p>
    <p className="text-gray-700 text-base">Count: {tag.count}</p>
  </div>
</div>

  );
};

export default TagCard;
