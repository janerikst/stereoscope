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

  // app specific vars

  @observable textFile = '';
  @observable annotationFile = '';

  @observable
  canvases = [{ id: 1, title: '', layout: 'creation_period', filter: [] }];
  @observable selectedCanvas = '1';
}

const uiState = new UiState();
export default uiState;
