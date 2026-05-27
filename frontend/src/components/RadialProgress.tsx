type RadialProgressProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export function RadialProgress({
  value,
  size = 126,
  strokeWidth = 10,
  label,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;
  const color =
    value >= 85 ? "text-green-500" : value >= 70 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle
            className="text-slate-100"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={color}
            stroke="currentColor"
            fill="transparent"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-800">
          {value}%
        </span>
      </div>
      {label && <p className="text-center text-sm font-semibold text-slate-600">{label}</p>}
    </div>
  );
}
