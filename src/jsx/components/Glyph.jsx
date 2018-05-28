import React from 'react';

const Glyph = props => {
  const {
    id,
    x,
    y,
    radius,
    color,
    certainty,
    importance,
    scaleCertainty,
    scaleImportance,
    isHovered,
    isSelected,
    isHidden,
    onHover,
    onClick,
    onAltClick,
  } = props;

  const handleClick = e => {
    if (e.altKey) {
      onAltClick(id);
    } else {
      onClick(id);
    }
  };

  return (
    <circle
      className={`o-glyph ${isHovered ? 'is-hovered' : ''} ${isSelected
        ? 'is-selected'
        : ''} ${isHidden ? 'is-hidden' : ''}`}
      cx={x}
      cy={y}
      fill={color}
      r={radius}
      fillOpacity={certainty ? scaleCertainty(certainty) : 1}
      strokeDasharray={
        importance ? (
          `${scaleImportance(importance)},${scaleImportance(importance)}`
        ) : (
          ''
        )
      }
      strokeWidth={importance ? 2 : 0}
      stroke="#000"
      onMouseOver={() => onHover(id)}
      onMouseOut={() => onHover()}
      onClick={handleClick}
    />
  );
};

export default Glyph;
