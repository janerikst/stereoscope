import { keyBy, orderBy } from 'lodash';

export default {
  id: 'grid',
  title: 'Grid',
  inputs: [
    {
      id: 'sorting',
      title: 'Sorting',
      type: 'list',
      value: 'tagVersion',
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
    // option handling
    const internalOptions = keyBy(this.inputs, 'id');
    const optionKey = key => {
      return options[key] ? options[key].value : internalOptions[key].value;
    };
    const sortKey = optionKey('sorting');

    // vars
    const marginX = 30;
    const marginY = 50;

    let largestRadiusPerRow = 0;
    const space = 5;
    let xSpace = marginX;
    let ySpace = 0;
    let yPos = 0;

    const yPositions = {};
    const output = [];

    // calc x position
    orderBy(glyphs, sortKey).map(glyph => {
      if (xSpace + glyph.radius * 2 + marginX > width) {
        ySpace += largestRadiusPerRow * 2 + space;
        yPositions[yPos] = ySpace;
        yPos += 1;
        largestRadiusPerRow = 0;
        xSpace = marginX;
      }
      output.push({
        ...glyph,
        x: xSpace + glyph.radius,
        y: yPos,
      });
      xSpace += glyph.radius * 2 + space;
      largestRadiusPerRow = Math.max(largestRadiusPerRow, glyph.radius);
    });
    if (xSpace > 0) {
      ySpace += largestRadiusPerRow * 2 + space;
      yPositions[yPos] = ySpace;
    }

    // optimize y position
    output.forEach(d => {
      if (d.y != 0) {
        d.y =
          marginY +
          yPositions[d.y - 1] +
          (yPositions[d.y] - yPositions[d.y - 1]) / 2;
      } else {
        d.y = marginY;
      }
    });
    return { glyphs: output };
  },
};
