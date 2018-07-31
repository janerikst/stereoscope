import React from 'react';

const Button = props => {
  const { title, isTextButton = false, isActive = false, isRight = false, onClick, children } = props;
  return (
    <div
      className={`${isTextButton ? 'o-text-button' : 'o-button'} 
                  ${isActive ? 'is-active' : ''} 
                  ${isRight ? 'is-right' : ''}`} 
      onClick={onClick}>
      {children}
    </div>
  );
};

export default Button;
