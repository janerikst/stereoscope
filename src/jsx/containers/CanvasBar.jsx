import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

const CanvasBar = observer(props => {
  const { CANVAS_BAR_SIZE } = config;

  return (
    <aside
      className="c-canvas-bar l-content-container"
      style={{ width: CANVAS_BAR_SIZE }}>
      <header className="c-header--small">
        <h2>Canvas View</h2>
      </header>
      <div className="l-content-spacing" />
    </aside>
  );
});

export default CanvasBar;
