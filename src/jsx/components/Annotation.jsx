import React from 'react';

const Annotation = props => {
  const { id, x, y, radius, color, isHovered, onHover } = props;
  return (
    <circle
      className={`o-annotation ${isHovered ? 'is-hovered' : ''}`}
      cx={x}
      cy={y}
      fill={color}
      r={radius}
      onMouseOver={() => onHover(id)}
      onMouseOut={() => onHover()}
    />
  );
};

export default Annotation;
