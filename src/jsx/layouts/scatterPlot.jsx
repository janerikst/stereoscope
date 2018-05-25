import { keyBy, orderBy } from 'lodash';
import { scaleLinear, extent } from 'd3';
import moment from 'moment';

export default {
  id: 'scatterplot',
  title: 'ScatterPlot',
  inputs: [
    {
      id: 'xAxis',
      title: 'X Axis',
      type: 'list',
      value: 'startOffset',
      values: [
        {
          id: 'startOffset',
          title: 'Text Position',
        },
        {
          id: 'textLength',
          title: 'Annotations Length',
        },
        {
          id: 'tagVersion',
          title: 'Creation Time',
        },
      ],
    },
    {
      id: 'yAxis',
      title: 'Y Axis',
      type: 'list',
      value: 'textLength',
      values: [
        {
          id: 'startOffset',
          title: 'Text Position',
        },
        {
          id: 'textLength',
          title: 'Annotations Length',
        },
        {
          id: 'tagVersion',
          title: 'Creation Time',
        },
      ],
    },
  ],

  create: function grid(glyphs, width, height, options) {
    // vars
    const margins = { top: 40, bottom: 50, right: 40, left: 110 };
    const stageWidth = width - margins.right;
    const stageHeight = height - margins.top - margins.bottom;

    // option handling
    const internalOptions = keyBy(this.inputs, 'id');
    const optionKey = key => {
      return options[key] ? options[key].value : internalOptions[key].value;
    };
    const keyX = optionKey('xAxis');
    const keyY = optionKey('yAxis');
    const titleX = internalOptions['xAxis'].values.find(d => d.id == keyX)
      .title;
    const titleY = internalOptions['xAxis'].values.find(d => d.id == keyY)
      .title;

    // scales
    const extentX = extent(glyphs, d => {
      return d[keyX];
    });
    const extentY = extent(glyphs, d => {
      return d[keyY];
    });

    const scaleX = scaleLinear()
      .domain(extentX)
      .range([margins.left, stageWidth]);
    const scaleY = scaleLinear()
      .domain(extentY)
      .range([stageHeight, margins.top]);

    // set positions
    const output = [];
    orderBy(glyphs, d => d.tagVersion).map(d => {
      output.push({
        ...d,
        x: scaleX(d[keyX]),
        y: scaleY(d[keyY]),
      });
    });

    // set axis
    const labelGroups = [
      {
        id: 'xAxis',
        title: titleX,
        deg: 0,
        x: stageWidth / 2,
        y: stageHeight + 60,
        labels: [],
      },
      {
        id: 'yAxis',
        title: titleY,
        deg: -90,
        x: scaleX.range()[0] - 80,
        y: stageHeight / 2,
        labels: [],
      },
    ];
    const xTicks = scaleX.ticks();
    const yTicks = scaleY.ticks();

    labelGroups[0].labels = xTicks.map((tick, i) => {
      return {
        id: i,
        value: tick,
        x: scaleX(tick),
        y: scaleY.range()[0] + 30,
        alignment: 'middle',
      };
    });

    labelGroups[1].labels = yTicks.map((tick, i) => {
      return {
        id: i,
        value: keyY == 'tagVersion' ? moment(tick).format('YY/MM/DD') : tick,
        x: scaleX.range()[0] - 10,
        y: scaleY(tick),
        alignment: 'end',
      };
    });

    return { glyphs: output, labelGroups };
  },
};
