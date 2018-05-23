import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import CanvasThumbnail from '../components/CanvasThumbnail';

const CanvasBar = observer(props => {
  // vars
  const { canvasList } = dataAPI;
  const { CANVAS_BAR_WIDTH } = config;

  // interactions
  const handleOpenAddCanvasDialog = () => uiState.triggerAddCanvasDialog();
  const handleOpenEditCanvasDialog = id => uiState.triggerEditCanvasDialog(id);
  const handleSelectCanvas = id => uiState.setActiveCanvas(id);
  const handleDeleteCanvas = id => uiState.deleteCanvas(id);

  // content
  const canvasEls = canvasList.map((d, i) => (
    <CanvasThumbnail
      key={d.id}
      id={d.id}
      title={d.title}
      layout={d.layout}
      active={d.active}
      isDeleteable={i != 0}
      onSelect={handleSelectCanvas}
      onDelete={handleDeleteCanvas}
      onEdit={handleOpenEditCanvasDialog}
    />
  ));

  // render
  return (
    <aside
      className="c-canvas-bar l-content-container"
      style={{ width: CANVAS_BAR_WIDTH }}>
      <header className="c-header--small">
        <h2>Canvas View</h2>
      </header>
      <div className="c-canvas-bar__thumbnails l-content-spacing">
        <div className="c-canvas-bar__add" onClick={handleOpenAddCanvasDialog}>
          <span>+</span>
        </div>
        {canvasEls}
      </div>
    </aside>
  );
});

export default CanvasBar;
