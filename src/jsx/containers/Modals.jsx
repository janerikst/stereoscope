import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import ReactModal from 'react-modal';
import CanvasForm from '../components/CanvasForm';
import CanvasTags from '../components/CanvasTags';
import DataForm from '../components/DataForm';

const Modals = observer(props => {
  // vars
  const { layoutList, canvasDetails, needDataFiles, activeCanvas } = dataAPI;
  const {
    showAddCanvasDialog,
    showEditTagsDialog,
    showDataDialog,
    editCanvasId,
    cloneCanvasId,
    editTagsCanvasId,
  } = uiState;

  const { LAYOUT_DEFAULT } = config;

  // interactions
  const handleSubmitAddCanvasDialog = (title, layout, comment) => {
    uiState.addCanvas(title, layout, comment);
  };
  const handleCloseAddCanvasDialog = () => {
    uiState.triggerAddCanvasDialog();
  };

  const handleSubmitEditCanvasDialog = (title, layout, comment) => {
    uiState.editCanvas(title, layout, comment);
  };
  const handleCloseEditCanvasDialog = () => {
    uiState.triggerEditCanvasDialog();
  };

  //fill in the according handlers for EditTags

  const handleSubmitEditTagsDialog = tags => {
    uiState.editTagsDialog(tags);
  };

  const handleCloseEditTagsDialog = () => {
    uiState.triggerEditTagsDialog();
  };

  const handleSubmitCloneCanvasDialog = (title, layout, comment) => {
    uiState.cloneCanvas(title, layout, comment);
  };
  const handleCloseCloneCanvasDialog = () => {
    uiState.triggerCloneCanvasDialog();
  };

  const handleCloseDataDialog = () => {
    uiState.triggerDataDialog();
  };
  const handleSubmitDataDialog = (text, annotation) => {
    uiState.setDataFiles(text, annotation);
  };

  // return
  return (
    <div>
      <ReactModal
        isOpen={showAddCanvasDialog}
        ariaHideApp={false}
        className="c-modal__content"
        overlayClassName="c-modal__overlay">
        <span
          className="c-modal__close o-close"
          onClick={handleCloseAddCanvasDialog}
        />
        <CanvasForm
          header="New Canvas"
          title=""
          comment=""
          layout={LAYOUT_DEFAULT}
          layouts={layoutList}
          submitTitle="Add Canvas"
          onSubmit={handleSubmitAddCanvasDialog}
        />
      </ReactModal>
      {editCanvasId &&
      canvasDetails && (
        <ReactModal
          isOpen={true}
          ariaHideApp={false}
          className="c-modal__content"
          overlayClassName="c-modal__overlay">
          <span
            className="c-modal__close o-close"
            onClick={handleCloseEditCanvasDialog}
          />
          <CanvasForm
            header="Edit Canvas"
            title={canvasDetails.title}
            layout={canvasDetails.layout}
            comment={canvasDetails.comment}
            layouts={layoutList}
            onSubmit={handleSubmitEditCanvasDialog}
          />
        </ReactModal>
      )}
      {editTagsCanvasId &&
        canvasDetails && (
        <ReactModal
          isOpen={true}
          ariaHideApp={false}
          className="c-modal__content"
          overlayClassName="c-modal__overlay">
          <span
            className="c-modal__close o-close"
            onClick={handleCloseEditTagsDialog}
          />
          <CanvasTags
            header="Edit Tags"
            tags={canvasDetails.tags}
            onSubmit={handleSubmitEditTagsDialog}
          />
        </ReactModal>
      )}
      {cloneCanvasId &&
      canvasDetails && (
        <ReactModal
          isOpen={true}
          ariaHideApp={false}
          className="c-modal__content"
          overlayClassName="c-modal__overlay">
          <span
            className="c-modal__close o-close"
            onClick={handleCloseCloneCanvasDialog}
          />
          <CanvasForm
            header="Clone Canvas"
            title={canvasDetails.title}
            layout={canvasDetails.layout}
            comment={canvasDetails.comment}
            submitTitle="Clone Canvas"
            layouts={layoutList}
            onSubmit={handleSubmitCloneCanvasDialog}
          />
        </ReactModal>
      )}
      {(showDataDialog || needDataFiles) && (
        <ReactModal
          isOpen={true}
          ariaHideApp={false}
          className="c-modal__content c-modal__content--big"
          overlayClassName="c-modal__overlay">
          {!needDataFiles && (
            <span
              className="c-modal__close o-close"
              onClick={handleCloseDataDialog}
            />
          )}
          <DataForm header="Load Data" onSubmit={handleSubmitDataDialog} />
        </ReactModal>
      )}
    </div>
  );
});

export default Modals;
