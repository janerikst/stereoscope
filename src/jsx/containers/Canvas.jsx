import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import CanvasControls from './CanvasControls';
import Glyph from '../components/Glyph';
import FilterPanel from '../components/FilterPanel';
import LayoutPanel from '../components/LayoutPanel';

const Canvas = observer(props => {
  // var
  const {
    hasFilters,
    activeCanvas,
    activeFilters,
    activeLayoutedElements,
    activeLayoutControlsList,
    canvasWidth,
    canvasHeight,
    glyphScaleCertainty,
    glyphScaleImportance,
  } = dataAPI;

  const { showFilterPanel, showLayoutPanel, showLabels } = uiState;
  const { FILTER_PANEL_WIDTH, FILTER_PANEL_HEIGHT, CANVAS_MARGIN } = config;

  // interactions
  const handleFilterChange = filter =>
    uiState.changeActiveCanvasFilters(filter);
  const handleFilterReset = filter => uiState.resetActiveCanvasFilters();

  const handleFilterToggle = () => uiState.triggerFilterPanel();
  const handleLayoutToggle = () => uiState.triggerLayoutPanel();

  const handleLayoutControlChange = (id, value) =>
    uiState.changeActiveCanvasLayoutControls(id, value);

  const handleHoverAnnotation = id => uiState.setHoveredAnnotation([id]);
  const handleScrollToAnnotation = id => uiState.scrollToAnnotation(id);
  const handleSelectAnnotation = id => {
    uiState.changeSelectedAnnotation([id], false);
    // uiState.scrollToAnnotation(id);
  };

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
        certainty={d.certainty}
        importance={d.importance}
        scaleCertainty={glyphScaleCertainty}
        scaleImportance={glyphScaleImportance}
        isHovered={d.hovered}
        isSelected={d.selected}
        isHidden={d.hidden}
        onHover={handleHoverAnnotation}
        onClick={handleScrollToAnnotation}
        onAltClick={handleSelectAnnotation}
      />
    );
  });

  const labels = activeLayoutedElements.labelGroups
    ? activeLayoutedElements.labelGroups.map(group => {
        const output = [];
        group.labels.forEach(label => {
          output.push(
            <text
              key={label.id}
              x={label.x}
              y={label.y}
              textAnchor={label.alignment}>
              {label.value}
            </text>,
          );
        });
        output.push(
          <text
            key={group.id}
            x={group.x}
            y={group.y}
            textAnchor={'middle'}
            transform={`rotate(${group.deg},${group.x},${group.y})`}>
            {group.title}
          </text>,
        );
        return output;
      })
    : [];

  // renders
  return (
    <div className="c-canvas l-content-container l-content-container-auto">
      <header className="c-header--small">
        <CanvasControls />
      </header>
      <div className="c-canvas__stage">
        <div className="c-canvas__innerstage">
          <svg width={canvasWidth} height={canvasHeight}>
            <g className="c-canvas__glyphs">{glyphs}</g>
            {showLabels &&
            labels.length != 0 && <g className="c-canvas__labels">{labels}</g>}
          </svg>
        </div>
        <div className="c-canvas__overlays">
          {showLayoutPanel && (
            <div className="c-canvas__layout-panel">
              <LayoutPanel
                layoutControls={activeLayoutControlsList}
                onTriggerPanel={handleLayoutToggle}
                onChangeControls={handleLayoutControlChange}
              />
            </div>
          )}
          {activeCanvas.showComment && (
            <div className="c-canvas__layout-comment">
              {activeCanvas.comment}
            </div>
          )}
          {showFilterPanel && (
            <div className="c-canvas__filter-panel">
              <FilterPanel
                items={activeFilters}
                hasActiveFilter={hasFilters}
                onChange={handleFilterChange}
                onTriggerPanel={handleFilterToggle}
                onReset={handleFilterReset}
                width={FILTER_PANEL_WIDTH}
                height={FILTER_PANEL_HEIGHT}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Canvas;
