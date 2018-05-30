import React from 'react';
import { observer } from 'mobx-react';

import dataAPI from 'data/dataAPI';
import uiState from 'state/uiState';
import config from 'config/config';

import ReactModal from 'react-modal';
import CanvasForm from '../components/CanvasForm';
import DataForm from '../components/DataForm';

const Modals = observer(props => {
  // vars
  const { layoutList, canvasDetails, needDataFiles } = dataAPI;
  const {
    showAddCanvasDialog,
    showDataDialog,
    editCanvasId,
    cloneCanvasId,
  } = uiState;

  const { LAYOUT_DEFAULT } = config;

  // interactions
  const handleSubmitAddCanvasDialog = (title, layout, comment) => {
    uiState.addCanvas(title, layout, comment);
  };
  const handleCloseAddCanvasDialog = () => {
    uiState.triggerAddCanvasDialog();
  };

  const handleSubmitEditCanvasDialog = (
    title,
    layout,
    comment,
    selectionFixed,
  ) => {
    uiState.editCanvas(title, layout, comment, selectionFixed);
  };
  const handleCloseEditCanvasDialog = () => {
    uiState.triggerEditCanvasDialog();
  };

  const handleSubmitCloneCanvasDialog = (
    title,
    layout,
    comment,
    selectionFixed,
  ) => {
    uiState.cloneCanvas(title, layout, comment, selectionFixed);
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
            selectedFixed={canvasDetails.selectedAnnotationFixed}
            showSelectedFixed={true}
            layouts={layoutList}
            onSubmit={handleSubmitEditCanvasDialog}
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
            selectedFixed={canvasDetails.selectedAnnotationFixed}
            showSelectedFixed={true}
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
