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
      isActive,
      isHovered,
      isSelected,
      onHover,
      onClick,
    } = this.props;
    return (
      <div
        className={`c-text-area__text-annotation ${!isActive
          ? ' is-inactive '
          : ''}${isHovered ? ' is-hovered ' : ''}`}>
        <header>
          Author: {author} | Category: {tagPath}
          <span
            className="c-text-area__close o-close"
            onClick={() => onClick([id])}
          />
        </header>

        <div style={{ borderLeft: `3px solid ${color}` }}>{text}</div>
      </div>
    );
  }
}

export default TextAnnotation;
