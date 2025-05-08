import { CheckCircle, Circle, Clock, FileEdit, FolderPlus, Terminal } from 'lucide-react';
import { Step, StepType } from '../types';
import { cn } from '../utils/cn';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

function getStepIcon(type: StepType) {
  switch (type) {
    case StepType.CreateFile:
      return <FileEdit className="w-4 h-4" />;
    case StepType.CreateFolder:
      return <FolderPlus className="w-4 h-4" />;
    case StepType.RunScript:
      return <Terminal className="w-4 h-4" />;
    default:
      return <Circle className="w-4 h-4" />;
  }
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-500 text-sm">
          Generating build steps...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {steps.map((step) => (
        <div
          key={step.id}
          className={cn(
            "p-3 rounded-lg cursor-pointer transition-all border border-transparent",
            currentStep === step.id
              ? "bg-gray-800/80 border-gray-700"
              : "hover:bg-gray-800/50",
          )}
          onClick={() => onStepClick(step.id)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : step.status === 'in-progress' ? (
                <Clock className="w-5 h-5 text-blue-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
                  {getStepIcon(step.type)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium text-sm",
                step.status === 'completed' ? "text-gray-300" : "text-gray-400"
              )}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {step.description}
                </p>
              )}
              {step.type === StepType.CreateFile && step.path && (
                <p className="text-xs bg-gray-800 text-gray-400 rounded mt-2 px-2 py-1 font-mono truncate">
                  {step.path}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}