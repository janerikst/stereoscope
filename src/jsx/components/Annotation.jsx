import React from 'react';

const Annotation = props => {
  const {
    id,
    x,
    y,
    radius,
    color,
    isHovered,
    isSelected,
    onHover,
    onClick,
  } = props;
  return (
    <circle
      className={`o-annotation ${isHovered ? 'is-hovered' : ''} ${isSelected
        ? 'is-selected'
        : ''}`}
      cx={x}
      cy={y}
      fill={color}
      r={radius}
      onMouseOver={() => onHover(id)}
      onMouseOut={() => onHover()}
      onClick={() => onClick(id)}
    />
  );
};

export default Annotation;
