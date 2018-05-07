import { computed } from 'mobx';

import uiState from '../state/uiState';
import config from '../config/config';

import { textData, annotationData } from './dataStore';

import creationPeriodLayout from '../layouts/creationPeriod.jsx';

import {
  values,
  map,
  forEach,
  orderBy,
  groupBy,
  keyBy,
  isEmpty,
  includes,
  trim,
} from 'lodash';

class DataAPI {
  // DATASETS
  @computed
  get text() {
    return textData.current() || '';
  }

  @computed
  get rawAnnotations() {
    return annotationData.current() || [];
  }
  // GENERAL COMPUTES

  // --------------------
  //
  // *** TEXT ***
  //
  // --------------------

  @computed
  get textTitle() {
    if (this.rawAnnotations.length == 0) {
      return '';
    }
    return trim(this.rawAnnotations[0].sourceDocumentTitle);
  }

  @computed
  get textElements() {
    if (
      this.text.length == 0 ||
      this.annotations.length == 0 ||
      isEmpty(this.annotationsById)
    ) {
      return [];
    }
    // split annotation in parts to create spans

    const offsets = {};

    // helper functions
    const addOffset = (start, end, annotations) => {
      if (offsets[`${start}-${end}`] == undefined) {
        offsets[`${start}-${end}`] = {
          startOffset: start,
          endOffset: end,
          annotations: annotations,
        };
      } else {
        for (const annotation of annotations) {
          if (!includes(offsets[`${start}-${end}`].annotations, annotation)) {
            offsets[`${start}-${end}`].annotations.push(annotation);
          }
        }
      }
    };

    const intersects = (x1, x2, y1, y2) => x2 >= y1 && y2 >= x1;

    // go through the annotation and split them
    const annotationCount = this.annotations.length;

    for (let i = 0; i < annotationCount; i++) {
      const annotation = this.annotations[i];
      let hasIntersections = false;

      if (!isEmpty(offsets)) {
        // offset exists
        map(offsets, offset => {
          if (
            intersects(
              annotation.startOffset,
              annotation.endOffset,
              offset.startOffset,
              offset.endOffset - 1,
            )
          ) {
            if (!hasIntersections) {
              hasIntersections = true;
            }

            // found intersection
            const startOffset = annotation.startOffset - offset.startOffset;
            const endOffset = annotation.endOffset - offset.endOffset;
            const offsetAnnotations = offset.annotations;

            // front part

            if (startOffset > 0) {
              addOffset(
                offset.startOffset,
                annotation.startOffset,
                offsetAnnotations,
              );
            } else if (startOffset < 0) {
              addOffset(annotation.startOffset, offset.startOffset, [
                annotation.id,
              ]);
            }

            // middle part

            addOffset(
              Math.max(annotation.startOffset, offset.startOffset),
              Math.min(annotation.endOffset, offset.endOffset),
              offsetAnnotations.concat(annotation.id),
            );

            // back part

            if (endOffset > 0) {
              addOffset(offset.endOffset, annotation.endOffset, [
                annotation.id,
              ]);
            } else if (endOffset < 0) {
              addOffset(
                annotation.endOffset,
                offset.endOffset,
                offsetAnnotations,
              );
            }

            // delete pre existing offset
            if (startOffset != 0 || endOffset != 0) {
              delete offsets[`${offset.startOffset}-${offset.endOffset}`];
            }
          }
        });
      } else {
        // offset is empty > init
        addOffset(annotation.startOffset, annotation.endOffset, [
          annotation.id,
        ]);
      }
      // no intersections found
      if (!hasIntersections) {
        // didn't found intersection
        addOffset(annotation.startOffset, annotation.endOffset, [
          annotation.id,
        ]);
      }
    }

    // combines splitted annotations with the text

    const textLength = this.text.length;
    const output = [];
    let lastOffset = 0;

    orderBy(values(offsets), 'startOffset', 'asc').forEach(d => {
      // before
      if (d.startOffset > lastOffset) {
        const textStr = this.text.substring(lastOffset, d.startOffset);
        output.push({
          id: `${lastOffset}-${d.startOffset}`,
          text: textStr,
          annotations: [],
        });
      }

      // intersection
      const textStr = this.text.substring(d.startOffset, d.endOffset);
      output.push({
        id: `${d.startOffset}-${d.endOffset}`,
        text: textStr,
        annotations: orderBy(
          d.annotations.map(e => ({
            id: e,
            color: this.annotationsById[e].color,
          })),
          e => this.annotationsById[e.id].text.length,
        ),
      });
      lastOffset = d.endOffset;
    });

    // after
    if (lastOffset < textLength) {
      const textStr = this.text.substring(lastOffset, textLength);
      output.push({
        id: `${lastOffset}-${textLength}`,
        text: textStr,
        annotations: [],
      });
    }

    return output;
  }

