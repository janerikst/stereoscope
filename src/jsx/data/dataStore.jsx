import { lazyObservable } from 'mobx-utils';
import { autorun } from 'mobx';
import { json, text } from 'd3';

import config from 'config/config';
import uiState from '../state/uiState';

const { TEXT_FILE, ANNOTATION_FILE } = config;

// loads text data

export const textData = lazyObservable(sink => {
  autorun(() => {
    const { textFile } = uiState;
    if (textFile != '') {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target.result;
        sink(result ? result : []);
      };
      reader.readAsText(textFile);
    } else if (textFile == '' && TEXT_FILE != '') {
      text(TEXT_FILE, result => sink(result ? result : ''));
    }
  });
});

// loads annoation data

export const annotationData = lazyObservable(sink => {
  autorun(() => {
    const { annotationFile } = uiState;
    // takes local file if nothing is selected
    if (annotationFile != '') {
      const reader = new FileReader();
      reader.onload = e => {
        const result = JSON.parse(e.target.result);
        sink(result ? result : []);
      };
      reader.readAsText(annotationFile);
    } else if (annotationFile == '' && ANNOTATION_FILE != '') {
      json(ANNOTATION_FILE, result => sink(result ? result : []));
    }
  });
});
