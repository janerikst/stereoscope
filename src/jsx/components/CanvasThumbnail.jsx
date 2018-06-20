import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';

import config from 'config/config';

import TrashIcon from 'react-icons/lib/md/delete';
import CloneIcon from 'react-icons/lib/md/content-copy';
import DownloadIcon from 'react-icons/lib/md/file-download';

@observer
class CanvasThumbnail extends React.Component {
  render() {
    const {
      id,
      title,
      layout,
      isActive,
      isMatch,
      isDeleteable,
      onSelect,
      onEdit,
      onDelete,
      onClone,
      onDownload,
      width,
      height,
    } = this.props;

    return (
      <div className={`c-canvas-thumbnail ${isActive ? 'is-active' : ''} ${isMatch ? 'is-highlighted' : ''}`}>
        <div className="c-canvas-thumbnail__image_container">
          <span
            className="c-canvas-thumbnail__icon c-canvas-thumbnail__clone"
            onClick={() => onClone(id)}>
            <CloneIcon />
          </span>
          <span
            className="c-canvas-thumbnail__icon c-canvas-thumbnail__download"
            onClick={() => onDownload(id)}>
            <DownloadIcon />
          </span>
          {isDeleteable && (
            <span
              className="c-canvas-thumbnail__icon c-canvas-thumbnail__delete"
              onClick={() => onDelete(id)}>
              <TrashIcon />
            </span>
          )}
          <canvas
            className="c-canvas-thumbnail__image"
            width={width}
            height={height}
            ref={x => {
              this.canvasEl = x;
            }}
            onClick={() => onSelect(id)}
          />
        </div>
        <h3 onClick={() => onEdit(id)}>{title}</h3>
        <p>Layout: {layout}</p>
      </div>
    );
  }

  drawThumbnail() {
    const { glyphs, width, height, scaleRatio } = this.props;
    if (glyphs.length != 0) {
      const canvasEl = ReactDOM.findDOMNode(this.canvasEl);
      const ctx = canvasEl.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      glyphs.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
        ctx.fillStyle = d.color;
        ctx.fill();
      });
    }
  }

  componentDidMount() {
    this.drawThumbnail();
  }

  componentDidUpdate() {
    this.drawThumbnail();
  }
}

export default CanvasThumbnail;
