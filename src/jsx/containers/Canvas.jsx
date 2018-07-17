import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import domtoimage from 'dom-to-image';
import FileDownload from 'react-file-download';

import CanvasControls from './CanvasControls';
import Glyph from '../components/Glyph';
import Line from '../components/Line';
import FilterPanel from '../components/FilterPanel';
import LayoutPanel from '../components/LayoutPanel';
import CommentPanel from '../components/CommentPanel';

import {
  call,
  event,
  select,
  zoom,
  zoomIdentity,
  zoomTransform,
  drag,
  transition,
} from 'd3';

@observer
class Canvas extends Component {
  constructor(props) {
    super(props);
    let zoomBehavior;
    let lastLayout;
  }

  componentDidMount() {
    const { activeCanvas } = dataAPI;
    this.lastLayout = activeCanvas.layout;

    const svglEl = select(this.svgEl);
    this.zoomBehavior = zoom()
      .scaleExtent([0.5, 10])
      .on('start', () => {
        uiState.blockToolTip();
      })
      .on('end', () => {
        uiState.unblockToolTip();
      })
      .on('zoom', this.dragAndZoomContainer.bind(this));
    svglEl.call(this.zoomBehavior);
  }

  componentWillUnmount() {
    select(this.svgEl).call(
      zoom()
        .scaleExtent([])
        .on('zoom', function() {}),
    );
  }

  componentDidUpdate() {
    const { activeCanvas } = dataAPI;
    const svglEl = select(this.svgEl);
    if (svglEl) {
      var t = zoomIdentity.translate(activeCanvas.zoomState.x, activeCanvas.zoomState.y).scale(activeCanvas.zoomState.k);
      svglEl.call(this.zoomBehavior.transform, t);
    }
  }

  dragAndZoomContainer() {
    const { activeCanvas } = dataAPI;
    activeCanvas.zoomState.x = event.transform.x;
    activeCanvas.zoomState.y = event.transform.y;
    activeCanvas.zoomState.k = event.transform.k;
  
    select(this.containerEl).attr(
      'transform',
      'translate(' +
        event.transform.x +
        ',' +
        event.transform.y +
        ') scale(' +
        event.transform.k +
        ')',
    );
  }

  render() {
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

    const { showFilterPanel, showLayoutPanel, showLabels, showLines, showEnclosedLines, showOverlappingLines, showCoextensiveLines } = uiState;
    const { FILTER_PANEL_WIDTH, FILTER_PANEL_HEIGHT, CANVAS_MARGIN, COMMENT_PANEL_WIDTH, COMMENT_PANEL_HEIGHT } = config;

    // interactions
    const handleFilterChange = filter =>
      uiState.changeActiveCanvasFilters(filter);
    const handleFilterReset = filter => uiState.resetActiveCanvasFilters();

    const handleCommentChange = comment => {
      //console.log(comment.target.value);
      uiState.changeComment(comment);
    }

    const handleCommentEditToggle = () => uiState.startEditComment();
    const handleCommentEndEditToggle = () => uiState.endEditComment();

    const handleFilterToggle = () => uiState.triggerFilterPanel();
    const handleLayoutToggle = () => uiState.triggerLayoutPanel();
    const handleCommentToggle = () => uiState.triggerCommentPanel();

    const handleLayoutControlChange = (id, value) => 
      uiState.changeActiveCanvasLayoutControls(id, value);

    const handleHoverAnnotation = id => uiState.setHoveredAnnotation([id]);
    const handleScrollToAnnotation = id => uiState.scrollToAnnotation(id);
    const handleSelectAnnotation = id => {
      uiState.changeSelectedAnnotation([id], false);
      // uiState.scrollToAnnotation(id);
    };

    const handleDownloadCanvasImage = () => {
      const stageEl = ReactDOM.findDOMNode(this.stage);
      domtoimage.toBlob(stageEl).then(blob => {
        FileDownload(blob, 'canvas.png');
      });
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

    const links = activeLayoutedElements.links
        ? activeLayoutedElements.links.map(d => {
          return (
            <Line
              id={d.id}
              key={d.id}
              x1={d.x1}
              y1={d.y1}
              x2={d.x2}
              y2={d.y2}
              relationship={d.relationship}
              color={d.color}
              isHidden={d.hidden}
            />
          );
        })
        : [];

    const linksEnclosed = activeLayoutedElements.links
        ? activeLayoutedElements.links.map(d => {
          if (d.relationship.localeCompare("enclosed") == 0) {
            return (
              <Line
                id={d.id}
                key={d.id}
                x1={d.x1}
                y1={d.y1}
                x2={d.x2}
                y2={d.y2}
                relationship={d.relationship}
                color={d.color}
                isHidden={d.hidden}
              />
            );
          }
        })
        : [];

    const linksOverlapping = activeLayoutedElements.links
        ? activeLayoutedElements.links.map(d => {
          if (d.relationship.localeCompare("overlapping") == 0) {
            return (
              <Line
                id={d.id}
                key={d.id}
                x1={d.x1}
                y1={d.y1}
                x2={d.x2}
                y2={d.y2}
                relationship={d.relationship}
                color={d.color}
                isHidden={d.hidden}
              />
            );
          }
        })
        : [];

    const linksCoextensive = activeLayoutedElements.links
        ? activeLayoutedElements.links.map(d => {
          if (d.relationship.localeCompare("coextensive") == 0) {
            return (
              <Line
                id={d.id}
                key={d.id}
                x1={d.x1}
                y1={d.y1}
                x2={d.x2}
                y2={d.y2}
                relationship={d.relationship}
                color={d.color}
                isHidden={d.hidden}
              />
            );
          }
        })
        : [];

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
          <CanvasControls onDownload={handleDownloadCanvasImage} />
        </header>
        <div className="c-canvas__stage">
          <div
            className="c-canvas__innerstage"
            ref={x => {
              this.stage = x;
            }}>
            <div className="c-canvas__title">{activeCanvas.title}</div>
            <svg
              width={canvasWidth}
              height={canvasHeight}
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              preserveAspectRatio="xMidYMid meet"
              ref={x => (this.svgEl = x)}>
              <g
                className="c-canvas__container"
                ref={x => (this.containerEl = x)}>
                {showEnclosedLines && <g className="c-canvas__links">{linksEnclosed}</g>}
                {showOverlappingLines && <g className="c-canvas__links">{linksOverlapping}</g>}
                {showCoextensiveLines && <g className="c-canvas__links">{linksCoextensive}</g>}
                <g className="c-canvas__glyphs">{glyphs}</g>
                {showLabels &&
                labels.length != 0 && (
                  <g className="c-canvas__labels">{labels}</g>
                )}
              </g>
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

            {/* In progress: Making Commentbox clickable to change comment. */}

            {/*activeCanvas.showComment &&
            activeCanvas.comment.length != 0 && (
              <div className="c-canvas__layout-comment">
                {activeCanvas.comment}
              </div>
            )*/}

            {activeCanvas.showComment &&
              <div className="c-canvas__comment-panel">
                <CommentPanel
                  onClick={handleCommentEditToggle}
                  onSave={handleCommentEndEditToggle}
                  onChange={handleCommentChange}
                  onTriggerPanel={handleCommentToggle}
                  value={activeCanvas.comment}
                />
              </div>
            }


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
  }
}

export default Canvas;
