import { observable, action, computed } from 'mobx';

import { addEvent, windowWidth, windowHeight } from '../utils/browser';
import config from '../config/config';

class UiState {
  // global ui

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
      filters: { 'CATMA_27EE1670-540D-44A7-A2B6-AC202F3359A6': 1 },
    },
    {
      id: 2,
      title: 'test 2',
      layout: 'distribution',
      filters: {},
    },
  ];
  @observable activeCanvasId = 1;
  @observable editCanvasId = '';

  // --------------------
  //
  // *** ACTIONS ***
  //
  // --------------------

  // Canvas

  @action
  addCanvas = (title, layout) => {
    const newId = last(this.canvases).id + 1;
    this.canvases.push({ id: newId, title: title, layout: layout, filter: [] });
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
    remove(this.canvases, d => d.id == id);
    if (this.activeCanvasId == id) {
      // tries to delete the active canvas -> set new one
      this.activeCanvasId = first(this.canvases).id;
    }
  };

  @action
  setActiveCanvas = id => {
    this.activeCanvasId = id;
  };

  @action
  changeActiveCanvasLayout = layout => {
    dataAPI.activeCanvas.layout = layout;
  };

  @action
  changeActiveCanvasFilters = filter => {
    if (dataAPI.activeCanvas.filters[filter]) {
      delete dataAPI.activeCanvas.filters[filter];
    } else {
      dataAPI.activeCanvas.filters[filter] = 1;
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
