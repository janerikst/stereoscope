import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';

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
      activeTextElements,
      activeTextGlyphs,
      hasSelectedAnnotations,
      hasMoreSelectedAnnotations,
    } = dataAPI;
    const { TEXT_BAR_WIDTH } = config;
    const { overlayHeight, overlayPos } = this.state;

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
              {textGlyphs}
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
              {textEls}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  componentDidUpdate() {
    const textArea = ReactDOM.findDOMNode(this.textArea);

    let node = undefined;
    if (this.selectedText) {
      // hovered text
      node = ReactDOM.findDOMNode(this.selectedText);
      this.selectedText = undefined;
    }

    if (node) {
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
