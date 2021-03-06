export default {
  TEXT_FILE: 'data/Novelle.txt',
  ANNOTATION_FILE: 'data/Novelle.json',
  TEXT_BAR_WIDTH: 400,
  TEXT_NAV_WIDTH: 14,
  CANVAS_BAR_WIDTH: 240,
  CANVAS_THUMB_WIDTH: 170,
  CANVAS_DEFAULT_NAME: 'Untitled Canvas',
  TEXT_SELECT_COLOR: '#ddd',
  TEXT_INACTIVE_COLOR: '#eee',
  FILTER_PANEL_WIDTH: 240,
  FILTER_PANEL_HEIGHT: 120,
  COMMENT_PANEL_WIDTH: 240,
  COMMENT_PANEL_HEIGHT: 120,
  ANNOTATION_RADIUS_MIN: 2,
  ANNOTATION_RADIUS_MAX: 25,
  ANNOTATION_SPACE: 2,
  ANNOTATION_PROPERTIES: {
    Sicher: {
      id: 'certainty',
      title: 'Certainty',
      type: 'int',
      min: 1,
      max: 5,
      changeable: true,
    },
    Wichtig: {
      id: 'importance',
      title: 'Importance',
      type: 'int',
      min: 1,
      max: 5,
      changeable: true,
    },
    catma_displaycolor: { id: 'color', type: 'color', changeable: false },
    catma_markupauthor: { id: 'author', type: 'string', changeable: false },
    Kommentar: { id: 'comment', type: 'comment', changeable: false }
  },
  LAYOUT_DEFAULT: 'scatterplot',
};
