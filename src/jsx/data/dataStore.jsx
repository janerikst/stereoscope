import { lazyObservable } from 'mobx-utils';
import { autorun } from 'mobx';
import { json, text } from 'd3';

import uiState from '../state/uiState';

import textFileLocal from 'data/Kafka_InDerStrafkolonie.txt';
import annotationFileLocal from 'data/strafkolonie.json';

// loads text data

export const textData = lazyObservable(sink => {
  autorun(() => {
    const { textFile } = uiState;
    // takes local file if nothing is selected
    if (textFile == '') {
      text(textFileLocal, result => sink(result ? result : ''));
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target.result;
        sink(result ? result : []);
      };
      reader.readAsText(textFile);
    }
  });
});

// loads annoation data

export const annotationData = lazyObservable(sink => {
  autorun(() => {
    const { annotationFile } = uiState;
    // takes local file if nothing is selected
    if (annotationFile == '') {
      json(annotationFileLocal, result => sink(result ? result : []));
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        const result = JSON.parse(e.target.result);
        sink(result ? result : []);
      };
      reader.readAsText(annotationFile);
    }
  });
});
