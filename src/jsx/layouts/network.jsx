import {
  forceSimulation,
  forceCollide,
  forceLink,
  forceCenter,
  forceManyBody,
} from 'd3';

export default {
  id: 'network',
  title: 'Overlaps',
  inputs: [{
      id: 'lines',
      title: 'Show lines',
      type: 'checkbox',
      value: 'true'
    }
  ],
  create: function grid(glyphs, width, height, options) {
    // vars
    const margins = { top: 30, bottom: 30, right: 30, left: 30 };
    const stageWidth = width - margins.left - margins.right;
    const stageHeight = height - margins.top - margins.bottom;

    const output = [];
    const links = [];

    // add links
    glyphs.forEach(d => {
      if (d.intersections.length) {
        d.intersections.forEach(e => {
          links.push({ id: (d.id+e.id), source: d.id, x1: d.x, y1: d.y, target: e.id, x2: e.x, y2: e.y, value: e.value });
        });
      }
      output.push({ ...d });
    });

    // box boundaries
    // const boxForce = () => {
    //   for (let i = 0, n = output.length; i < n; i++) {
    //     const d = output[i];
    //     d.x = Math.max(d.radius, Math.min(stageWidth - d.radius, d.x));
    //     d.y = Math.max(d.radius, Math.min(stageHeight - d.radius, d.y));
    //   }
    // };

    //start simulation

    var simulation = forceSimulation(output)
      .force(
        'link',
        forceLink(links)
          .id(d => d.id)
          .distance(20)
          .strength(1),
      )
      .force('charge', forceManyBody().strength(-4))
      .force('center', forceCenter(stageWidth / 2, stageHeight / 2))
      .force('collide', forceCollide(d => d.radius * 1.2))
      // .force('box_force', boxForce)
      .stop();

    for (var i = 0; i < 400; ++i) simulation.tick();

    links.forEach(d => {
      output.forEach(e => {
        if (d.source.id.localeCompare(e.id) == 0) {
          d.x1 = e.x;
          d.y1 = e.y;
        }
        if (d.target.id.localeCompare(e.id) == 0) {
          d.x2 = e.x;
          d.y2 = e.y;
        }
      });
    });


    return { glyphs: output, links: links };
  },
};
