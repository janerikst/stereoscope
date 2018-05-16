import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import Glyph from '../components/Glyph';
import FilterPanel from '../components/FilterPanel';
import LayoutPanel from '../components/LayoutPanel';

const Canvas = observer(props => {
  // var
  const {
    activeCanvas,
    layoutList,
    hasFilters,
    activeFilters,
    activeLayoutedElements,
    activeLayoutControlsList,
    canvasWidth,
    canvasHeight,
  } = dataAPI;

  const { FILTER_PANEL_WIDTH, FILTER_PANEL_HEIGHT, CANVAS_MARGIN } = config;

  // interactions
  const handleFilterChange = filter =>
    uiState.changeActiveCanvasFilters(filter);
  const handleFilterReset = filter => uiState.resetActiveCanvasFilters();

  const handleLayoutChange = layout => uiState.changeActiveCanvasLayout(layout);
  const handleLayoutControlChange = (id, value) =>
    uiState.changeActiveCanvasLayoutControls(id, value);

  const handleHoverAnnotation = id => uiState.setHoveredAnnotation([id]);
  const handleScrollToAnnotation = id => uiState.scrollToAnnotation(id);
  const handleSelectAnnotation = id => uiState.changeSelectedAnnotation([id]);

  // content
  const glyphs = activeLayoutedElements.glyphs.map(d => {
    return (
      <Glyph
        id={d.id}
        key={d.id}
        x={d.x}
        y={d.y}
        color={d.color}
        radius={d.radius}
        isHovered={d.hovered}
        isSelected={d.selected}
        isHidden={d.hidden}
        onHover={handleHoverAnnotation}
        onClick={handleScrollToAnnotation}
        onDoubleClick={handleSelectAnnotation}
      />
    );
  });

  const labels = activeLayoutedElements.labelGroups
    ? activeLayoutedElements.labelGroups.map(group => {
        const output = [];
        group.labels.forEach(label => {
          output.push(
            <text x={label.x} y={label.y} textAnchor={label.alignment}>
              {label.value}
            </text>,
          );
        });
        return output;
      })
    : [];

  // renders
  return (
    <div className="c-canvas l-content-container l-content-container-auto">
      <header className="c-header--small">
        <h2>
          Canvas: {activeCanvas.title ? activeCanvas.title : 'Untitled Canvas'}
        </h2>
      </header>
      <div className="c-canvas__stage">
        <div className="c-canvas__innerstage">
          <svg width={canvasWidth} height={canvasHeight}>
            <g transform={`translate(${CANVAS_MARGIN},${CANVAS_MARGIN})`}>
              <g className="c-canvas__glyphs">{glyphs}</g>
              {labels.length != 0 && (
                <g className="c-canvas__labels">{labels}</g>
              )}
            </g>
          </svg>
        </div>
        <div className="c-canvas__controls">
          <div className="c-canvas__layout-control">
            <LayoutPanel
              activeLayout={activeCanvas.layout}
              layoutList={layoutList}
              layoutControls={activeLayoutControlsList}
              onChangeLayout={handleLayoutChange}
              onChangeControls={handleLayoutControlChange}
            />
          </div>
          <div className="c-canvas__filter-control">
            <FilterPanel
              items={activeFilters}
              hasActiveFilter={hasFilters}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
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
