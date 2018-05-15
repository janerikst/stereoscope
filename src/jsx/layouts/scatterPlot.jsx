import { keyBy, orderBy } from 'lodash';
import { scaleLinear, extent } from 'd3';

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
    const margins = { top: 30, bottom: 150, right: 30, left: 30 };
    const stageWidth = width - margins.left - margins.right;
    const stageHeight = height - margins.top - margins.bottom;

    // option handling
    const internalOptions = keyBy(this.inputs, 'id');
    const optionKey = key => {
      return options[key] ? options[key].value : internalOptions[key].value;
    };
    const keyX = optionKey('xAxis');
    const keyY = optionKey('yAxis');

    // scales
    const extentX = extent(glyphs, d => {
      return d[keyX];
    });
    const extentY = extent(glyphs, d => {
      return d[keyY];
    });

    const scaleX = scaleLinear()
      .domain(extentX)
      .range([margins.right, stageWidth]);
    const scaleY = scaleLinear()
      .domain(extentY)
      .range([stageHeight, margins.top]);

    // process
    const output = [];
    orderBy(glyphs, d => d.tagVersion).map(d => {
      output.push({ ...d, x: scaleX(d[keyX]), y: scaleY(d[keyY]) });
    });
    return { glyphs: output };
  },
};
