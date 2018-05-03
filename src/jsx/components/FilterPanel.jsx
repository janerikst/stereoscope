import React from 'react';

import { max, scaleLinear } from 'd3';
import { observer } from 'mobx-react';

@observer
class FilterPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // vars
    const { items, height, width, onChange } = this.props;
    const margin = 10;
    const stageWidth = width - margin * 2;
    const stageHeight = height - margin * 2;

    const barWidth = 10;
    const barSpace = 5;
    const barHeight = stageHeight - barWidth - 2;

    // content
    const maxCount = max(items, d => d.count);

    const xScale = scaleLinear()
      .domain([0, items.length])
      .range([0, items.length * (barWidth + barSpace) - barSpace]);

    const yScale = scaleLinear()
      .domain([0, maxCount])
      .range([0, barHeight]);

    const bars = items.map((d, i) => {
      return (
        <g key={d.id} transform={`translate(${xScale(i)},0)`}>
          <rect
            y={barHeight - yScale(d.count)}
            width={barWidth}
            height={yScale(d.count)}
            fill={d.active ? d.color : '#ddd'}
            onClick={() => onChange(d.id)}
          />
          <rect
            y={barHeight + barSpace}
            width={barWidth}
            height={barWidth}
            fill={d.color}
            onClick={() => onChange(d.id)}>
            <title>{d.tagPath}</title>
          </rect>
        </g>
      );
    });

    return (
      <div className="c-filter-panel">
        <header className="c-filter-panel__header">
          <h3>Filter</h3>
        </header>
        <div className="c-filter-panel__content">
          <svg width={stageWidth} height={stageHeight}>
            {bars}
          </svg>
        </div>
      </div>
    );
  }
}

export default FilterPanel;
