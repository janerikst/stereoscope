import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';

import Button from '../components/Button';
import TrashIcon from 'react-icons/lib/fa/trash';
import FilterIcon from 'react-icons/lib/fa/filter';
import ConfigIcon from 'react-icons/lib/fa/cog';
import ChartIcon from 'react-icons/lib/fa/bar-chart';
import LabelIcon from 'react-icons/lib/fa/font';

const CanvasControls = observer(props => {
  // var
  const { activeCanvas, layoutList } = dataAPI;
  const { showFilterPanel, showLayoutPanel, showLabels } = uiState;

  // interactions
  const handleLayoutChange = event => {
    const target = event.target;
    uiState.changeActiveCanvasLayout(target.value);
  };
  const handleFilterToggle = () => uiState.triggerFilterPanel();
  const handleLayoutToggle = () => uiState.triggerLayoutPanel();
  const handleLabelToggle = () => uiState.triggerLabels();
  const handleDeleteCanvas = () => uiState.deleteCanvas(activeCanvas.id);

  // content
  const layoutOptions = layoutList.map(d => {
    return (
      <option key={d.id} value={d.id}>
        {d.title}
      </option>
    );
  });

  // renders
  return (
    <div className="c-canvas-controls">
      <div className="c-canvas-controls__select">
        <ChartIcon />
        <select value={activeCanvas.layout} onChange={handleLayoutChange}>
          {layoutOptions}
        </select>
      </div>
      <Button isActive={showFilterPanel} onClick={handleFilterToggle}>
        <FilterIcon />
      </Button>
      <Button isActive={showLayoutPanel} onClick={handleLayoutToggle}>
        <ConfigIcon />
      </Button>
      <Button isActive={showLabels} onClick={handleLabelToggle}>
        <LabelIcon />
      </Button>
      {activeCanvas.id != 1 && (
        <Button isRight={true} onClick={handleDeleteCanvas}>
          <TrashIcon />
        </Button>
      )}
    </div>
  );
});

export default CanvasControls;
