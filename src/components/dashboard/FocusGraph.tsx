type FocusGraphProps = {
  onClick: () => void;
};

export function FocusGraph({ onClick }: FocusGraphProps) {
  return (
    <div
      className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 p-6 cursor-pointer hover:border-blue-400 transition-colors"
      onClick={onClick}
    >
      <h3 className="text-xl font-bold mb-4 text-white">集中度グラフ</h3>
      <div className="h-64 flex items-center justify-center flex-col text-center">
        <div className="relative w-full h-full flex items-end justify-center">
          <svg className="w-full h-full absolute" viewBox="0 0 300 150">
            <defs>
              <linearGradient id="glow" x1="0" x2="0" y1="0" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5"></stop>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path
              d="M 0 120 C 40 100, 60 40, 100 80 S 160 140, 200 100 S 260 20, 300 50"
              fill="url(#glow)"
              stroke="none"
            ></path>
            <path
              className="graph-glow"
              d="M 0 120 C 40 100, 60 40, 100 80 S 160 140, 200 100 S 260 20, 300 50"
              fill="none"
              stroke="#f59e0b"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
