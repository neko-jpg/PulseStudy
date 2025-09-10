"use client";

export function SummaryCards({
  // TODO: These props should be used when connected to a real data source.
  // mins,
  // acc,
  // flow,
  onOpen,
}: {
  mins: number;
  acc: number;
  flow: number;
  onOpen: (metric: "mins" | "acc" | "flow") => void;
}) {
  // TODO: The values are hardcoded to match the user's HTML for UI verification.
  // This should be replaced with dynamic data from the props.
  const cardsData = [
    {
      title: "学習時間",
      value: 38,
      unit: "分",
      icon: "schedule",
      color: "text-blue-400",
      metric: "mins" as const,
    },
    {
      title: "正答率",
      value: 78,
      unit: "%",
      icon: "check_circle_outline",
      color: "text-green-400",
      metric: "acc" as const,
    },
    {
      title: "平均集中度",
      value: 50,
      unit: "%",
      icon: "psychology",
      color: "text-yellow-400",
      metric: "flow" as const,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cardsData.map((card) => (
        <div key={card.metric} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{card.title}</h3>
            <span className={`material-icons ${card.color}`}>{card.icon}</span>
          </div>
          <p className="text-3xl font-bold">
            {card.value}
            <span className="text-lg font-normal">{card.unit}</span>
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onOpen(card.metric);
            }}
            className="text-blue-400 text-sm mt-2 inline-block"
          >
            詳細を見る
          </a>
        </div>
      ))}
    </section>
  );
}
