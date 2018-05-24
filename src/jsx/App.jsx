import React from 'react';
import { observer } from 'mobx-react';

import Header from 'components/Header';
import LoaderAnimation from 'components/LoaderAnimation';
import TextBar from 'containers/TextBar';
import Canvas from 'containers/Canvas';
import CanvasBar from 'containers/CanvasBar';
import Modals from 'containers/Modals';
import Tooltips from 'containers/Tooltips';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';

import Icon from 'react-icons/lib/fa/file-text-o';

const App = observer(props => {
  const { textTitle, isAppReady } = dataAPI;

  // interactions
  const handleTriggerDataDialog = () => {
    uiState.triggerDataDialog();
  };

  return (
    <div>
      {isAppReady && (
        <div>
          <div className="l-app-wrapper">
            <Header>
              {textTitle ? textTitle : ''}{' '}
              <Icon onClick={handleTriggerDataDialog} />
            </Header>
            <main className="l-content-wrapper">
              <TextBar />
              <Canvas />
              <CanvasBar />
            </main>
          </div>
          <Modals />
          <Tooltips />
        </div>
      )}
      {!isAppReady && <LoaderAnimation />}
    </div>
  );
});

export default App;
