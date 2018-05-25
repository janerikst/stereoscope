import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import TextElement from '../components/TextElement';
import TextGlyph from '../components/TextGlyph';

// --------------------
// *** TEXT ELEMENTS ***
// --------------------

const TextElements = observer(props => {
  const { onScrollTo } = props;

  const {
    activeTextElements,
    hasSelectedAnnotations,
    hasMoreSelectedAnnotations,
  } = dataAPI;

  // interactions
  const handleTextHover = ids => uiState.setHoveredAnnotation(ids);
  const handleTextSelect = ids => uiState.changeSelectedAnnotation(ids);

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
              onScrollTo(ref);
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
                    onScrollTo(ref);
                  }
                }}
              />
            );
          })}
        </div>
      );
    });
  }
  return <div>{textEls}</div>;
});

// --------------------
// *** TEXT GLYPHS ***
// --------------------

const TextGlyphs = observer(props => {
  const { activeTextGlyphs } = dataAPI;
  const glyphs = activeTextGlyphs.map(d => {
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
  return <div>{glyphs}</div>;
});

// --------------------
// *** TEXT BAR ***
// --------------------

@observer
class TextBar extends Component {
  constructor(props) {
    super(props);
    this.textArea = undefined;
    this.textWrapper = undefined;
    this.textNavOverlay = undefined;
    this.state = {
      overlayHeight: 0,
      overlayRatio: 0,
      clientHeight: 0,
      scrollToActive: false,
    };
  }

  render() {
    // vars
    const {
      activeCanvasTitle,
      hasSelectedAnnotations,
      hasMoreSelectedAnnotations,
    } = dataAPI;

    const { TEXT_BAR_WIDTH } = config;
    const { overlayHeight, overlayPos } = this.state;

    // interactions
    const handleSelectedAnnotationReset = ids =>
      uiState.resetSelectedAnnotation();

    // render
    return (
      <aside className="l-content-container" style={{ width: TEXT_BAR_WIDTH }}>
        <header className="c-header--small">
          <h2>Canvas: {activeCanvasTitle}</h2>
          {hasSelectedAnnotations && (
            <span
              className="c-header__right_element o-link"
              onClick={handleSelectedAnnotationReset}>
              (Reset)
            </span>
          )}
        </header>
        <div className="l-content-spacing">
          {!hasMoreSelectedAnnotations && (
            <div className="c-text-nav">
              <TextGlyphs />
              <div
                className="c-text-nav__overlay"
                ref={x => {
                  this.textNavOverlay = x;
                }}
                style={{ height: overlayHeight, top: overlayPos }}
              />
            </div>
          )}
          <div
            className="c-text-area"
            ref={x => {
              this.textArea = x;
            }}
            onScroll={this.handleScroll.bind(this)}>
            <div
              className="c-text-area__container"
              ref={x => {
                this.textWrapper = x;
              }}>
              <TextElements
                onScrollTo={ref => {
                  this.scrollToTextelement(ref);
                }}
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  getOverlayHeight() {
    const textWrapper = ReactDOM.findDOMNode(this.textWrapper);
    const textArea = ReactDOM.findDOMNode(this.textArea);
    const textWrapperHeight = textWrapper.clientHeight;
    const textAreaHeight = textArea.clientHeight;

    const ratio = textWrapperHeight / textAreaHeight;
    const overlayHeight = Math.round(textArea.clientHeight / ratio);

    this.setState({
      overlayHeight,
      overlayRatio: ratio,
      textWrapperHeight: textWrapperHeight,
    });
  }

  componentDidMount() {
    this.getOverlayHeight();
    const { clientHeight } = this.state;
    autorun(() => {
      if (uiState.windowDimensions.height != clientHeight) {
        this.getOverlayHeight();
        this.setState({ clientHeight: uiState.windowDimensions.height });
      }
    });
  }

  scrollToTextelement(ref) {
    const textArea = ReactDOM.findDOMNode(this.textArea);

    let node = undefined;
    if (ref) {
      // hovered text
      node = ReactDOM.findDOMNode(ref);
      this.selectedText = undefined;
    }

    if (node && textArea) {
      if (
        node.offsetTop > textArea.scrollTop + textArea.offsetHeight ||
        node.offsetTop < textArea.scrollTop
      ) {
        //panel.scrollTop = node.offsetTop - panel.offsetTop;
        this.setState({ scrollToActive: true });
        this.scrollToEl(textArea, node.offsetTop - textArea.offsetTop, 300);
        uiState.scrollToAnnotationDone();
      }
    }
  }

  handleScroll() {
    const { hasMoreSelectedAnnotations } = dataAPI;
    if (!this.state.scrollToActive && !hasMoreSelectedAnnotations) {
      const panel = ReactDOM.findDOMNode(this.textArea);
      this.setState({
        overlayPos: panel.scrollTop / this.state.overlayRatio,
      });
    }
  }

  scrollToEl(element, to, duration) {
    if (duration <= 0) return;
    const difference = to - element.scrollTop;
    const perTick = difference / duration * 10;

    setTimeout(() => {
      element.scrollTop = element.scrollTop + perTick;
      if (element.scrollTop === to) {
        this.setState({ scrollToActive: false });
        return;
      }
      this.scrollToEl(element, to, duration - 10);
    }, 10);
  }
}

export default TextBar;
