import React from 'react';

class LayoutPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // vars
    const { layoutControls, onTriggerPanel, onChangeControls } = this.props;

    // interactions
    const handleControlChange = event => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const id = target.name;
      onChangeControls(id, value);
    };

    const layoutControlOptions = layoutControls.map(d => {
      let field;
      if (d.type == 'list') {
        // list
        const valueList = d.values.map(e => {
          return (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          );
        });
        field = (
          <select name={d.id} value={d.value} onChange={handleControlChange}>
            {valueList}
          </select>
        );
      } else if (d.type == 'input') {
        // field
        field = <input key={d.id} name={d.id} />;
      } else if (d.type == 'checkbox') {
        // checkbox
        field = <input type="checkbox" key={d.id} checked={d.value} name={d.id} onChange={handleControlChange}/>;
      }
      return (
        <div key={d.id}>
          {d.title} {field}
        </div>
      );
    });

    // render
    return (
      <div className="c-filter-panel">
        <header className="c-filter-panel__header">
          <h3>Layout</h3>
          <span
            className="c-filter-panel__close o-close"
            onClick={onTriggerPanel}
          />
        </header>
        <div className="c-filter-panel__content">
          {layoutControls.length != 0 && (
            <div className="c-filter-panel__controls">
              {layoutControlOptions}
            </div>
          )}
          {layoutControls.length == 0 && <span> No options found </span>}
        </div>
      </div>
    );
  }
}

export default LayoutPanel;
