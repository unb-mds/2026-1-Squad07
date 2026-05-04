export default function RadialProgress({ value }: { value: number }) {
  const color = value > 70 ? "text-green-500" : value > 40 ? "text-yellow-500" : "text-red-500";
  return (
    <div className={`relative size-20 flex items-center justify-center font-bold ${color} border-4 border-current rounded-full`}>
      {value}%
    </div>
  );
}