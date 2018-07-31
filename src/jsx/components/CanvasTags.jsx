import React from 'react';
import { observer } from 'mobx-react';
import Button from '../components/Button';

@observer
class CanvasTags extends React.Component {
  constructor(props) {
    super(props);
    const { tags } = props;
    this.state = { tags };
    this.state.tag = "";
    this.saveTags = this.state.tags;
    this.handleDeleteTag = this.handleDeleteTag.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAddTags = this.handleAddTags.bind(this);
  }

  handleDeleteTag(event) {
    const tag = event.target.attributes.getNamedItem('tag').value;
    this.saveTags = this.saveTags.filter(d => {
      if (d.localeCompare(tag) == 0) {
        return false;
      } else {
        return true;
      }
    });
    console.log(this.saveTags);
    this.setState({
      tags : this.saveTags
    })
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    this.setState({
      tag : value
    });
  }

  handleAddTags(event) {
    if (this.state.tag != "") {
      this.saveTags = this.saveTags.concat(this.state.tag);
      this.setState({
        "tags": this.saveTags,
      });
      this.setState({
        tag : ""
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const { onSubmit } = this.props;
    onSubmit(this.state.tags);
  }

  render() {
    const {
      header,
      submitTitle = 'Save Tags',
      onClose,
    } = this.props;

    const tags = this.state.tags.map((d,i) => {
      return (
        <div
          className="c-modal__tag"
          id={d+i}
          key={d+i}>
          <span>
            {d + " "}
          </span>
          <span tag={d} className="c-modal__tagicon" onClick={this.handleDeleteTag}>
            x
          </span>
        </div>
      );
    });

    return (
      <form className="c-canvas-modal" onSubmit={this.handleSubmit}>
        <h2>{header}</h2>
          <input
            className="c-modal__textfield"
            type="text"
            name="tags"
            onChange={this.handleInputChange}
            value={this.state.tag}
          />
          <div className="o-dialog-button" onClick={this.handleAddTags}>Add Tag</div>
          <div className="c-modal__tags">
            {tags}
          </div>
        <input className="o-small-dialog-button" type="submit" value={submitTitle} />
      </form>
    );
  }
}

export default CanvasTags;
