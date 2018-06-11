import React from 'react';
import { observer } from 'mobx-react';
import uiState from 'state/uiState';

@observer
class CommentPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const { onChange, value, onTriggerPanel, onClick, onSave } = this.props;
    const { editComment } = uiState;

    return (
      
        <div className="c-comment-panel">
          <header className="c-comment-panel__header">
            <h3>Comment</h3>
            <span
              className="c-comment-panel__close o-close"
              onClick={onTriggerPanel}
            />
          </header>
          
            {editComment && (
              <div className="c-comment-panel__content">
                <textarea  
                className="c-comment-panel__content__area"
                style={{border: "none"}}
                rows="9" 
                cols="35"
                placeholder="Click to add a comment"
                onChange = {onChange}
                value={value}>
                </textarea>
                <input className="c-comment-panel__save" type="button" value="Save" onClick={onSave} />
              </div>
            )}

            {!editComment && (
              <div className="c-comment-panel__content">
                <p className="c-comment-panel__content__text" onClick={onClick}>
                  {value.length != 0 ? value : "Click to add a comment"}
                </p>
              </div>
            )}
        </div>
      
    );
  }
}

export default CommentPanel;
