import React from 'react';

const Line = props => {
  const {
    id,
    x1,
    y1,
    x2,
    y2,
    relationship
  } = props;

  return (
    <line
      className={`o-line ${relationship}`}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#000" 
      strokeOpacity={0.1}
      >
    </line>
  );
};

export default Line;
