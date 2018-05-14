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
    isHidden,
    onHover,
    onClick,
    onDoubleClick,
  } = props;
  return (
    <circle
      className={`o-glyph ${isHovered ? 'is-hovered' : ''} ${isSelected
        ? 'is-selected'
        : ''} ${isHidden ? 'is-hidden' : ''}`}
      cx={x}
      cy={y}
      fill={color}
      r={radius}
      onMouseOver={() => onHover(id)}
      onMouseOut={() => onHover()}
      onClick={() => onClick(id)}
      onDoubleClick={() => onDoubleClick(id)}
    />
  );
};

export default Glyph;
