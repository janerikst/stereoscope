import React, { Component } from 'react';
import config from 'config/config';

class TextElement extends Component {
  render() {
    const {
      id,
      text,
      annotations,
      isActive,
      isHovered,
      isSelected,
      onHover,
      onClick,
      onAltClick,
    } = this.props;

    const { TEXT_SELECT_COLOR, TEXT_INACTIVE_COLOR } = config;

    let annotationsGradient = '';
    let backgroundColor =
      isHovered || isSelected ? TEXT_INACTIVE_COLOR : 'white';
    annotations.forEach((d, i) => {
      const color =
        d.active == undefined || d.active ? d.color : TEXT_SELECT_COLOR;
      annotationsGradient += `,${color} ${i * 3}px, ${color} ${i * 3 + 2}px, ${backgroundColor} ${i * 3 +
        3}px`;
    });

    const activeAnnotations = () => {
      return annotations.filter(d => d.active).map(d => d.id);
    };

    const handleClick = e => {
      if (e.altKey) {
        onAltClick(activeAnnotations());
      } else {
        onClick(activeAnnotations());
      }
    };

    return (
      <span
        className={`${!isActive ? ' is-inactive ' : ''}${isHovered
          ? ' is-hovered '
          : ''}${isSelected ? ' is-selected ' : ''}${annotations.length != 0
          ? ' is-selectable '
          : ''}`}
        style={
          annotations.length ? (
            {
              lineHeight: `${22 + annotations.length * 2}px`,
              background: `linear-gradient(0deg ${annotationsGradient})`,
              backgroundPosition: '0 100%',
              paddingBottom: annotations.length * 3,
            }
          ) : (
            {}
          )
        }
        onMouseOver={() => {
          onHover(activeAnnotations());
        }}
        onMouseOut={() => onHover()}
        onClick={handleClick}>
        {text}
      </span>
    );
  }
}

export default TextElement;
