import React from 'react';

const TooltipContent = props => {
  const { items } = props;
  const annotations = items.map(d => {
    return (
      <div className="c-tooltip__annotation" key={d.id}>
        <span
          className="c-tooltip__category"
          style={{ backgroundColor: d.color }}
        />{' '}
        {d.tagPath}
        {/*        <br />
        <h3>Author</h3> {d.author}*/}
        {d.importance ||
          (d.certainty && (
            <div>
              <h3>Properties</h3>
              {d.importance ? `Importance: ${d.importance}` : ''}
              {d.certainty ? `Certainty: ${d.certainty}` : ''}
            </div>
          ))}
      </div>
    );
  });
  return (
    <div
      className="c-tooltip__content"
      style={{ minWidth: '250px', maxWidth: '400px' }}>
      <h2>{`${items.length} Annotation${items.length > 1 ? 's' : ''}`}</h2>
      {annotations}
    </div>
  );
};

export default TooltipContent;
