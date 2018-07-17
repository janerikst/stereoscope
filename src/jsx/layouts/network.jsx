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
  inputs: [
    {
      id: 'enclosed',
      title: 'Enclosed',
      type: 'checkbox',
      value: 'true'
    },
    {
      id: 'overlapping',
      title: 'Overlapping',
      type: 'checkbox',
      value: 'true'
    },
    {
      id: 'coextensive',
      title: 'Coextensive',
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
    const ids = {}

    // add links (with some code to sort out duplicates)

    glyphs.forEach(d => {
      //console.log(d.intersections);
      if (d.relationships.length) {
        d.relationships.forEach(e => {
          ids[(e.id+d.id)] = 0;
          if (ids[(d.id+e.id)] == undefined) {
            links.push({ id: (d.id+e.id), source: d.id, x1: d.x, y1: d.y, target: e.id, x2: e.x, y2: e.y, relationship: e.value });
          }
          ids[(d.id+e.id)] = 0;
          
        });
      }
      output.push({ ...d });
    });

    //console.log(ids);

    //console.log(links);

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
