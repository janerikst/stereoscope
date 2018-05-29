import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import TextElement from '../components/TextElement';
import TextAnnotation from '../components/TextAnnotation';
import TextGlyph from '../components/TextGlyph';

// --------------------
// *** TEXT ELEMENTS ***
// --------------------

const TextElements = observer(props => {
  const { onScrollTo } = props;

  const {
    activeTextElements,
    hasSelectedAnnotations,
    textBarShowsAll,
  } = dataAPI;

  // interactions
  const handleTextHover = ids => uiState.setHoveredAnnotation(ids);
  const handleSingleTextSelect = ids => {
    uiState.changeSelectedAnnotation(ids, true);
  };
  const handleMultiTextSelect = ids => {
    uiState.changeSelectedAnnotation(ids);
  };
  const handleScrollToText = id => {
    uiState.changeTextBarModeAndScrollToAnnotation(id);
  };

  // content

  let textEls;
  if (textBarShowsAll) {
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
          onClick={handleSingleTextSelect}
          onAltClick={handleMultiTextSelect}
          ref={ref => {
            if (d.scrollTo) {
              onScrollTo(ref);
            }
          }}
        />
      );
    });
  } else {
    textEls = activeTextElements.map(d => {
      return (
        <TextAnnotation
          key={d.id}
          id={d.id}
          text={d.text}
          author={d.author}
          tagPath={d.tagPath}
          color={d.color}
          isActive={d.active}
          isHovered={d.hovered}
          onCloseClick={handleMultiTextSelect}
          onTextClick={handleScrollToText}
          ref={ref => {
            if (d.scrollTo) {
              onScrollTo(ref);
            }
          }}
        />
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
        isActive={d.active}
        isSelected={d.selected}
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
      scrollToRef: undefined,
    };
  }

  render() {
    // vars
    const {
      textBarShowsAll,
      hasSelectedAnnotations,
      countSelectedAnnotations,
    } = dataAPI;

    const { TEXT_BAR_WIDTH } = config;
    const { overlayHeight, overlayPos } = this.state;

    // interactions
    const handleSelectedAnnotationReset = ids =>
      uiState.resetSelectedAnnotation();
    const handleTextBarModeChange = mode => uiState.changeTextBarMode(mode);

    // render
    return (
      <aside
        className="c-text-bar l-content-container"
        style={{ width: TEXT_BAR_WIDTH }}>
        <header className="c-header--small">
          <div className="c-text-bar__controls">
            <span
              className={textBarShowsAll ? 'is-active' : ''}
              onClick={() => handleTextBarModeChange(true)}>
              Text
            </span>{' '}
            |{' '}
            <span
              className={!textBarShowsAll ? 'is-active' : ''}
              onClick={() => handleTextBarModeChange(false)}>
              Selected Annotations ({countSelectedAnnotations})
            </span>{' '}
            {hasSelectedAnnotations && (
              <span
                className="o-close"
                onClick={handleSelectedAnnotationReset}
              />
            )}
          </div>
        </header>
        <div className="l-content-spacing">
          {textBarShowsAll && (
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
                  this.setState({ scrollToRef: ref });
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
    if (this.state.scrollToRef) {
      this.scrollToTextelement(this.state.scrollToRef);
    }
  }

  componentDidUpdate() {
    if (this.state.scrollToRef) {
      this.scrollToTextelement(this.state.scrollToRef);
    }
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
      }
    }

    this.setState({ scrollToRef: undefined });
    uiState.scrollToAnnotationDone();
  }

  handleScroll() {
    if (!this.state.scrollToActive) {
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
