import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
}

export const Slider: React.FC<SliderProps> = ({ min, max, step = 1, value, onChange, label, suffix = '' }) => {
  return (
    <div className="flex flex-col w-full space-y-2">
      {label && (
        <div className="flex justify-between items-center text-sm font-medium text-slate-700">
          <span>{label}</span>
          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{value}{suffix}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};
