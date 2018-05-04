import { orderBy } from 'lodash';

export default {
  create: function creation_period(glyphs, width, height, space) {
    let xSpace = 0;
    let ySpace = 0;
    const output = [];
    orderBy(glyphs, (d, i) => d.tagVersion).map(glyph => {
      if (xSpace + glyph.radius * 2 > width) {
        ySpace += glyph.radius * 2 + space;
        xSpace = 0;
      }
      output.push({ ...glyph, x: xSpace, y: ySpace });
      xSpace += glyph.radius * 2 + space;
    });
    return output;
  },
};
