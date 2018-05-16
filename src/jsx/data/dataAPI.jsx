import { computed } from 'mobx';

import uiState from '../state/uiState';
import config from '../config/config';

import { textData, annotationData } from './dataStore';

import layouts from '../layouts/index.jsx';

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

import { scaleLinear } from 'd3';

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

  @computed
  get isAppReady() {
    if (
      this.activeDetailedAnnotations.length == 0 ||
      this.activeTextElements.length == 0 ||
      isEmpty(this.activeLayoutedElements) ||
      this.activeTextGlyphs.length == 0 ||
      this.activeFilters.length == 0
    ) {
      return false;
    } else {
      return true;
    }
  }

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
  get textIntersections() {
    if (this.annotations.length == 0) {
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

            // delete pre existing offset if not in there
            if (
              (startOffset != 0 || endOffset != 0) &&
              offsets[
                `${offset.startOffset}-${offset.endOffset}`
              ].annotations.find(d => {
                return d == annotation.id;
              }) == undefined
            ) {
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

    return orderBy(offsets, 'startOffset', 'asc');
  }

  @computed
  get textElements() {
    if (
      this.text.length == 0 ||
      this.textIntersections.length == 0 ||
      this.annotations.length == 0 ||
      isEmpty(this.annotationsById)
    ) {
      return [];
    }

    const textLength = this.text.length;
    const output = [];
    let lastOffset = 0;

    this.textIntersections.forEach(d => {
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
    if (
      this.textElements.length == 0 ||
      isEmpty(this.activeDetailedAnnotationsById)
    ) {
      return [];
    }

    const hasFilters = uiState.activeFilterIds.length != 0;
    const hasMoreSelected = uiState.selectedAnnotationIds.length > 1;
    const output = [];

    let globalScrollToFound = false;

    this.textElements.forEach(d => {
      let active = true;
      let hovered = false;
      let selected = false;
      let scrollTo = false;

      const annotations = [];

      if (d.annotations.length) {
        // has annotations
        let activeFound = false;
        let hoveredFound = false;
        let selectedFound = false;
        let scrollToFound = false;

        d.annotations.forEach(e => {
          const active =
            !hasFilters || this.activeDetailedAnnotationsById[e.id].active;
          const hovered = this.activeDetailedAnnotationsById[e.id].hovered;
          const selected = this.activeDetailedAnnotationsById[e.id].selected;
          let scrollTo = false;

          if (active && !activeFound) {
            activeFound = true;
          }
          if (hovered && !hoveredFound) {
            hoveredFound = true;
          }
          if (selected && !selectedFound) {
            selectedFound = true;
          }
          if (!globalScrollToFound && e.id == uiState.scrollToAnnotationId) {
            scrollToFound = true;
            globalScrollToFound = true;
          }
          annotations.push({ ...e, active, hovered, selected });
        });
        active = activeFound;
        hovered = hoveredFound;
        selected = selectedFound;
        scrollTo = scrollToFound;
      } else {
        // has no annotations
        active = !hasFilters;
      }

      // take all if not more than one are selected or all sected one
      if (!hasMoreSelected || selected) {
        output.push({ ...d, active, hovered, selected, scrollTo, annotations });
      }
    });

    if (hasMoreSelected) {
      // group text elements to selected annotations
      const groupedByAnnotationIds = {};
      output.forEach(d => {
        d.annotations.forEach(e => {
          if (e.selected) {
            if (groupedByAnnotationIds[e.id] == undefined) {
              groupedByAnnotationIds[e.id] = [];
            }
            groupedByAnnotationIds[e.id].push(d);
          }
        });
      });
      return map(groupedByAnnotationIds, (d, k) => ({ id: k, items: d }));
    } else {
      return output;
    }
  }

  // --------------------
  //
  // *** ANNOTATIONS ***
  //
  // --------------------

  @computed
  get maxAnnotationLength() {
    if (this.rawAnnotations.length == 0) {
      return 0;
    }
    let maxLen = 0;
    this.rawAnnotations.forEach(d => {
      maxLen = Math.max(maxLen, d.endOffset - d.startOffset + 1);
    });
    return maxLen;
  }

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
  get hasMoreSelectedAnnotations() {
    return uiState.selectedAnnotationIds.length > 1;
  }

  @computed
  get hasHoveredAnnotations() {
    return uiState.hoveredAnnotationIds != '';
  }

  @computed
  get hasSelectedAnnotations() {
    return uiState.selectedAnnotationIds.length != 0;
  }

  @computed
  get activeAnnotations() {
    if (this.annotations.length == 0) {
      return [];
    }
    return this.annotations.map(d => {
      const active =
        !this.hasFilters || this.activeFilterIdsById[d.tagId] != undefined;
      return { ...d, active };
    });
  }

  @computed
  get activeDetailedAnnotations() {
    if (this.activeAnnotations.length == 0) {
      return [];
    }
    return this.activeAnnotations.map(d => {
      const hovered =
        this.hasHoveredAnnotations &&
        this.hoveredAnnotationIdsById[d.id] != undefined;
      const selected =
        this.hasSelectedAnnotations &&
        this.selectedAnnotationIdsById[d.id] != undefined;

      return { ...d, hovered, selected };
    });
  }

  @computed
  get activeDetailedAnnotationsById() {
    if (this.activeDetailedAnnotations.length == 0) {
      return {};
    }
    return keyBy(this.activeDetailedAnnotations, 'id');
  }

  // --------------------
  //
  // *** GLYPHS ***
  //
  // --------------------

  @computed
  get glyphs() {
    if (
      this.annotations.length == 0 ||
      this.maxAnnotationLength == 0 ||
      this.textIntersections.length == 0
    ) {
      return [];
    }
    const annotationScale = scaleLinear()
      .domain([1, this.maxAnnotationLength])
      .range([config.ANNOTATION_RADIUS_MIN, config.ANNOTATION_RADIUS_MAX]);

    // get annotation intersects

    const intersections = {};
    this.textIntersections.forEach(d => {
      const annotationLen = d.annotations.length;
      if (annotationLen > 1) {
        const intersectionLen = d.endOffset - d.startOffset;
        for (let i = 0; i < annotationLen; i++) {
          let annotation1 = d.annotations[i];
          if (intersections[annotation1] == undefined) {
            intersections[annotation1] = {};
          }
          for (let j = 0; j < annotationLen; j++) {
            if (i == j) {
              continue;
            }
            let annotation2 = d.annotations[j];
            if (intersections[annotation1][annotation2] == undefined) {
              intersections[annotation1][annotation2] = 0;
            }
            intersections[annotation1][annotation2] += intersectionLen;
          }
        }
      }
    });

    return this.annotations.map(d => {
      const textLength = d.endOffset - d.startOffset + 1;
      return {
        ...d,
        radius: Math.round(annotationScale(textLength)),
        textLength: textLength,
        intersections: intersections[d.id]
          ? map(intersections[d.id], (d, k) => ({ id: k, value: d }))
          : [],
      };
    });
  }

  @computed
  get layoutedElements() {
    if (this.glyphs.length == 0) {
      return [];
    }
    return layouts[this.activeCanvas.layout].create(
      this.glyphs,
      this.canvasWidth - config.CANVAS_MARGIN * 2,
      this.canvasHeight - config.CANVAS_MARGIN * 2,
      this.activeLayoutControlsById,
    );
  }

  @computed
  get activeLayoutedElements() {
    if (
      isEmpty(this.layoutedElements) ||
      isEmpty(this.activeDetailedAnnotationsById)
    ) {
      return { glyphs: [] };
    }
    return {
      ...this.layoutedElements,
      glyphs: this.layoutedElements.glyphs
        .filter(d => this.activeDetailedAnnotationsById[d.id].active)
        .map(d => {
          return {
            ...d,
            hovered: this.activeDetailedAnnotationsById[d.id].hovered,
            selected: this.activeDetailedAnnotationsById[d.id].selected,
            hidden:
              (this.hasHoveredAnnotations &&
                !this.activeDetailedAnnotationsById[d.id].hovered) ||
              (this.hasSelectedAnnotations &&
                !this.activeDetailedAnnotationsById[d.id].selected),
          };
        }),
    };
  }

  // --------------------
  //
  // *** TEXT GLYPH ***
  //
  // --------------------

  @computed
  get activeTextGlyphs() {
    if (this.activeAnnotations.length == 0 || this.text.length == 0) {
      return [];
    }

    return orderBy(
      this.activeAnnotations.map(d => {
        return {
          id: d.id,
          color: d.color,
          active: d.active,
          start: d.startOffset / this.text.length * 100,
          height: (d.endOffset - d.startOffset) / this.text.length * 100,
        };
      }),
      'height',
      'desc',
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

    if (canvases.length == 0 || isEmpty(this.layoutsById)) {
      return [];
    }

    const output = [];
    canvases.forEach(d => {
      output.push({
        id: d.id,
        title: d.title,
        layout: this.layoutsById[d.layout].title,
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
  get layoutsById() {
    return keyBy(layouts, 'id');
  }

  @computed
  get layoutList() {
    return map(layouts, d => {
      return { id: d.id, title: d.title };
    });
  }

  @computed
  get activeLayoutControlsById() {
    return keyBy(uiState.activeLayoutControls, 'id');
  }

  @computed
  get activeLayoutControlsList() {
    if (isEmpty(this.layoutsById)) {
      return [];
    }
    return this.layoutsById[this.activeCanvas.layout].inputs.map(d => {
      const value =
        this.activeLayoutControlsById[d.id] != undefined
          ? this.activeLayoutControlsById[d.id].value
          : d.value;
      return { ...d, value };
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
  get hasFilters() {
    return uiState.activeFilterIds.length != 0;
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
