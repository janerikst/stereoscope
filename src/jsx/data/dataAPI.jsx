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
  range,
} from 'lodash';

import { scaleSqrt, scaleLinear } from 'd3';
import FileDownload from 'react-file-download';

class DataAPI {
  // DATASETS

  // *****
  // text file data
  // *****
  @computed
  get text() {
    return textData.current() || '';
  }

  // *****
  // annotation file data
  // *****

  @computed
  get rawAnnotations() {
    return annotationData.current() || [];
  }

  // --------------------
  //
  // *** GENERAL COMPUTES ***
  //
  // --------------------

  // *****
  // check if all necessary data is loaded to start the app
  // *****

  @computed
  get isAppReady() {
    if (
      this.textElements.length != 0 &&
      this.activeDetailedAnnotations.length != 0 &&
      !isEmpty(this.activeLayoutedElements) &&
      this.activeTextGlyphs.length != 0 &&
      this.activeFilters.length != 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  // *****
  // checks if localfiles or loaded files are available
  // *****

  @computed
  get needDataFiles() {
    const { TEXT_FILE, ANNOTATION_FILE } = config;
    const { textFile, annotationFile } = uiState;
    if (
      textFile == '' &&
      annotationFile == '' &&
      TEXT_FILE == '' &&
      ANNOTATION_FILE == ''
    ) {
      return true;
    } else {
      return false;
    }
  }

  // --------------------
  //
  // *** TEXT ***
  //
  // --------------------

  // *****
  // get title of the text
  // *****

  @computed
  get textTitle() {
    if (this.rawAnnotations.length == 0) {
      return '';
    }
    return trim(this.rawAnnotations[0].sourceDocumentTitle);
  }

  // *****
  // calculates the intersection of the annotations
  // *****

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

    const intersects = (x1, x2, y1, y2) => x2 > y1 && y2 > x1;

    // go through the annotation and split them
    const annotationCount = this.annotations.length;

    for (let i = 0; i < annotationCount; i++) {
      const annotation = this.annotations[i];
      let hasIntersections = false;
      let lastMiddleOffset = undefined;

      if (!isEmpty(offsets)) {
        // offset exists
        map(
          orderBy(
            values(offsets),
            ['startOffset', 'endOffset'],
            ['asc', 'desc'],
          ),
          offset => {
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
              } else if (
                startOffset < 0 &&
                lastMiddleOffset < annotation.startOffset // dont add thing that there before
              ) {
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

              lastMiddleOffset = Math.min(
                annotation.endOffset,
                offset.endOffset,
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
          },
        );
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
    return orderBy(values(offsets), ['startOffset'], 'asc');
  }

  // *****
  // all text elements derived from text and text intersections
  // *****

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

  // *****
  // text elements with active, hovered, selected and scroll to state
  // *****

  @computed
  get activeTextElements() {
    if (
      this.textElements.length == 0 ||
      isEmpty(this.activeDetailedAnnotationsById) ||
      isEmpty(this.activeCanvas)
    ) {
      return [];
    }

    const hasFilters = uiState.activeFilterIds.length != 0;
    let globalScrollToFound = false; // first element to scroll
    const output = [];

    if (!this.activeCanvas.textBarShowsAll) {
      // show just annotations
      forEach(uiState.selectedAnnotationIds, d => {
        let scrollToFound = false;
        if (!globalScrollToFound && d == uiState.scrollToAnnotationId) {
          scrollToFound = true;
          globalScrollToFound = true;
        }
        output.push({
          ...this.activeDetailedAnnotationsById[d],
          scrollTo: scrollToFound,
        });
      });
    } else {
      // show text elements
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

        output.push({
          ...d,
          active,
          hovered,
          selected,
          scrollTo,
          annotations,
        });
      });
    }

    if (this.activeCanvas.textBarShowsAll) {
      return output;
    } else {
      return orderBy(output, d => d.startOffset);
    }
  }

  // --------------------
  //
  // *** ANNOTATIONS ***
  //
  // --------------------

  // *****
  // dict of all annotation attributes from the config file
  // *****

  @computed
  get annotationConfigPropertiesById() {
    const { ANNOTATION_PROPERTIES } = config;
    return keyBy(values(ANNOTATION_PROPERTIES), 'id');
  }

  // *****
  // dict of all annotation with changed attributes
  // *****

  @computed
  get annotationPropertiesById() {
    if (uiState.annotationProperties.length == 0) {
      return {};
    }
    return keyBy(uiState.annotationProperties, 'id');
  }

  // *****
  // get maximal annotation length
  // *****

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

  // *****
  // raw annotations with updated properites for download
  // *****

  @computed
  get rawAnnotationsWithUpdatedProperties() {
    if (this.rawAnnotations.length == 0) {
      return [];
    }
    const { annotationProperties } = uiState;
    const properties = config.ANNOTATION_PROPERTIES;
    // flip properties
    const propertiesReverse = {};
    forEach(properties, (d, k) => {
      propertiesReverse[d.id] = k;
    });

    // group raw annotation by id
    const rawAnnotationsGrouped = {
      ...groupBy(this.rawAnnotations, 'annotationId'),
    };

    // go through annotation properties
    forEach(annotationProperties, property => {
      const foundProps = {};
      const itemsById = keyBy(property.items, 'id');
      // check existing properties
      rawAnnotationsGrouped[property.id].forEach(annotation => {
        if (itemsById[properties[annotation.propertyName].id] != undefined) {
          annotation.propertyValue = property.value;
        }
        foundProps[property.id] = 1;
      });
      // check if new ones are in there
      property.items.forEach(item => {
        if (foundProps[item.id] == undefined) {
          rawAnnotationsGrouped[property.id].push({
            ...rawAnnotationsGrouped[property.id][0],
            propertyName: propertiesReverse[item.id],
            propertyValue: item.value,
          });
        }
      });
    });
    // make dict flat
    const output = [];
    forEach(values(rawAnnotationsGrouped), d => {
      forEach(d, e => {
        output.push(e);
      });
    });
    return output;
  }

  // *****
  // annotation derived from raw annotations with attributes like color, author ..
  // *****

  @computed
  get annotations() {
    if (this.rawAnnotations.length == 0) {
      return [];
    }
    const properties = config.ANNOTATION_PROPERTIES;
    const output = {};
    this.rawAnnotations.forEach(d => {
      const property = properties[d.propertyName];
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
        // init empty properties
        map(properties, (v, k) => {
          output[d.annotationId][v.id] = undefined;
        });
      }

      if (property.type == 'color') {
        output[d.annotationId][property.id] =
          '#' + Math.abs(parseInt(d.propertyValue)).toString(16);
      } else if (property.type == 'int') {
        output[d.annotationId][property.id] = parseInt(d.propertyValue);
      } else if (property.type == 'string') {
        output[d.annotationId][property.id] = d.propertyValue;
      }
    });

    return _.orderBy(
      _.values(output),
      ['startOffset', 'endOffset'],
      ['asc', 'desc'],
    );
  }

  // *****
  // dict of annotations
  // *****

  @computed
  get annotationsById() {
    if (this.annotations.length == 0) {
      return {};
    }
    return keyBy(this.annotations, 'id');
  }

  // *****
  // dict of hovered annotations ids from uiState
  // *****

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

  // *****
  // dict of selected annotations ids from uiState
  // *****

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

  // *****
  // bool if hovered annotations exist
  // *****

  @computed
  get hasHoveredAnnotations() {
    return uiState.hoveredAnnotationIds.length != 0;
  }

  // *****
  // bool if selected annotations exist
  // *****

  @computed
  get hasSelectedAnnotations() {
    return uiState.selectedAnnotationIds.length != 0;
  }

  // *****
  // count of selected annotations
  // *****

  @computed
  get countSelectedAnnotations() {
    return uiState.selectedAnnotationIds.length;
  }

  // *****
  // annotation enrichted with the changed properties from uiState
  // *****

  @computed
  get annotationsWithUpdatedProperties() {
    if (this.annotations.length == 0) {
      return [];
    }
    return this.annotations.map(d => {
      if (this.annotationPropertiesById[d.id] != undefined) {
        const property = this.annotationPropertiesById[d.id];
        const annotation = { ...d };
        forEach(property.items, item => {
          annotation[item.id] = item.value;
        });
        return annotation;
      } else {
        return { ...d };
      }
    });
  }

  // *****
  // annotation with active state -> filtered
  // *****

  @computed
  get activeAnnotations() {
    if (this.annotationsWithUpdatedProperties.length == 0) {
      return [];
    }
    return this.annotationsWithUpdatedProperties.map(d => {
      const active =
        !this.hasFilters || this.activeFilterIdsById[d.tagId] != undefined;
      return { ...d, active };
    });
  }

  // *****
  // active annotation with hovered and selected state
  // *****

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

  // *****
  // dict of activeDetailedAnnotations
  // *****

  @computed
  get activeDetailedAnnotationsById() {
    if (this.activeDetailedAnnotations.length == 0) {
      return {};
    }
    return keyBy(this.activeDetailedAnnotations, 'id');
  }

  // *****
  // compines all information of the hovered annotion ids -> uistate
  // *****

  @computed
  get hoveredAnnotationsDetails() {
    if (!this.hasHoveredAnnotations) {
      return [];
    }
    return map(uiState.hoveredAnnotationIds, d => {
      const annotation = this.activeDetailedAnnotationsById[d];
      return {
        id: annotation.id,
        tagPath: annotation.tagPath,
        color: annotation.color,
        author: annotation.author,
        importance: annotation.importance,
        certainty: annotation.certainty,
      };
    });
  }

  // *****
  // creates a list of properties and their possible values for the selected annotations
  // *****

  @computed
  get selectedAnnotationPropertiesList() {
    if (isEmpty(this.activeDetailedAnnotationsById)) {
      return [];
    }

    const { ANNOTATION_PROPERTIES } = config;
    const output = [];

    values(ANNOTATION_PROPERTIES).forEach(property => {
      if (property.changeable) {
        // create annotation property dict
        const annotationProperies = {};
        if (uiState.selectedAnnotationIds.length != 0) {
          uiState.selectedAnnotationIds.forEach(annotation => {
            const propertyValue = this.activeDetailedAnnotationsById[
              annotation
            ][property.id];

            if (propertyValue != undefined) {
              if (annotationProperies[propertyValue] == undefined) {
                annotationProperies[propertyValue] = 0;
              }
              annotationProperies[propertyValue] += 1;
            }
          });
        }
        // create list
        const attribute = { id: property.id, title: property.title, items: [] };
        if (property.type == 'int') {
          range(property.min, property.max + 1).forEach(e => {
            let state;
            if (annotationProperies[e] != undefined) {
              if (annotationProperies[e] == this.countSelectedAnnotations) {
                state = 2; // fully selected
              } else {
                state = 1; // not fully selected
              }
            } else {
              state = 0; // not selected
            }
            attribute.items.push({
              id: e,
              state: state,
            });
          });
        }
        output.push(attribute);
      }
    });
    return output;
  }

  // --------------------
  //
  // *** GLYPHS ***
  //
  // --------------------

  // *****
  // graphical glyphs derived from annotations
  // with the information of the intersections
  // with other annotations for the network layout
  // *****

  @computed
  get glyphs() {
    if (
      this.annotations.length == 0 ||
      this.maxAnnotationLength == 0 ||
      this.textIntersections.length == 0
    ) {
      return [];
    }
    const annotationScale = scaleSqrt()
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
          const annotation1Length = this.annotationsById[annotation1].endOffset - this.annotationsById[annotation1].startOffset;
          const annotation1Start = this.annotationsById[annotation1].startOffset;
          const annotation1End = this.annotationsById[annotation1].endOffset;
          if (intersections[annotation1] == undefined) {
            intersections[annotation1] = {};
          }
          intersections[annotation1].relationship = {};
          intersections[annotation1].ids = {};
          for (let j = 0; j < annotationLen; j++) {
            if (i == j) {
              continue;
            }
            let annotation2 = d.annotations[j];
            const annotation2Length = this.annotationsById[annotation2].endOffset - this.annotationsById[annotation2].startOffset;
            const annotation2Start = this.annotationsById[annotation2].startOffset;
            const annotation2End = this.annotationsById[annotation2].endOffset;
            if (intersections[annotation1]["ids"][annotation2] == undefined) {
              intersections[annotation1]["ids"][annotation2] = 0;
            }
            intersections[annotation1]["ids"][annotation2] += intersectionLen;
            let relationship = intersectionLen / annotation1Length;
            let relationship2 = intersectionLen / annotation2Length;
            if ((relationship == 1) && (relationship2 < 1)) {
                intersections[annotation1].relationship[annotation2] = "enclosed";
            } else if ((relationship2 == 1) && (relationship < 1)) {
                intersections[annotation1].relationship[annotation2] = "enclosed";  
            } /*else if ((relationship2 == 1) && (relationship == 1)) {
                intersections[annotation1].relationship[annotation2] = "coextensive";  
            }*/ else {
              if (((annotation1Start < annotation2Start) && (annotation1End < annotation2End)) || 
                  ((annotation2Start < annotation1Start) && (annotation2End < annotation1End))) {
                intersections[annotation1].relationship[annotation2] = "overlapping";
              }  else if ((annotation1Start == annotation2Start) && (annotation1End == annotation2End)) {
                intersections[annotation1].relationship[annotation2] = "coextensive";
              } else {
                intersections[annotation1].relationship[annotation2] = "enclosed";
              }
            }
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
          ? map(intersections[d.id].ids, (d, k) => ({ id: k, value: d }))
          : [],
        relationships: intersections[d.id]
          ? map(intersections[d.id].relationship, (d, k) => ({ id: k, value: d }))
          : [],
      };
    });
  }

  // *****
  // glyphs positioned by the active layout
  // and enriched layout specific elements
  // *****

  @computed
  get layoutedElements() {
    if (this.glyphs.length == 0) {
      return [];
    }
    return layouts[this.activeCanvas.layout].create(
      this.glyphs,
      this.canvasWidth,
      this.canvasHeight,
      this.activeLayoutControlsById,
    );
  }

  // *****
  // layout elements filtered
  // *****

  @computed
  get filteredLayoutedElements() {
    if (
      isEmpty(this.layoutedElements) ||
      isEmpty(this.activeDetailedAnnotationsById)
    ) {
      return { glyphs: [] };
    }
    return {
      ...this.layoutedElements,
      glyphs: this.layoutedElements.glyphs.filter(
        d => this.activeDetailedAnnotationsById[d.id].active,
      ),
    };
  }

  // *****
  // active layout elements enrichted with hover, selected, hidden and properties
  // *****

  @computed
  get activeLayoutedElements() {
    if (
      isEmpty(this.filteredLayoutedElements) ||
      isEmpty(this.activeDetailedAnnotationsById)
    ) {
      return { glyphs: [] };
    }

    return {
      ...this.filteredLayoutedElements,
      glyphs: this.filteredLayoutedElements.glyphs.map(d => {
        const annotation = this.activeDetailedAnnotationsById[d.id];
        return {
          ...d,
          hovered: annotation.hovered,
          selected: annotation.selected,
          hidden:
            (this.hasHoveredAnnotations && !annotation.hovered) ||
            (this.hasSelectedAnnotations && !annotation.selected),
          certainty: annotation.certainty,
          importance: annotation.importance,
        };
      }),
    };
  }

  /////////// WORK IN PROGRESS

  /*@computed
  get activeLayoutedElementsConnections() {
    if (isEmpty(this.filteredLayoutedElements) ||
        isEmpty(this.activeLayoutedElements.links) ||
        isEmpty(this.activeDetailedAnnotationsById)) {
      return { glyphs: [] };
    }

    return {
      ...this.activeLayoutedElements,
      //glyphs: this.activeLayoutedElements.glyphs,
      links: this.activeLayoutedElements.links.map(d => {
        return {
          ...d,
          relationship:
          hidden: 
            ()
        };
      })
    }
  }*/

  /////////// WORK IN PROGRESS


  // *****
  // glyph scale for certainty
  // *****

  @computed
  get glyphScaleCertainty() {
    if (isEmpty(this.annotationConfigPropertiesById)) {
      return undefined;
    }
    const property = this.annotationConfigPropertiesById['certainty'];
    return scaleLinear()
      .domain([property.min, property.max])
      .range([0.2, 1]);
  }

  // *****
  // glyph scale for importance
  // *****

  @computed
  get glyphScaleImportance() {
    if (isEmpty(this.annotationConfigPropertiesById)) {
      return undefined;
    }
    const property = this.annotationConfigPropertiesById['importance'];
    return scaleLinear()
      .domain([property.min, property.max])
      .range([5, 0]);
  }

  // --------------------
  //
  // *** TEXT GLYPH ***
  //
  // --------------------

  // *****
  // bool for switch between text and annotation only
  // *****

  @computed
  get textBarShowsAll() {
    return this.activeCanvas.textBarShowsAll;
  }

  // *****
  // text glyphs for the text nav
  // *****

  @computed
  get activeTextGlyphs() {
    if (
      this.activeAnnotations.length == 0 ||
      this.text.length == 0 ||
      isEmpty(this.activeDetailedAnnotationsById)
    ) {
      return [];
    }
    const textLen = this.text.length;

    return orderBy(
      this.activeAnnotations.map(d => {
        return {
          id: d.id,
          color: d.color,
          active: d.active,
          selected: this.activeDetailedAnnotationsById[d.id].selected,
          start: d.startOffset / textLen * 100,
          height: (d.endOffset - d.startOffset) / textLen * 100,
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

  // *****
  // list of all canvas with thumbnail data
  // *****

  /*@computed
  get canvasList() {
    const { canvases, activeCanvasId } = uiState;
    if (canvases.length == 0 || isEmpty(this.layoutsById)) {
      return [];
    }

    const { CANVAS_BAR_WIDTH, CANVAS_THUMB_WIDTH } = config;

    // scales
    const scaleRatio = CANVAS_THUMB_WIDTH / this.canvasWidth;
    const thumbHeight =
      CANVAS_THUMB_WIDTH * this.canvasHeight / this.canvasWidth;

    const output = [];
    canvases.forEach(d => {
      const glyphs =
        d.id == activeCanvasId
          ? this.filteredLayoutedElements.glyphs
          : d.glyphs;

      output.push({
        id: d.id,
        title: d.title ? d.title : config.CANVAS_DEFAULT_NAME,
        layout: this.layoutsById[d.layout].title,
        tags: d.tags,
        active: d.id == activeCanvasId,
        glyphs: map(glyphs, d => {
          return {
            x: d.x * scaleRatio,
            y: d.y * scaleRatio,
            radius: Math.max(d.radius * scaleRatio, 1),
            color: d.color,
          };
        }),
        thumbnailWidth: CANVAS_THUMB_WIDTH,
        thumbnailHeight: thumbHeight,
        comment: d.comment
      });
    });

    return orderBy(output, 'id', 'desc');
  }*/


  // *****
  // list of all canvas with thumbnail data – filtered by CanvasBar input field
  // *****

  @computed
  get filteredCanvasList() {
    const { canvases, activeCanvasId, canvasSearchString } = uiState;
    if (canvases.length == 0 || isEmpty(this.layoutsById)) {
      return [];
    }

    const { CANVAS_BAR_WIDTH, CANVAS_THUMB_WIDTH } = config;

    // scales
    const scaleRatio = CANVAS_THUMB_WIDTH / this.canvasWidth;
    const thumbHeight =
      CANVAS_THUMB_WIDTH * this.canvasHeight / this.canvasWidth;

    const output = [];
    let isMatch = true;
    let matchesFilter = new RegExp(canvasSearchString, "i");

    canvases.forEach(d => {
      const glyphs =
        d.id == activeCanvasId
          ? this.filteredLayoutedElements.glyphs
          : d.glyphs;

      if (!canvasSearchString || matchesFilter.test(d.comment)) {
        isMatch = true;
      } else {
        isMatch = false;
      }

      output.push({
        id: d.id,
        title: d.title ? d.title : config.CANVAS_DEFAULT_NAME,
        layout: this.layoutsById[d.layout].title,
        tags: d.tags,
        //tagSelected: isTagMatch,
        active: d.id == activeCanvasId,
        glyphs: map(glyphs, d => {
          return {
            x: d.x * scaleRatio,
            y: d.y * scaleRatio,
            radius: Math.max(d.radius * scaleRatio, 1),
            color: d.color,
          };
        }),
        thumbnailWidth: CANVAS_THUMB_WIDTH,
        thumbnailHeight: thumbHeight,
        comment: d.comment,
        isMatch: isMatch
      });
    });

    return orderBy(output, 'id', 'desc');
  }

  // *****
  // list of all canvas with thumbnail data – filtered by CanvasBar input field
  // and by selected tag
  // *****

  @computed
  get taggedAndFilteredCanvasList() {
    const { activeTag } = uiState;
    if (this.filteredCanvasList.length == 0 || isEmpty(this.layoutsById)) {
      return [];
    }

    const output = [];
    let isTagMatch = false;

    this.filteredCanvasList.forEach(d => {
      isTagMatch = false;
      d.tags.forEach(e => {
        if (e.localeCompare(activeTag) == 0) {
          isTagMatch = true;
        }
      })

      output.push({
        ...d,
        tagSelected: isTagMatch
      });
    });

    return  orderBy(output, 'id', 'desc');;
  }

  // *****
  // active canvas from uiState
  // *****

  @computed
  get activeCanvas() {
    const { canvases, activeCanvasId } = uiState;
    if (canvases.length == 0) {
      return {};
    }
    return canvases.find(d => d.id == activeCanvasId);
  }

  // *****
  // canvas title with default title if not set
  // *****

  @computed
  get activeCanvasTitle() {
    if (!this.activeCanvas || this.activeCanvas.title == '') {
      return config.CANVAS_DEFAULT_NAME;
    } else {
      return this.activeCanvas.title;
    }
  }

  // *****
  // canvas details used by edit / clone modal
  // *****

  @computed
  get canvasDetails() {
    const { canvases, editCanvasId, cloneCanvasId, editTagsCanvasId } = uiState;
    if (canvases.length == 0) {
      return {};
    }
    //var canvasId = editCanvasId ? editCanvasId : cloneCanvasId;
    var canvasId;
    if (editCanvasId) {
      canvasId = editCanvasId;
    } else if (cloneCanvasId) {
      canvasId = cloneCanvasId;
    } else if (editTagsCanvasId) {
      canvasId = editTagsCanvasId;
    }
    return canvases.find(d => d.id == canvasId);
  }

  // *****
  // canvas width
  // *****

  @computed
  get canvasWidth() {
    return (
      uiState.windowDimensions.width -
      config.TEXT_BAR_WIDTH -
      config.CANVAS_BAR_WIDTH
    );
  }

  // *****
  // canvas height
  // *****

  @computed
  get canvasHeight() {
    return uiState.windowDimensions.height - 100;
  }

  // --------------------
  //
  // *** LAYOUTS ***
  //
  // --------------------

  // *****
  // dict of possible layouts
  // *****

  @computed
  get layoutsById() {
    return keyBy(layouts, 'id');
  }

  // *****
  // list of possible layouts
  // *****

  @computed
  get layoutList() {
    return map(layouts, d => {
      return { id: d.id, title: d.title };
    });
  }

  // *****
  // dict of active layout controls
  // *****

  @computed
  get activeLayoutControlsById() {
    return keyBy(uiState.activeLayoutControls, 'id');
  }

  // *****
  // list of active layout controls
  // *****

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

  // *****
  // filters derived from annotation
  // *****

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

  // *****
  // dict of active filters
  // *****

  @computed
  get activeFilterIdsById() {
    const output = {};
    forEach(uiState.activeFilterIds, d => {
      output[d] = 1;
    });
    return output;
  }

  // *****
  // bool if filters are active
  // *****

  @computed
  get hasFilters() {
    return uiState.activeFilterIds.length != 0;
  }

  // *****
  // filters with active state
  // *****

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

  // --------------------
  //
  // *** HELPER ***
  //
  // --------------------

  // *****
  // download annotations
  // *****

  downloadCanvas(id) {
    if (this.rawAnnotationsWithUpdatedProperties.length == 0) {
      return [];
    }

    const { activeCanvasId } = uiState;
    let filters;

    // get filters
    if (id == activeCanvasId) {
      filters = uiState.activeFilterIds;
    } else {
      const canvas = uiState.canvases.find(d => d.id == id);
      filters = canvas.filters;
    }

    // get raw annotations filtered
    let annotations;
    if (filters.length > 0) {
      let filtersById = {};
      filters.forEach(d => (filtersById[d] = 1));
      annotations = [
        ...this.rawAnnotationsWithUpdatedProperties.filter(
          d => filtersById[d.tagId] != undefined,
        ),
      ];
    } else {
      annotations = [...this.rawAnnotationsWithUpdatedProperties];
    }

    var blob = new Blob([JSON.stringify(annotations)], {
      type: 'application/json;charset=utf-8',
    });
    FileDownload(blob, 'canvas.json');
  }

}

const dataAPI = new DataAPI();
export default dataAPI;
