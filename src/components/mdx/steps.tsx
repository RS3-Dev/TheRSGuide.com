import React from 'react';

interface StepsProps {
  children: React.ReactNode;
}

interface StepProps {
  children: React.ReactNode;
}

export const Steps: React.FC<StepsProps> = ({ children }) => {
  return (
    <div className="my-4 border rounded-lg overflow-hidden bg-card">
      <ol className="list-none m-0 p-0">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement<StepInternalProps>(child)) {
            return React.cloneElement(child, {
              stepNumber: index + 1,
            });
          }
          return child;
        })}
      </ol>
    </div>
  );
};

interface StepInternalProps extends StepProps {
  stepNumber?: number;
}

export const Step: React.FC<StepInternalProps> = ({ children, stepNumber }) => {
  return (
    <li className="flex items-start gap-3 p-3 border-b last:border-b-0 border-border">
      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
        {stepNumber}
      </div>
      <div className="flex-1 text-sm pt-0.5">{children}</div>
    </li>
  );
};
