import React from 'react';
import config from 'config/config';

const TextGlyph = props => {
  const { y, height, color, isActive, isSelected } = props;
  const { TEXT_INACTIVE_COLOR } = config;
  const currentColor = isActive ? color : TEXT_INACTIVE_COLOR;
  return (
    <div
      className={`o-text-glyph ${isSelected ? 'is-selected' : ''}`}
      style={{
        top: `${y}%`,
        height: `${height}%`,
        backgroundColor: currentColor,
      }}
    />
  );
};

export default TextGlyph;
