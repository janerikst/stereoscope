import { observable, action, compute } from 'mobx';

import { addEvent, windowWidth, windowHeight } from '../utils/browser';
import config from '../config/config';
import dataAPI from 'data/dataAPI';

import { first, last, remove, clone } from 'lodash';

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

  @observable
  canvases = [
    {
      id: 1,
      title: '',
      layout: 'creation_period',
      filters: [],
    },
    {
      id: 2,
      title: 'test 2',
      layout: 'distribution',
      filters: [],
    },
  ];
  @observable activeFilterIds = [];
  @observable activeCanvasId = 1;
  @observable editCanvasId = '';
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
    if (ids == undefined) {
      this.hoveredAnnotationIds = [];
    } else {
      this.hoveredAnnotationIds = ids;
    }
  };

  @action
  changeSelectedAnnotation = (ids, shouldScroll) => {
    ids.forEach(id => {
      if (dataAPI.selectedAnnotationIdsById[id]) {
        remove(this.selectedAnnotationIds, d => d == id);
      } else {
        this.selectedAnnotationIds.push(id);
        this.scrollToAnnotationId = id;
      }
    });
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
      filters: [],
    });
    this.showAddCanvasDialog = !this.showAddCanvasDialog;
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
      this.setActiveCanvas(first(this.canvases).id);
    }
    remove(this.canvases, d => d.id == id);
  };

  @action
  setActiveCanvas = id => {
    // write active filter to old active canvas
    let canvas = this.canvases.find(d => d.id == this.activeCanvasId);
    canvas.filters = this.activeFilterIds;

    // copy new active filters
    this.activeCanvasId = id;
    canvas = this.canvases.find(d => d.id == id);
    this.activeFilterIds = canvas.filters;
  };

  @action
  changeActiveCanvasLayout = layout => {
    dataAPI.activeCanvas.layout = layout;
  };

  @action
  changeActiveCanvasFilters = filter => {
    if (dataAPI.activeFilterIdsById[filter]) {
      remove(this.activeFilterIds, d => d == filter);
    } else {
      this.activeFilterIds.push(filter);
    }
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
}

const uiState = new UiState();
export default uiState;
