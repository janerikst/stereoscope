import { orderBy } from 'lodash';

export default {
  create: function creation_period(glyphs, width, height, space) {
    let xSpace = 0;
    let ySpace = 0;
    const output = [];
    orderBy(glyphs, (d, i) => d.tagVersion).map(glyph => {
      if (xSpace + glyph.width > width) {
        ySpace += glyph.height + space;
        xSpace = 0;
      }
      output.push({ ...glyph, x: xSpace, y: ySpace });
      xSpace += glyph.width + space;
    });
    return output;
  },
};
