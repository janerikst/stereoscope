import React from 'react';

const TextAttributes = props => {
  const {
    items,
    annotationCount,
    selectedFixed,
    showCloseBtn,
    onSelectClick,
    onSelectFixedClick,
    onCloseClick,
  } = props;
  // content
  const attributes = items.map(property => {
    return (
      <div key={property.id} className="c-text-attributes__item">
        <h4>{property.title}</h4>
        <ul>
          {property.items.map(value => {
            return (
              <li
                key={value.id}
                className={value.state != 0 ? `is-state-${value.state}` : ''}
                onClick={() => {
                  onSelectClick(property.id, value.id);
                }}>
                {value.id}
              </li>
            );
          })}
        </ul>
      </div>
    );
  });

  // render
  return (
    <div className="c-text-attributes">
      <div className="c-text-attributes__wrapper">
        <h2>
          Selected Annotation{annotationCount > 1 ? 's' : ''} ({annotationCount}){' '}
          <span className="c-text-attributes__fixed">
            <input
              type="checkbox"
              name="selectedFixed"
              checked={selectedFixed}
              onChange={onSelectFixedClick}
            />{' '}
            fixed
          </span>
        </h2>
        {showCloseBtn && (
          <span
            className="c-text-attributes__close o-close"
            onClick={onCloseClick}
          />
        )}
        {!selectedFixed && (
          <div className="c-text-attributes__items">
            <h3>Attributes</h3> {attributes}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextAttributes;
