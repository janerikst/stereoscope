import React from 'react';

const Header = props => {
  const { text, annotations, isActive } = props;
  let annotationsGradient = '';
  annotations.forEach((d, i) => {
    const color = d.active == undefined || d.active ? d.color : '#ddd';
    annotationsGradient += `,${color} ${i * 2}px, white ${i * 2 +
      1}px, white ${i * 2 + 2}px`;
  });

  return (
    <span
      className={!isActive ? 'is-inactive' : ''}
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
      }>
      {text}
    </span>
  );
};

export default Header;
