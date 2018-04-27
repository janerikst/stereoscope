import React from 'react';

import Header from 'components/Header';
import TextBar from 'containers/TextBar';
import Details from 'containers/Details';
import CanvasBar from 'containers/CanvasBar';

const App = props => {
  return (
    <div className="l-app-wrapper">
      <Header />
      <main className="l-content-wrapper">
        <TextBar />
        <Details />
        <CanvasBar />
      </main>
    </div>
  );
};

export default App;
