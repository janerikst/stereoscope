import React from 'react';

const Header = props => {
  const { onClick, children } = props;

  return (
    <div className="c-header" onClick={onClick}>
      <h1>{children}</h1>
    </div>
  );
};

export default Header;
