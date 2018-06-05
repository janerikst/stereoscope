import React from 'react';

const Header = props => {
  const { onClick, children } = props;

  return (
    <div className="c-header">
      <h1>{children}</h1>
      <div className="o-text-button" onClick={onClick}>
        Load Data
      </div>
    </div>
  );
};

export default Header;