  @computed
  get activeTextElements() {
    if (this.textElements.length == 0 || isEmpty(this.activeAnnotationsById)) {
      return [];
    }

    const hasFilters = uiState.activeFilterIds.length != 0;
    const hasMoreSelected = uiState.selectedAnnotationIds > 1;

    return this.textElements.map(d => {
      let active = true;
      let hovered = false;
      let selected = false;

      const annotations = [];

      if (d.annotations.length) {
        // has annotations
        let activeFound = false;
        let hoveredFound = false;
        let selectedFound = false;

        d.annotations.forEach(e => {
          const active = !hasFilters || this.activeAnnotationsById[e.id].active;
          const hovered = this.activeAnnotationsById[e.id].hovered;
          const selected = this.activeAnnotationsById[e.id].selected;
          if (active && !activeFound) {
            activeFound = true;
          }
          if (hovered && !hoveredFound) {
            hoveredFound = true;
          }
          if (selected && !selectedFound) {
            selectedFound = true;
          }
          annotations.push({ ...e, active, hovered, selected });
        });
        active = activeFound;
        hovered = hoveredFound;
        selected = selectedFound;
      } else {
        // has no annotations
        active = !hasFilters;
        hovered = false;
        selected = false;
      }

      return { ...d, active, hovered, selected, annotations };
    });
  }

  // --------------------
  //
  // *** ANNOTATIONS ***
  //
  // --------------------

  @computed
  get annotations() {
    if (this.rawAnnotations.length == 0) {
      return [];
    }
    const output = {};
    this.rawAnnotations.forEach(d => {
      if (output[d.annotationId] == undefined) {
        output[d.annotationId] = {
          id: d.annotationId,
          text: d.phrase,
          tagId: d.tagId,
          tagPath: d.tagPath,
          tagVersion: new Date(d.tagVersion),
          startOffset: d.startOffset,
          endOffset: d.endOffset,
          radius: config.ANNOTATION_RADIUS,
        };
      }
      if (d.propertyName == 'catma_displaycolor') {
        output[d.annotationId].color =
          '#' + Math.abs(parseInt(d.propertyValue)).toString(16);
      } else if (d.propertyName == 'catma_markupauthor') {
        output[d.annotationId].author = d.propertyValue;
      }
    });
    return _.orderBy(
      _.values(output),
      ['startOffset', 'endOffset'],
      ['asc', 'desc'],
    );
  }

  @computed
  get annotationsById() {
    if (this.annotations.length == 0) {
      return {};
    }
    return keyBy(this.annotations, 'id');
  }

  @computed
  get hoveredAnnotationIdsById() {
    if (uiState.hoveredAnnotationIds.length == 0) {
      return {};
    }
    const output = {};
    forEach(uiState.hoveredAnnotationIds, d => {
      output[d] = 1;
    });
    return output;
  }

