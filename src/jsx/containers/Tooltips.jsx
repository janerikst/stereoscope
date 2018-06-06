import React, { Component } from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from '../state/uiState';

import Tooltip from '../components/Tooltip';
import TooltipAnnotation from '../components/TooltipAnnotation';

const Tooltips = observer(props => {
  return (
    <div>
      {!uiState.toolTipBlocked &&
      uiState.hoveredAnnotationIds.length != 0 && (
        <Tooltip width={400} visible>
          <TooltipAnnotation items={dataAPI.hoveredAnnotationsDetails} />
        </Tooltip>
      )}
    </div>
  );
});

export default Tooltips;
