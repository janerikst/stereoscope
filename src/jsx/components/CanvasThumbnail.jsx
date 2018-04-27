import React from 'react';

const CanvasThumbnail = props => {
  const { id, title, layout, active } = props;
  return (
    <div className={`c-canvas-thumbnail ${active ? 'is-active' : ''}`}>
      <div className="c-canvas-thumbnail__image" />
      <h3>{title == '' ? <span>Untitled Canvas</span> : title}</h3>
      <p>Layout: {layout}</p>
    </div>
  );
};

export default CanvasThumbnail;
