import { observable, action, compute } from 'mobx';

import { addEvent, windowWidth, windowHeight } from '../utils/browser';
import config from '../config/config';
import dataAPI from 'data/dataAPI';

import {
  first,
  last,
  remove,
  intersection,
  includes,
  isEmpty,
  find,
} from 'lodash';

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
  @observable editComment = false; 
  @observable showLabels = true;
  @observable showLines = true;
  @observable toolTipBlocked = false;

  @observable
  canvases = [
    {
      id: 1,
      title: '',
      comment: '',
      layout: config.LAYOUT_DEFAULT,
      layoutControls: {},
      textBarShowsAll: true,
      showLabels: true,
      showComment: true,
      filters: [],
      glyphs: {},
      selectedAnnotationIds: [],
      isMatch: true,
      zoomState: {
        x: 0,
        y: 0,
        k: 1
      }
    },
  ];

  @observable activeCanvasId = 1;
  @observable editCanvasId = '';
  @observable cloneCanvasId = '';
  @observable activeFilterIds = [];
  @observable activeLayoutControls = [];
  @observable canvasSearchString = '';

  @observable annotationProperties = [];

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
  };

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

  @action
  changeSelectedAnnotationProperties(property, value) {
    if (this.selectedAnnotationIds.length == 0) {
      return;
    }

    uiState.selectedAnnotationIds.forEach(annotationId => {
      let annotationProperty = dataAPI.annotationPropertiesById[annotationId];
      if (annotationProperty) {
        // already exists
        const propertyItem = find(
          annotationProperty.items,
          e => e.id == property,
        );
        if (!propertyItem) {
          // add item
          annotationProperty.items.push({ id: property, value: value });
        } else {
          if (propertyItem.value == value) {
            // delete item
            remove(annotationProperty.items, e => e.id == property);
          } else {
            // edit item
            propertyItem.value = value;
          }
        }
      } else {
        // new
        annotationProperty = { id: annotationId, items: [] };
        annotationProperty.items.push({ id: property, value: value });
        this.annotationProperties.push(annotationProperty);
      }
    });
  }

  // Canvas

  @action
  addCanvas = (title, layout, comment) => {
    const newId = last(this.canvases).id + 1;
    this.canvases.push({
      id: newId,
      title: title,
      comment: comment,
      layout: layout,
      layoutControls: [],
      textBarShowsAll: true,
      showLabels: true,
      showComment: comment.length != 0 ? true : false,
      filters: [],
      glyphs: {},
      selectedAnnotationIds: [],
      isMatch: true,
      zoomState: {
        x: 0,
        y: 0,
        k: 1
      }
    });
    this.showAddCanvasDialog = !this.showAddCanvasDialog;
    this.setActiveCanvas(newId);
  };

  @action
  editCanvas = (title, layout, comment) => {
    const canvas = this.canvases.find(d => d.id == this.editCanvasId);
    canvas.title = title;
    canvas.layout = layout;
    canvas.comment = comment;
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
    canvas.glyphs = [...dataAPI.filteredLayoutedElements.glyphs];
    canvas.zoomState = dataAPI.activeCanvas.zoomState;
    // copy new active filters
    this.activeCanvasId = id;
    canvas = this.canvases.find(d => d.id == id);
    this.activeFilterIds = canvas.filters;
    this.showLabels = canvas.showLabels;
    this.activeLayoutControls = canvas.layoutControls;
    this.selectedAnnotationIds = canvas.selectedAnnotationIds;

    //copy comment
    dataAPI.activeCanvas.comment = canvas.comment;
  };

  @action
  cloneCanvas = (title, layout, comment) => {
    let originalCanvas = this.canvases.find(d => d.id == this.cloneCanvasId);
    const newId = last(this.canvases).id + 1;
    this.canvases.push({
      id: newId,
      title: title,
      comment: comment,
      layout: layout,
      layoutControls: [...this.activeLayoutControls],
      textBarShowsAll: originalCanvas.textBarShowsAll,
      showLabels: this.showLabels,
      showComment:
        originalCanvas.showComment || comment.length != 0 ? true : false,
      filters: [...this.activeFilterIds],
      glyphs: [...dataAPI.filteredLayoutedElements.glyphs],
      selectedAnnotationIds: [...this.selectedAnnotationIds],
      isMatch: originalCanvas.isMatch,
      zoomState: {
        x: originalCanvas.zoomState.x,
        y: originalCanvas.zoomState.y,
        k: originalCanvas.zoomState.k
      }
    });
    this.cloneCanvasId = '';
    this.setActiveCanvas(newId);
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
    //console.log(id);
    if (id.localeCompare("lines") == 0) {
      if (value == true) {
        this.showLines = true;
      } else {
        this.showLines = false;
      }
    }
    //console.log(dataAPI.activeLayoutControlsById);
  };

  @action
  changeComment = comment => {
    const canvas = this.canvases.find(d => d.id == this.activeCanvasId);
    canvas.comment = comment.target.value;
  };

  @action 
  changeSearchString = searchString => {
    this.canvasSearchString = searchString.target.value;
  }


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
  triggerCloneCanvasDialog = id => {
    this.cloneCanvasId = id;
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

  @action
  triggerCommentPanel = () => {
    dataAPI.activeCanvas.showComment = !dataAPI.activeCanvas.showComment;
  };

  @action
  startEditComment = () => {
    this.editComment = true;
  };

  @action
  endEditComment = () => {
    this.editComment = false;
  };

  @action
  blockToolTip() {
    this.toolTipBlocked = true;
  }

  @action
  unblockToolTip() {
    this.hoveredNodeId = null;
    this.toolTipBlocked = false;
  }

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
