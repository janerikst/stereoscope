import React from 'react';

class DataForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { text: '', annotation: '' };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    let value;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'file') {
      value = target.files[0];
    } else {
      value = target.value;
    }
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { onSubmit } = this.props;
    onSubmit(this.state.text, this.state.annotation);
  }

  render() {
    const { header } = this.props;
    return (
      <form className="c-canvas-modal" onSubmit={this.handleSubmit}>
        <h2>{header}</h2>
        <p>
          Text File:{' '}
          <input
            type="file"
            name="text"
            accept="text/plain"
            onChange={this.handleInputChange}
          />
        </p>
        <p>
          Annotation File:{' '}
          <input
            type="file"
            name="annotation"
            accept="application/json"
            onChange={this.handleInputChange}
          />
        </p>
        <input type="submit" value="Load Data" />
      </form>
    );
  }
}

export default DataForm;