  @computed
  get selectedAnnotationIdsById() {
    if (uiState.selectedAnnotationIds.length == 0) {
      return {};
    }
    const output = {};
    forEach(uiState.selectedAnnotationIds, d => {
      output[d] = 1;
    });
    return output;
  }

  @computed
  get activeAnnotations() {
    if (this.annotations.length == 0) {
      return [];
    }
    const hasFilters = uiState.activeFilterIds.length != 0;
    const hasHovers = uiState.hoveredAnnotationIds.length != 0;
    const hasSelects = uiState.selectedAnnotationIds.length != 0;

    return this.annotations.map(d => {
      const active =
        !hasFilters || this.activeFilterIdsById[d.tagId] != undefined;
      const hovered =
        hasHovers && this.hoveredAnnotationIdsById[d.id] != undefined;
      const selected =
        hasSelects && this.selectedAnnotationIdsById[d.id] != undefined;

      return { ...d, active, hovered, selected };
    });
  }

  @computed
  get activeAnnotationsById() {
    if (this.activeAnnotations.length == 0) {
      return {};
    }
    return keyBy(this.activeAnnotations, 'id');
  }

  @computed
  get activeAnnotationsLayouted() {
    if (this.annotations.length == 0 || isEmpty(this.activeAnnotationsById)) {
      return [];
    }
    return creationPeriodLayout.create(
      this.activeAnnotations.filter(d => d.active),
      this.canvasWidth - config.CANVAS_MARGIN * 2,
      this.canvasHeight - config.CANVAS_MARGIN * 2,
      config.ANNOTATION_SPACE,
    );
  }

  // --------------------
  //
  // *** CANVASES ***
  //
  // --------------------

  @computed
  get canvasList() {
    const { canvases, activeCanvasId } = uiState;
    const { LAYOUTS } = config;

    if (canvases.length == 0) {
      return [];
    }
    const output = [];
    canvases.forEach(d => {
      output.push({
        id: d.id,
        title: d.title,
        layout: LAYOUTS[d.layout].label,
        active: d.id == activeCanvasId,
      });
    });
    return output;
  }

  @computed
  get activeCanvas() {
    const { canvases, activeCanvasId } = uiState;
    if (canvases.length == 0) {
      return {};
    }
    return canvases.find(d => d.id == activeCanvasId);
  }

  @computed
  get canvasDetails() {
    const { canvases, editCanvasId } = uiState;
    if (canvases.length == 0) {
      return {};
    }
    return canvases.find(d => d.id == editCanvasId);
  }

  @computed
  get canvasWidth() {
    return (
      uiState.windowDimensions.width -
      config.TEXT_BAR_WIDTH -
      config.CANVAS_BAR_WIDTH
    );
  }

  @computed
  get canvasHeight() {
    return uiState.windowDimensions.height - 100;
  }

  // --------------------
  //
  // *** LAYOUTS ***
  //
  // --------------------

  @computed
  get layoutList() {
    return map(config.LAYOUTS, (d, k) => {
      return { id: k, label: d.label };
    });
  }

  // --------------------
  //
  // *** FILTERS ***
  //
  // --------------------

  @computed
  get filters() {
    if (this.annotations.length == 0) {
      return [];
    }
    return orderBy(
      map(groupBy(this.annotations, 'tagId'), d => {
        const item = d[0];
        return {
          id: item.tagId,
          tagPath: item.tagPath,
          color: item.color,
          count: d.length,
        };
      }),
      'count',
      'desc',
    );
  }

  @computed
  get activeFilterIdsById() {
    const output = {};
    forEach(uiState.activeFilterIds, d => {
      output[d] = 1;
    });
    return output;
  }

  @computed
  get activeFilters() {
    if (this.filters.length == 0) {
      return [];
    }
    return map(this.filters, d => {
      const active =
        isEmpty(this.activeFilterIdsById) ||
        this.activeFilterIdsById[d.id] != undefined;
      return { ...d, active };
    });
  }
}

const dataAPI = new DataAPI();
export default dataAPI;
