import {
  forceSimulation,
  forceCollide,
  forceLink,
  forceCenter,
  forceManyBody,
} from 'd3';

export default {
  id: 'network',
  title: 'Network',
  inputs: [],
  create: function grid(glyphs, width, height, options) {
    // vars
    const margins = { top: 30, bottom: 150, right: 30, left: 30 };
    const stageWidth = width - margins.left - margins.right;
    const stageHeight = height - margins.top - margins.bottom;

    const output = [];
    const links = [];

    // add links
    glyphs.forEach(d => {
      if (d.intersections.length) {
        d.intersections.forEach(e => {
          links.push({ source: d.id, target: e.id, value: e.value });
        });
      }
    });

    // // box boundaries
    // const boxForce = () => {
    //   for (let i = 0, n = glyphs.length; i < n; i++) {
    //     const d = glyphs[i];
    //     d.x = Math.max(d.radius, Math.min(stageWidth - d.radius, d.x));
    //     d.y = Math.max(d.radius, Math.min(stageHeight - d.radius, d.y));
    //   }
    // };
    // start simulation

    // const ticked = () => {
    //   // glyphs.attr('transform', function(d) {
    //   //   return 'translate(' + d.x + ',' + d.y + ')';
    //   // });
    //   console.log(glyphs);
    // };

    var simulation = forceSimulation(glyphs)
      .force(
        'link',
        forceLink(links)
          .id(d => d.id)
          .distance(20)
          .strength(1),
      )
      .force('charge', forceManyBody().strength(-1))
      .force('center', forceCenter(stageWidth / 2, stageHeight / 2))
      .force('collide', forceCollide(d => d.radius * 1.2))
      // .on('tick', ticked)
      // .force('box_force', boxForce)
      .stop();

    for (var i = 0; i < 400; ++i) simulation.tick();

    return glyphs;
  },
};
