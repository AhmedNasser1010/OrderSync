"use client";

const CheckPoints = ({
  steps,
  progress,
  themeColorFill,
  themeColorEmpty,
}: {
  steps: string[];
  progress: number;
  themeColorFill: string;
  themeColorEmpty: string;
}) => {
  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center">
        <div
          className="absolute top-[25%] -translate-y-1/2 -z-20 w-full h-[5px]"
          style={{ backgroundColor: themeColorEmpty }}
        />
        <div
          className="absolute top-[25%] -translate-y-1/2 -z-10 h-[5px] transition-[width] duration-300"
          style={{ width: `${progress}%`, backgroundColor: themeColorFill }}
        />
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center -translate-y-1/4"
          >
            <span
              className="text-white font-bold rounded-full w-[30px] h-[30px] flex items-center justify-center"
              style={{ backgroundColor: themeColorFill }}
            >
              {index + 1}
            </span>
            <span className="absolute -bottom-[25px] left-1/2 -translate-x-1/2">
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckPoints;
