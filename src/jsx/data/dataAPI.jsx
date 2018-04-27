import { computed } from 'mobx';

import uiState from '../state/uiState';
import { textData, annotationData } from './dataStore';

import {
  values,
  map,
  orderBy,
  groupBy,
  keyBy,
  isEmpty,
  includes,
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
      // console.log(`${start}-${end}`);
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

  // annotations

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
  get activeAnnotations() {
    if (this.annotations.length == 0) {
      return [];
    }
    return this.annotations.map(d => {
      d.isActive = true;
      return d;
    });
  }

  // filters

  @computed
  get filters() {
    if (this.annotations.length == 0) {
      return [];
    }
    return map(groupBy(this.annotations, 'tagId'), d => {
      const item = d[0];
      return {
        id: item.tagId,
        tagPath: item.tagPath,
        color: item.color,
        count: d.length,
      };
    });
  }
}
const dataAPI = new DataAPI();
export default dataAPI;
