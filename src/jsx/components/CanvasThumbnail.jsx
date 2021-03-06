import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';

import config from 'config/config';

import Button from '../components/Button';

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
      tags,
      tagSelected,
      comment,
      showAllComments,
      isActive,
      isMatch,
      isDeleteable,
      onSelect,
      onTagSelect,
      onTagFilter,
      onEdit,
      onDelete,
      onClone,
      onDownload,
      width,
      height
    } = this.props;

    const tagline = tags.map((d, i) => (
      <div className="c-canvas-thumbnail__tag"
            id={d+i}
            key={d+i}
            onClick={() => onTagFilter(d)}>
        <span>
          {d + " "}
        </span>
      </div>
    ))

    return (
      <div className={`c-canvas-thumbnail ${isActive ? 'is-active' : ''} ${isMatch ? '' : 'is-not-highlighted'}`}>
        <div className="c-canvas-thumbnail__image_container">
          <span
            className="c-canvas-thumbnail__icon c-canvas-thumbnail__clone"
            onClick={() => onClone(id)}>
            <CloneIcon size={20}/>
          </span>
          <span
            className="c-canvas-thumbnail__icon c-canvas-thumbnail__download"
            onClick={() => onDownload(id)}>
            <DownloadIcon size={20}/>
          </span>
          {isDeleteable && (
            <span
              className="c-canvas-thumbnail__icon c-canvas-thumbnail__delete"
              onClick={() => onDelete(id)}>
              <TrashIcon size={20}/>
            </span>
          )}
          <div className="c-canvas-thumbnail__hoverstate" onClick={() => onSelect(id)}>
          </div>
          <canvas
            className="c-canvas-thumbnail__image"
            width={width}
            height={height}
            ref={x => {
              this.canvasEl = x;
            }}
            
          />
          
        </div>
        <div className="c-canvas-thumbnail__metadata_container">
          <h3 onClick={() => onEdit(id)}>{title}</h3>
          <p>Layout: {layout}</p>
          <div className="c-canvas-thumbnail__tag_container">{tagline}
            <button className="o-small-dialog-button" onClick={() => onTagSelect(id)}>Edit Tags</button>
          </div>
          {showAllComments && comment && (
            <div className="c-canvas-thumbnail__comment_container">
              <h4>Comment</h4>
              <p>{comment}</p>
            </div>
          )}
        </div>
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
