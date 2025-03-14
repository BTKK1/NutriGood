import React from 'react';
// Example of how to import and use images
// Replace exampleImage.png with your actual image
import exampleImage from "@/assets/images/exampleImage.png";

export const ImageExample: React.FC = () => {
  return (
    <div>
      <img 
        src={exampleImage} 
        alt="Example"
        className="w-full h-auto rounded-lg"
      />
    </div>
  );
};
