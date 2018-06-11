import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import { scaleLinear } from 'd3';

import CanvasThumbnail from '../components/CanvasThumbnail';

const CanvasBar = observer(props => {
  // vars
  const { canvasList, filteredCanvasList, downloadDetailedAnnotations } = dataAPI;
  const { CANVAS_BAR_WIDTH } = config;

  // interactions
  const handleOpenAddCanvasDialog = () => uiState.triggerAddCanvasDialog();
  const handleOpenEditCanvasDialog = id => uiState.triggerEditCanvasDialog(id);
  const handleOpenCloneCanvasDialog = id =>
    uiState.triggerCloneCanvasDialog(id);
  const handleSelectCanvas = id => uiState.setActiveCanvas(id);
  const handleDeleteCanvas = id => uiState.deleteCanvas(id);
  const handleDownloadCanvas = id => {
    dataAPI.downloadCanvas(id);
  };
  const handlesearchStringChange = searchString => {
      uiState.changeSearchString(searchString);
    }

  // content
  /*const canvasEls = canvasList.map((d, i) => (
    <CanvasThumbnail
      key={d.id}
      id={d.id}
      title={d.title}
      layout={d.layout}
      glyphs={d.glyphs}
      isActive={d.active}
      isDeleteable={d.id != 1}
      onSelect={handleSelectCanvas}
      onDelete={handleDeleteCanvas}
      onClone={handleOpenCloneCanvasDialog}
      onDownload={handleDownloadCanvas}
      onEdit={handleOpenEditCanvasDialog}
      width={d.thumbnailWidth}
      height={d.thumbnailHeight}
    />
  ));*/

  const canvasEls = filteredCanvasList.map((d, i) => (
    <CanvasThumbnail
      key={d.id}
      id={d.id}
      title={d.title}
      layout={d.layout}
      glyphs={d.glyphs}
      isActive={d.active}
      isMatch={d.isMatch}
      isDeleteable={d.id != 1}
      onSelect={handleSelectCanvas}
      onDelete={handleDeleteCanvas}
      onClone={handleOpenCloneCanvasDialog}
      onDownload={handleDownloadCanvas}
      onEdit={handleOpenEditCanvasDialog}
      width={d.thumbnailWidth}
      height={d.thumbnailHeight}
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
        <input type="text" onChange={handlesearchStringChange}/>
        <div className="c-canvas-bar__add" onClick={handleOpenAddCanvasDialog}>
          <span>+</span>
        </div>
        {canvasEls}
      </div>
    </aside>
  );
});

export default CanvasBar;
