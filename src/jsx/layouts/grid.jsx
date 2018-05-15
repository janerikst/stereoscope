import { orderBy } from 'lodash';

export default {
  id: 'grid',
  title: 'Grid',
  inputs: [],
  create: function grid(glyphs, width, height, options) {
    let largestRadiusPerRow = 0;
    const space = 5;
    let xSpace = 0;
    let ySpace = 0;
    let yPos = 0;

    const yPositions = {};
    const output = [];

    // calc x position
    orderBy(glyphs, 'tagVersion').map(glyph => {
      if (xSpace + glyph.radius * 2 > width) {
        ySpace += largestRadiusPerRow * 2 + space;
        yPositions[yPos] = ySpace;
        yPos += 1;
        largestRadiusPerRow = 0;
        xSpace = 0;
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
        d.y = yPositions[d.y - 1] + (yPositions[d.y] - yPositions[d.y - 1]) / 2;
      }
    });
    return output;
  },
};
