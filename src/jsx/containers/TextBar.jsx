import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import TextElement from '../components/TextElement';

const TextBar = observer(props => {
  // vars
  const { activeTextElements } = dataAPI;
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
              />
            );
          })}
        </div>
      );
    });
  }

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
        <div className="c-text-nav" />
        <div className="c-text-area">{textEls}</div>
      </div>
    </aside>
  );
});

export default TextBar;
