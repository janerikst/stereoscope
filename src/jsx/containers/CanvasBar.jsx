import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import Button from '../components/Button';
import MenuIcon from 'react-icons/lib/md/menu';

import { scaleLinear } from 'd3';

import CanvasThumbnail from '../components/CanvasThumbnail';

const CanvasBar = observer(props => {
  // vars
  const { canvasList, filteredCanvasList, taggedAndFilteredCanvasList, downloadDetailedAnnotations } = dataAPI;
  const { CANVAS_BAR_WIDTH } = config;
  const { activeTag } = uiState;

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

  const handleOpenEditTagsDialog = id => uiState.triggerEditTagsDialog(id);

  const handleTagSelected = tag => {
    //console.log(event.target.attributes.getNamedItem('tag'));
    //const tag = event.target.attributes.getNamedItem('tag').value;    
    uiState.setActiveTag(tag);
  }

  const canvasEls = taggedAndFilteredCanvasList 
    ? taggedAndFilteredCanvasList.map((d, i) => {
        return (<CanvasThumbnail
          key={d.id}
          id={d.id}
          title={d.title}
          layout={d.layout}
          tags={d.tags}
          tagSelected={d.tagSelected}
          glyphs={d.glyphs}
          isActive={d.active}
          isMatch={d.isMatch}
          isDeleteable={d.id != 1}
          onSelect={handleSelectCanvas}
          onTagSelect={handleOpenEditTagsDialog}
          onTagFilter={handleTagSelected}
          onDelete={handleDeleteCanvas}
          onClone={handleOpenCloneCanvasDialog}
          onDownload={handleDownloadCanvas}
          onEdit={handleOpenEditCanvasDialog}
          width={d.thumbnailWidth}
          height={d.thumbnailHeight}
        />)
      })
    : [];

    const taggedCanvasEls = taggedAndFilteredCanvasList
      ? taggedAndFilteredCanvasList.filter(d => d.tagSelected == true).map((d,i) => {
        return (<CanvasThumbnail
          key={d.id}
          id={d.id}
          title={d.title}
          layout={d.layout}
          tags={d.tags}
          tagSelected={d.tagSelected}
          glyphs={d.glyphs}
          isActive={d.active}
          isMatch={d.isMatch}
          isDeleteable={d.id != 1}
          onSelect={handleSelectCanvas}
          onTagSelect={handleOpenEditTagsDialog}
          onTagFilter={handleTagSelected}
          onDelete={handleDeleteCanvas}
          onClone={handleOpenCloneCanvasDialog}
          onDownload={handleDownloadCanvas}
          onEdit={handleOpenEditCanvasDialog}
          width={d.thumbnailWidth}
          height={d.thumbnailHeight}
        />)
      })
      : [];

  // render
  return (
    <aside
      className="c-canvas-bar l-content-container l-content-container-border"
      style={{ width: CANVAS_BAR_WIDTH }}>
      <header className="c-header--small">
        <h2>Views</h2>
      </header>
      <div className="c-canvas-bar__search">
        {activeTag &&
          <div className="c-canvas-bar__tag_container">
            <span className="c-canvas-bar__before_tag">
              Tag
            </span>
            <div className="c-canvas-bar__tag">
              <span>
                {activeTag + " "}
              </span>
              <span className="c-canvas-bar__tagicon" onClick={() => handleTagSelected()}>
                x
              </span>
            </div>
          </div>
        }
        <input type="text" placeholder="Search comments" onChange={handlesearchStringChange}/>
      </div>
      <div className="c-canvas-bar__thumbnails l-content-spacing-canvasbar">  
        <div className="c-canvas-bar__add" onClick={handleOpenAddCanvasDialog}>
          <span>+</span>
        </div>
        {activeTag && taggedCanvasEls}
        {!activeTag && canvasEls}
      </div>
    </aside>
  );
});

export default CanvasBar;
