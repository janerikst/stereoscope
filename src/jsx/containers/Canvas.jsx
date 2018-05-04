import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import FilterPanel from '../components/FilterPanel';

const Canvas = observer(props => {
  // var
  const {
    activeCanvas,
    layoutList,
    activeFilters,
    activeGlyphs,
    canvasWidth,
    canvasHeight,
  } = dataAPI;
  const { FILTER_PANEL_WIDTH, FILTER_PANEL_HEIGHT, CANVAS_MARGIN } = config;

  // interactions
  const handleLayoutChange = event =>
    uiState.changeActiveCanvasLayout(event.target.value);

  const handleFilterChange = filter =>
    uiState.changeActiveCanvasFilters(filter);

  // content
  const layoutOptions = layoutList.map(d => {
    return (
      <option key={d.id} value={d.id}>
        {d.label}
      </option>
    );
  });

  const glyphs = activeGlyphs.map(d => {
    return (
      <g key={d.id} transform={`translate(${d.x},${d.y})`}>
        <rect width={d.width} height={d.height} fill="#eee" />
        <rect
          y={d.annotationY}
          width={d.width}
          height={d.annotationHeight}
          fill={d.color}
        />
      </g>
    );
  });

  // renders
  return (
    <div className="c-canvas l-content-container l-content-container-auto">
      <header className="c-header--small">
        <h2>
          Canvas: {activeCanvas.title ? activeCanvas.title : 'Untitled Canvas'}
        </h2>
      </header>
      <div className="c-canvas__stage">
        <div className="c-canvas__glyphs">
          <svg width={canvasWidth} height={canvasHeight}>
            <g transform={`translate(${CANVAS_MARGIN},${CANVAS_MARGIN})`}>
              {glyphs}
            </g>
          </svg>
        </div>
        <div className="c-canvas__controls">
          <div className="c-canvas__layout-control c-filter-panel">
            <header className="c-filter-panel__header">
              <h3>Layouts</h3>
            </header>
            <div className="c-filter-panel__content">
              <select value={activeCanvas.layout} onChange={handleLayoutChange}>
                {layoutOptions}
              </select>
            </div>
          </div>
          <div className="c-canvas__filter-control">
            <FilterPanel
              items={activeFilters}
              onChange={handleFilterChange}
              width={FILTER_PANEL_WIDTH}
              height={FILTER_PANEL_HEIGHT}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Canvas;
