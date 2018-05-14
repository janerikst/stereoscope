export default {
  id: 'scatterplot',
  title: 'ScatterPlot',
  inputs: [
    {
      id: 'xAxis',
      title: 'X Axis',
      type: 'list',
      value: 'textPosition',
      values: [
        {
          id: 'textPosition',
          title: 'Text Position',
          dataElement: 'startOffset',
        },
        {
          id: 'annotationLength',
          title: 'Annotationslänge',
          dataElement: 'textLength',
        },
      ],
    },
    {
      id: 'yAxis',
      title: 'Y Axis',
      type: 'list',
      value: 'annotationLength',
      values: [
        {
          id: 'textPosition',
          title: 'Text Position',
          dataElement: 'startOffset',
        },
        {
          id: 'annotationLength',
          title: 'Annotationslänge',
          dataElement: 'textLength',
        },
      ],
    },
  ],
  create: function grid(glyphs, width, height, options) {
    const space = 20;
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
