import * as React from "react"

// Custom SliderPrimitive implementation (simplified version of Radix UI's implementation)
const SliderPrimitive = {
  Root: React.forwardRef(({ className, children, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value || [0]);
    const [isDragging, setIsDragging] = React.useState(false);
    const rootRef = React.useRef(null);
    
    React.useEffect(() => {
      if (value) setLocalValue(value);
    }, [value]);

    React.useEffect(() => {
      if (isDragging) {
        const handleGlobalPointerMove = (e) => {
          if (!rootRef.current) return;
          updateValue(e);
        };

        const handleGlobalPointerUp = () => {
          setIsDragging(false);
        };

        window.addEventListener('pointermove', handleGlobalPointerMove);
        window.addEventListener('pointerup', handleGlobalPointerUp);

        return () => {
          window.removeEventListener('pointermove', handleGlobalPointerMove);
          window.removeEventListener('pointerup', handleGlobalPointerUp);
        };
      }
    }, [isDragging]);
    
    const handlePointerDown = (e) => {
      setIsDragging(true);
      updateValue(e);
    };

    const updateValue = (e) => {
      const track = rootRef.current?.querySelector('[data-track]');
      if (!track) return;
      
      const rect = track.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      
      let newValue = min + position * (max - min);
      newValue = Math.round(newValue / step) * step;
      newValue = Math.max(min, Math.min(max, newValue));
      
      const newValues = [newValue];
      setLocalValue(newValues);
      if (onValueChange) onValueChange(newValues);
    };
    
    return (
      <div 
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {children}
      </div>
    );
  }),
  Track: React.forwardRef(({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-track
      className={cn("relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100", className)}
      {...props}
    />
  )),
  Range: React.forwardRef(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute h-full bg-slate-900", className)}
      {...props}
    />
  )),
  Thumb: React.forwardRef(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("block h-5 w-5 rounded-full border-2 border-slate-900 bg-white ring-offset-white transition-colors focus-visible:outline-none", className)}
      {...props}
    />
  ))
};

// Utility function to merge class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const Slider = React.forwardRef(({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const percentage = value ? 
    `${((value[0] - min) / (max - min)) * 100}%` : 
    "0%";
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100">
        <SliderPrimitive.Range className="absolute h-full bg-slate-900" style={{ width: percentage }} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb 
        className="absolute block h-5 w-5 rounded-full border-2 border-slate-900 bg-white ring-offset-white transition-colors focus-visible:outline-none" 
        style={{ left: percentage, transform: "translateX(-50%)" }}
      />
    </SliderPrimitive.Root>
  );
});

Slider.displayName = "Slider";

export { Slider };