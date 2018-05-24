import React from 'react';
import { observer } from 'mobx-react';

@observer
class CanvasForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { title, layout } = props;
    this.state = { title: title, layout: layout };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { onSubmit } = this.props;
    onSubmit(this.state.title, this.state.layout);
  }

  render() {
    const {
      header,
      layouts,
      submitTitle = 'Save Canvas',
      onClose,
    } = this.props;
    const layoutOptions = layouts.map(d => {
      return (
        <option key={d.id} value={d.id}>
          {d.title}
        </option>
      );
    });
    return (
      <form className="c-canvas-modal" onSubmit={this.handleSubmit}>
        <h2>{header}</h2>
        <p>
          Title:{' '}
          <input
            type="text"
            name="title"
            onChange={this.handleInputChange}
            value={this.state.title}
          />
        </p>
        <p>
          Layouts:{' '}
          <select
            name="layout"
            value={this.state.layout}
            onChange={this.handleInputChange}>
            {layoutOptions}
          </select>
        </p>
        <input type="submit" value={submitTitle} />
      </form>
    );
  }
}

export default CanvasForm;
