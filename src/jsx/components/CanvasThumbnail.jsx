import React from 'react';
import TrashIcon from 'react-icons/lib/fa/trash';

const CanvasThumbnail = props => {
  const {
    id,
    title,
    layout,
    active,
    isDeleteable,
    onSelect,
    onEdit,
    onDelete,
  } = props;
  return (
    <div className={`c-canvas-thumbnail ${active ? 'is-active' : ''}`}>
      <div className="c-canvas-thumbnail__image_container">
        {isDeleteable && (
          <span
            className="c-canvas-thumbnail__delete"
            onClick={() => onDelete(id)}>
            <TrashIcon />
          </span>
        )}
        <div
          className="c-canvas-thumbnail__image"
          onClick={() => onSelect(id)}
        />
      </div>
      <h3 onClick={() => onEdit(id)}>{title}</h3>
      <p>Layout: {layout}</p>
    </div>
  );
};

export default CanvasThumbnail;
