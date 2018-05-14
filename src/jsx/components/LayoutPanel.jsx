import React from 'react';

class LayoutPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // vars
    const {
      activeLayout,
      layoutList,
      layoutControls,
      onChangeLayout,
      onChangeControls,
    } = this.props;

    // interactions
    const handleLayoutChange = event => onChangeLayout(event.target.value);
    const handleControlChange = event => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const id = target.name;
      onChangeControls(id, value);
    };

    // content
    const layoutOptions = layoutList.map(d => {
      return (
        <option key={d.id} value={d.id}>
          {d.title}
        </option>
      );
    });

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
        </header>
        <div className="c-filter-panel__content">
          <select value={activeLayout} onChange={handleLayoutChange}>
            {layoutOptions}
          </select>
          {layoutControls.length != 0 && (
            <div className="c-filter-panel__controls">
              {layoutControlOptions}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default LayoutPanel;
