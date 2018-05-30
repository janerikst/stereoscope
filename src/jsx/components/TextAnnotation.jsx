import React, { Component } from 'react';
import config from 'config/config';

class TextAnnotation extends Component {
  render() {
    const {
      id,
      text,
      author,
      tagPath,
      color,
      showCloseBtn,
      isActive,
      isHovered,
      isSelected,
      onHover,
      onCloseClick,
      onTextClick,
    } = this.props;
    return (
      <div
        className={`c-text-area__text-annotation ${!isActive
          ? ' is-inactive '
          : ''}${isHovered ? ' is-hovered ' : ''}`}>
        <header>
          {showCloseBtn && (
            <span
              className="c-text-area__close o-close"
              onClick={() => onCloseClick([id])}
            />
          )}
          Category: {tagPath} | Author: {author}
          |{' '}
          <span className="o-link" onClick={() => onTextClick(id)}>
            [goto]
          </span>
        </header>

        <div style={{ borderLeft: `3px solid ${color}` }}>{text}</div>
      </div>
    );
  }
}

export default TextAnnotation;
