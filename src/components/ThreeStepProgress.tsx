import React from 'react';
import './ThreeStepProgress.css';

interface ThreeStepProgressProps {
  currentStep: 1 | 2 | 3; // Must be 1, 2, or 3
  labels?: string[]; // Optional labels for each step
}

/**
 * A three-step progress indicator component with bubbles that fill progressively.
 * 
 * Usage:
 * ```tsx
 * <ThreeStepProgress currentStep={2} labels={['Step 1', 'Step 2', 'Step 3']} />
 * ```
 */
const ThreeStepProgress: React.FC<ThreeStepProgressProps> = ({ 
  currentStep, 
  labels = ['Step 1', 'Step 2', 'Step 3'] 
}) => {
  const steps = [1, 2, 3];

  const getStepStatus = (step: number): 'completed' | 'current' | 'pending' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="three-step-progress">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="step-container">
            <div className={`step-bubble ${getStepStatus(step)}`}>
              {getStepStatus(step) === 'completed' ? (
                <span className="checkmark">✓</span>
              ) : (
                <span className="step-number">{step}</span>
              )}
            </div>
            {labels[index] && (
              <span className={`step-label ${getStepStatus(step)}`}>
                {labels[index]}
              </span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`connector ${step < currentStep ? 'completed' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ThreeStepProgress;
