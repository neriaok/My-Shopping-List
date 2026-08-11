interface ProgressBarProps {
  checkedCount: number;
  totalCount: number;
  progress: number;
}

export function ProgressBar({ checkedCount, totalCount, progress }: ProgressBarProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4DDCB",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 20,
        maxWidth: 560,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "#5A534B" }}>
        <span>
          {checkedCount} מתוך {totalCount} נלקחו
        </span>
        <span style={{ fontWeight: 700, color: "#4C7A54" }}>{progress}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#EEE8DA", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#4C7A54",
            borderRadius: 999,
            transition: "width 0.35s ease",
          }}
        />
      </div>
    </div>
  );
}
