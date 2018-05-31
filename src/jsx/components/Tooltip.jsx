import React from 'react';
import { observer } from 'mobx-react';
import uiState from 'state/uiState';

const Tooltip = observer(props => {
  if (!props.visible) return null;
  const { width } = props;
  const { windowDimensions } = uiState;
  let { x, y } = uiState.mouse;

  const halfWidth = (width + 20) / 2;
  if (x - halfWidth < 0) {
    x = halfWidth;
  } else if (x + halfWidth > windowDimensions.width) {
    x = windowDimensions.width - halfWidth;
  }

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: '9999',
        top: y,
        left: x,
        pointerEvents: 'none',
      }}>
      <div
        className="c-tooltip"
        style={{
          position: 'absolute',
          bottom: '15px',
          padding: '10px',
          background: '#fff',
          boxShadow: 'rgba(0,0,0, .2) 0px 0px 10px',
          transform: 'translate(-50%,0)',
        }}>
        {props.children}
      </div>
    </div>
  );
});
export default Tooltip;
