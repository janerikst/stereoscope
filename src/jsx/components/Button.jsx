import React from 'react';

const Button = props => {
  const { title, isActive = false, isRight = false, onClick, children } = props;
  return (
    <div
      className={`o-button ${isActive ? 'is-active' : ''} ${isRight
        ? 'is-right'
        : ''}`}
      onClick={onClick}>
      {children}
    </div>
  );
};

export default Button;
