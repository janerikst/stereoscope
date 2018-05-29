import { observable, action, compute } from 'mobx';

import { addEvent, windowWidth, windowHeight } from '../utils/browser';
import config from '../config/config';
import dataAPI from 'data/dataAPI';

import { first, last, remove, intersection, includes } from 'lodash';

class UiState {
  // --------------------
  //
  // *** UI VARIABLES ***
  //
  // --------------------

  @observable mouse = { x: 0, y: 0 }; // mouse position

  @observable.struct
  windowDimensions = {
    width: windowWidth(),
    height: windowHeight(),
  };

  constructor() {
    addEvent(window, 'resize', () => {
      this.windowDimensions = {
        width: windowWidth(),
        height: windowHeight(),
      };
    });

    document.onmousemove = e => {
      this.mouse.x = e.pageX;
      this.mouse.y = e.pageY;
    };
  }

  // --------------------
  //
  // *** APP VARIABLES ***
  //
  // --------------------

  @observable textFile = '';
  @observable annotationFile = '';

  @observable showAddCanvasDialog = false;
  @observable showDataDialog = false;
  @observable showFilterPanel = false;
  @observable showLayoutPanel = false;
  @observable showLabels = true;

  @observable
  canvases = [
    {
      id: 1,
      title: '',
      layout: config.LAYOUT_DEFAULT,
      layoutControls: {},
      textBarShowsAll: true,
      showLabels: true,
      filters: [],
      glyphs: {},
      selectedAnnotationIds: [],
      selectedAnnotationFixed: false,
    },
  ];

  @observable activeCanvasId = 1;
  @observable editCanvasId = '';
  @observable activeFilterIds = [];
  @observable activeLayoutControls = [];

  @observable hoveredAnnotationIds = [];
  @observable selectedAnnotationIds = [];
  @observable scrollToAnnotationId = '';

  // --------------------
  //
  // *** ACTIONS ***
  //
  // --------------------

  // Annotations

  @action
  setHoveredAnnotation = ids => {
    if (ids == undefined || ids == '') {
      this.hoveredAnnotationIds = [];
    } else {
      this.hoveredAnnotationIds = ids;
    }
  };

  @action
  changeSelectedAnnotation = (ids, single = false) => {
    if (single) {
      if (intersection(this.selectedAnnotationIds, ids).length == ids.length) {
        this.selectedAnnotationIds = [];
      } else {
        this.selectedAnnotationIds = ids;
      }

      this.hoveredAnnotationIds = [];
    } else {
      ids.forEach(id => {
        if (dataAPI.selectedAnnotationIdsById[id]) {
          remove(this.selectedAnnotationIds, d => d == id);
        } else {
          this.selectedAnnotationIds.push(id);
          this.hoveredAnnotationIds = [];
        }
      });
    }
  };

  @action 
  changeTextBarModeAndScrollToAnnotation = id => {
    dataAPI.activeCanvas.textBarShowsAll = true;
    this.scrollToAnnotationId = id;  
  }

  @action
  scrollToAnnotation = id => {
    if (
      dataAPI.activeCanvas.textBarShowsAll ||
      (!dataAPI.activeCanvas.textBarShowsAll &&
        includes(this.selectedAnnotationIds, id))
    ) {
      this.scrollToAnnotationId = id;
    } else {
      this.scrollToAnnotationId = '';
    }
  };

  @action
  scrollToAnnotationDone = () => {
    this.scrollToAnnotationId = '';
  };

  @action resetSelectedAnnotation = () => (this.selectedAnnotationIds = []);

  // Canvas

  @action
  addCanvas = (title, layout) => {
    const newId = last(this.canvases).id + 1;
    this.canvases.push({
      id: newId,
      title: title,
      layout: layout,
      layoutControls: [],
      textBarShowsAll: true,
      showLabels: true,
      filters: [],
      glyphs: {},
      selectedAnnotationIds: [],
      selectedAnnotationFixed: false,
    });
    this.showAddCanvasDialog = !this.showAddCanvasDialog;
    this.setActiveCanvas(newId);
  };

  @action
  editCanvas = (title, layout) => {
    const canvas = this.canvases.find(d => d.id == this.editCanvasId);
    canvas.title = title;
    canvas.layout = layout;
    this.editCanvasId = '';
  };

  @action
  deleteCanvas = id => {
    if (this.activeCanvasId == id) {
      // tries to delete the active canvas -> set new one
      this.setActiveCanvas(this.canvases.find(d => d.id != id).id);
    }
    remove(this.canvases, d => d.id == id);
  };

  @action
  setActiveCanvas = id => {
    // write active filter to old active canvas
    let canvas = this.canvases.find(d => d.id == this.activeCanvasId);
    canvas.filters = this.activeFilterIds;
    canvas.showLabels = this.showLabels;
    canvas.layoutControls = this.activeLayoutControls;
    canvas.selectedAnnotationIds = this.selectedAnnotationIds;
    canvas.glyphs = [...dataAPI.layoutedElements.glyphs];

    // copy new active filters
    this.activeCanvasId = id;
    canvas = this.canvases.find(d => d.id == id);
    this.activeFilterIds = canvas.filters;
    this.showLabels = canvas.showLabels;
    this.activeLayoutControls = canvas.layoutControls;
    this.selectedAnnotationIds = canvas.selectedAnnotationIds;
  };

  @action
  changeActiveCanvasLayout = layout => {
    dataAPI.activeCanvas.layout = layout;
  };

  @action
  changeTextBarMode = mode => {
    dataAPI.activeCanvas.textBarShowsAll = mode;
  };

  @action
  changeActiveCanvasFilters = filter => {
    if (dataAPI.activeFilterIdsById[filter]) {
      remove(this.activeFilterIds, d => d == filter);
    } else {
      this.activeFilterIds.push(filter);
    }
  };

  @action resetActiveCanvasFilters = () => (this.activeFilterIds = []);

  @action
  changeActiveCanvasLayoutControls = (id, value) => {
    if (dataAPI.activeLayoutControlsById[id]) {
      remove(this.activeLayoutControls, d => d.id == id);
    }
    this.activeLayoutControls.push({ id: id, value: value });
  };

  // Dialogs

  @action
  triggerAddCanvasDialog = () => {
    this.showAddCanvasDialog = !this.showAddCanvasDialog;
  };

  @action
  triggerEditCanvasDialog = id => {
    this.editCanvasId = id;
  };

  @action
  triggerDataDialog = () => {
    this.showDataDialog = !this.showDataDialog;
  };

  @action
  triggerFilterPanel = () => {
    this.showFilterPanel = !this.showFilterPanel;
  };

  @action
  triggerLayoutPanel = () => {
    this.showLayoutPanel = !this.showLayoutPanel;
  };

  @action
  triggerLabels = () => {
    this.showLabels = !this.showLabels;
  };

  // Data

  @action
  setDataFiles = (text, annotation) => {
    this.textFile = text;
    this.annotationFile = annotation;
    this.showDataDialog = false;
  };
}

const uiState = new UiState();
export default uiState;
