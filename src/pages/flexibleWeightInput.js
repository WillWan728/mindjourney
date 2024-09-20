import React, { useState, useEffect } from 'react';

const FlexibleWeightInput = ({ components, initialWeights, onWeightsChange }) => {
  const [weights, setWeights] = useState(initialWeights);
  const [total, setTotal] = useState(100);

  useEffect(() => {
    const newTotal = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    setTotal(newTotal);
  }, [weights]);

  useEffect(() => {
    setWeights(initialWeights);
  }, [initialWeights]);

  const handleWeightChange = (component, value) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const oldValue = weights[component];
    const diff = newValue - oldValue;

    let newWeights = { ...weights, [component]: newValue };

    // Adjust other weights
    const otherComponents = Object.keys(weights).filter(c => c !== component);
    let remainingDiff = diff;

    for (let i = 0; i < otherComponents.length; i++) {
      const c = otherComponents[i];
      if (i === otherComponents.length - 1) {
        // Last component gets the remaining difference
        newWeights[c] = Math.max(0, weights[c] - remainingDiff);
      } else {
        const adjustment = Math.round(remainingDiff / (otherComponents.length - i));
        newWeights[c] = Math.max(0, weights[c] - adjustment);
        remainingDiff -= (weights[c] - newWeights[c]);
      }
    }

    // Ensure total is 100
    const newTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    if (newTotal !== 100) {
      const componentToAdjust = otherComponents.find(c => newWeights[c] > 0) || component;
      newWeights[componentToAdjust] += 100 - newTotal;
    }

    setWeights(newWeights);
    onWeightsChange(newWeights);
  };

  return (
    <div className="flexible-weight-input">
      {components.map(component => (
        <div key={component} className="weight-input-row">
          <label htmlFor={`weight-${component}`}>{component.charAt(0).toUpperCase() + component.slice(1)}:</label>
          <input
            id={`weight-${component}`}
            type="number"
            min="0"
            max="100"
            value={weights[component]}
            onChange={(e) => handleWeightChange(component, e.target.value)}
            onBlur={(e) => handleWeightChange(component, e.target.value)}
          />
          <span>%</span>
        </div>
      ))}
      <div className={`total-weight ${total !== 100 ? 'invalid' : ''}`}>
        Total: {total}%
      </div>
    </div>
  );
};

export default FlexibleWeightInput;