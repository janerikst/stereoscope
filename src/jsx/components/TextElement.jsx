import React, { Component } from 'react';

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
    } = this.props;

    let annotationsGradient = '';
    let backgroundColor = isHovered || isSelected ? '#eee' : 'white';
    annotations.forEach((d, i) => {
      const color = d.active == undefined || d.active ? d.color : '#ddd';
      annotationsGradient += `,${color} ${i * 2}px, ${backgroundColor} ${i * 2 +
        1}px, ${backgroundColor} ${i * 2 + 2}px`;
    });

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
              paddingBottom: annotations.length * 2,
            }
          ) : (
            {}
          )
        }
        onMouseOver={() => {
          onHover(annotations.filter(d => d.active).map(d => d.id));
        }}
        onMouseOut={() => onHover()}
        onClick={() => {
          onClick(annotations.filter(d => d.active).map(d => d.id));
        }}>
        {text}
      </span>
    );
  }
}

export default TextElement;
