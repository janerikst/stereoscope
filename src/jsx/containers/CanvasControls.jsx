import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';

import Button from '../components/Button';
import TrashIcon from 'react-icons/lib/md/delete';
import FilterIcon from 'react-icons/lib/md/filter-list';
import ConfigIcon from 'react-icons/lib/md/settings';
import ChartIcon from 'react-icons/lib/md/insert-chart';
import LabelIcon from 'react-icons/lib/md/font-download';
import CommentIcon from 'react-icons/lib/md/comment';
import FileIcon from 'react-icons/lib/md/image';

const CanvasControls = observer(props => {
  // var
  const { onDownload } = props;
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
  const handleCommentToggle = () => uiState.triggerCommentPanel();
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
        <select className="c-canvas-controls__select__element" value={activeCanvas.layout} onChange={handleLayoutChange}>
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
      <Button isActive={activeCanvas.showComment} onClick={handleCommentToggle}>
        <CommentIcon />
      </Button>
      <Button isRight={true} onClick={onDownload}>
        <FileIcon />
      </Button>
      {activeCanvas.id != 1 && (
        <Button onClick={handleDeleteCanvas}>
          <TrashIcon />
        </Button>
      )}
    </div>
  );
});

export default CanvasControls;
