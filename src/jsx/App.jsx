import React from 'react';
import { observer } from 'mobx-react';

import Header from 'components/Header';
import TextBar from 'containers/TextBar';
import Canvas from 'containers/Canvas';
import Modals from 'containers/Modals';
import CanvasBar from 'containers/CanvasBar';

import dataAPI from 'data/dataAPI';

const App = observer(props => {
  const { textTitle } = dataAPI;

  return (
    <div>
      <div className="l-app-wrapper">
        <Header>3DH{textTitle ? ` — ${textTitle}` : ''}</Header>
        <main className="l-content-wrapper">
          <TextBar />
          <Canvas />
          <CanvasBar />
        </main>
      </div>
      <Modals />
    </div>
  );
});

export default App;
