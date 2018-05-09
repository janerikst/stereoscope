import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import TextElement from '../components/TextElement';
import TextGlyph from '../components/TextGlyph';

@observer
class TextBar extends Component {
  constructor(props) {
    super(props);
    this.selectedText = undefined;
    this.textWrapper = undefined;
  }

  render() {
    // vars
    const { activeTextElements, activeTextGlyphs } = dataAPI;
    const { selectedAnnotationIds } = uiState;
    const { TEXT_BAR_WIDTH } = config;

    const selectedAnnotationIdsCount = selectedAnnotationIds.length;
    const hasMoreSelectedAnnotations = selectedAnnotationIdsCount > 1;

    // interactions
    const handleTextHover = ids => uiState.setHoveredAnnotation(ids);
    const handleTextSelect = ids => uiState.changeSelectedAnnotation(ids);
    const handleSelectedAnnotationReset = ids =>
      uiState.resetSelectedAnnotation();

    // content
    let textEls;
    if (!hasMoreSelectedAnnotations) {
      // normal text
      textEls = activeTextElements.map(d => {
        return (
          <TextElement
            key={d.id}
            text={d.text}
            annotations={d.annotations}
            isActive={d.active}
            isHovered={d.hovered}
            isSelected={d.selected}
            onHover={handleTextHover}
            onClick={handleTextSelect}
            ref={ref => {
              if (d.scrollTo) {
                this.selectedText = ref;
              }
            }}
          />
        );
      });
    } else {
      // selected text +1
      textEls = activeTextElements.map(group => {
        return (
          <div key={group.id} className="c-text-area__selected-text">
            {group.items.map(d => {
              return (
                <TextElement
                  key={d.id}
                  text={d.text}
                  annotations={d.annotations}
                  isActive={d.active}
                  isHovered={d.hovered}
                  isSelected={false}
                  onHover={handleTextHover}
                  onClick={handleTextSelect}
                  ref={ref => {
                    if (d.scrollTo) {
                      this.selectedText = ref;
                    }
                  }}
                />
              );
            })}
          </div>
        );
      });
    }

    const textGlyphs = activeTextGlyphs.map(d => {
      return (
        <TextGlyph
          key={d.id}
          y={d.start}
          height={d.height}
          color={d.color}
          active={d.active}
        />
      );
    });

    // render
    return (
      <aside className="l-content-container" style={{ width: TEXT_BAR_WIDTH }}>
        <header className="c-header--small">
          <h2>Text View</h2>
          {selectedAnnotationIdsCount != 0 && (
            <span
              className="c-header__right_element o-link"
              onClick={handleSelectedAnnotationReset}>
              (Reset)
            </span>
          )}
        </header>
        <div className="l-content-spacing">
          <div className="c-text-nav">{textGlyphs}</div>
          <div
            className="c-text-area"
            ref={x => {
              this.textWrapper = x;
            }}>
            {textEls}
          </div>
        </div>
      </aside>
    );
  }

  componentDidUpdate() {
    const panel = this.textWrapper;
    let node = undefined;

    if (this.selectedText) {
      // hovered text
      node = ReactDOM.findDOMNode(this.selectedText);
      this.selectedText = undefined;
    }

    if (node) {
      if (
        node.offsetTop > panel.scrollTop + panel.offsetHeight ||
        node.offsetTop < panel.scrollTop
      ) {
        //panel.scrollTop = node.offsetTop - panel.offsetTop;
        this.scrollToEl(panel, node.offsetTop - panel.offsetTop, 300);
        uiState.scrollToAnnotationDone();
      }
    }
  }

  scrollToEl(element, to, duration) {
    if (duration <= 0) return;
    const difference = to - element.scrollTop;
    const perTick = difference / duration * 10;

    setTimeout(() => {
      element.scrollTop = element.scrollTop + perTick;
      if (element.scrollTop === to) return;
      this.scrollToEl(element, to, duration - 10);
    }, 10);
  }
}

export default TextBar;
