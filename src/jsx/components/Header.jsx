import React from 'react';

const Header = props => {
  const { children } = props;

  return (
    <div className="c-header">
      <h1>{children}</h1>
    </div>
  );
};

export default Header;
