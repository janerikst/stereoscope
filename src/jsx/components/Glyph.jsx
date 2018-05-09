import React from 'react';

const Glyph = props => {
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
      className={`o-glyph ${isHovered ? 'is-hovered' : ''} ${isSelected
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

export default Glyph;
