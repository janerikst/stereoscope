import React from 'react';

const Line = props => {
  const {
    id,
    x1,
    y1,
    x2,
    y2,
  } = props;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#000" 
      stroke-opacity={0.1}
      >
    </line>
  );
};

export default Line;
