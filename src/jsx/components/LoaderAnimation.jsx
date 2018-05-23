import React from 'react';

const LoaderAnimation = props => {
  return (
    <div className="c-loader">
      <div className="c-spinner">
        <div className="c-spinner__bounce1" />
        <div className="c-spinner__bounce2" />
        <div className="c-spinner__bounce3" />
      </div>
    </div>
  );
};

export default LoaderAnimation;
