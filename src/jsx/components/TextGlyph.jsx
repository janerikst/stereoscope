import React from 'react';
import config from 'config/config';

const TextGlyph = props => {
  const { y, height, color, active } = props;
  const { TEXT_INACTIVE_COLOR } = config;
  const currentColor = active ? color : TEXT_INACTIVE_COLOR;
  return (
    <div
      className={'o-text-glyph'}
      style={{
        top: `${y}%`,
        height: `${height}%`,
        backgroundColor: currentColor,
      }}
    />
  );
};

export default TextGlyph;
