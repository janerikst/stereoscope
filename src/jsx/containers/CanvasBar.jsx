import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import CanvasThumbnail from '../components/CanvasThumbnail';

const CanvasBar = observer(props => {
  // vars
  const { canvasList } = dataAPI;
  const { CANVAS_BAR_SIZE } = config;

  // content
  const canvasEls = canvasList.map(d => (
    <CanvasThumbnail key={d.id} id={d.id} title={d.title} layout={d.layout} />
    <CanvasThumbnail
      key={d.id}
      id={d.id}
      title={d.title}
      layout={d.layout}
      active={d.active}
    />
  ));

  // render
  return (
    <aside
      className="c-canvas-bar l-content-container"
      style={{ width: CANVAS_BAR_SIZE }}>
      <header className="c-header--small">
        <h2>Canvas View</h2>
      </header>
      <div className="c-canvas-bar__thumbnails l-content-spacing">
        {canvasEls}
        <div className="c-canvas-bar__add">
          <span>+</span>
        </div>
      </div>
    </aside>
  );
});

export default CanvasBar;
