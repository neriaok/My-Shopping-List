import { ListChecks, PenLine } from "lucide-react";

interface ShoppingNoteProps {
  noteText: string;
  onChange: (text: string) => void;
  onStart: () => void;
}

/** שלב 1: פתק כתיבה חופשית - כותבים כל פריט בשורה, בלי סדר */
export function ShoppingNote({ noteText, onChange, onStart }: ShoppingNoteProps) {
  const lineCount = Math.max(noteText.split("\n").length + 4, 12);
  const isEmpty = noteText.trim().length === 0;

  return (
    <div>
      <div style={{ position: "relative", transform: "rotate(-0.6deg)", marginBottom: 22 }}>
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 40,
            width: 70,
            height: 26,
            background: "rgba(230, 202, 122, 0.55)",
            border: "1px solid rgba(200,170,90,0.4)",
            transform: "rotate(-4deg)",
            zIndex: 2,
          }}
        />
        <div style={{ background: "#FFFDF3", borderRadius: 6, padding: "30px 26px 24px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#B7AF9F", fontSize: 12.5, marginBottom: 10 }}>
            <PenLine size={13} />
            <span>הפתק שלי</span>
          </div>
          <textarea
            autoFocus
            value={noteText}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"חלב\nביצים\nלחם\nעגבניות\nנייר טואלט\n..."}
            rows={lineCount}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "vertical",
              background: "repeating-linear-gradient(to bottom, transparent, transparent 30px, #E6DFC9 31px, transparent 32px)",
              fontSize: 17,
              lineHeight: "32px",
              color: "#2B2521",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      <button
        disabled={isEmpty}
        onClick={onStart}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "15px 18px",
          borderRadius: 12,
          border: "none",
          background: isEmpty ? "#D8CFB9" : "#4C7A54",
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: 700,
          cursor: isEmpty ? "not-allowed" : "pointer",
        }}
      >
        <ListChecks size={19} />
        התחל קנייה - חלק לקטגוריות
      </button>
    </div>
  );
}
