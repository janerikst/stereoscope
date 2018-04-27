import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

const Details = observer(props => {
  return (
    <div className="l-content-container l-content-container-auto">
      <header className="c-header--small">
        <h2>Canvas</h2>
      </header>
      <div className="l-content-spacing" />
    </div>
  );
});

export default Details;
