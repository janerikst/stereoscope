import React from 'react';

const Header = props => {
  const { text, annotations } = props;

  let annotationsGradient = '';
  annotations.forEach((d, i) => {
    annotationsGradient += `,${d.color} ${i * 2}px, white ${i * 2 +
      1}px, white ${i * 2 + 2}px`;
  });

  return (
    <span
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
