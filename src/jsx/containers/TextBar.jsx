import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import TextElement from '../components/TextElement';

const TextBar = observer(props => {
  // vars
  const { activeTextElements } = dataAPI;
  const { TEXT_BAR_WIDTH } = config;

  // content
  const textEls = activeTextElements.map(d => {
    return (
      <TextElement
        key={d.id}
        text={d.text}
        annotations={d.annotations}
        isActive={d.active}
      />
    );
  });
  // render
  return (
    <aside className="l-content-container" style={{ width: TEXT_BAR_WIDTH }}>
      <header className="c-header--small">
        <h2>Text View</h2>
      </header>
      <div className="l-content-spacing">
        <div className="c-text-nav" />
        <div className="c-text-area">{textEls}</div>
      </div>
    </aside>
  );
});

export default TextBar;
