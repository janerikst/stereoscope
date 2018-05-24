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
  const { showAddCanvasDialog, showDataDialog, editCanvasId } = uiState;
  const { LAYOUT_DEFAULT } = config;

  // interactions
  const handleSubmitAddCanvasDialog = (title, layout) => {
    uiState.addCanvas(title, layout);
  };
  const handleCloseAddCanvasDialog = () => {
    uiState.triggerAddCanvasDialog();
  };
  const handleSubmitEditCanvasDialog = (title, layout) => {
    uiState.editCanvas(title, layout);
  };
  const handleCloseEditCanvasDialog = () => {
    uiState.triggerEditCanvasDialog();
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
          layout={LAYOUT_DEFAULT}
          layouts={layoutList}
          submitTitle="Add Canvas"
          onSubmit={handleSubmitAddCanvasDialog}
          onClose={handleCloseAddCanvasDialog}
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
            layouts={layoutList}
            onSubmit={handleSubmitEditCanvasDialog}
            onClose={handleCloseEditCanvasDialog}
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
