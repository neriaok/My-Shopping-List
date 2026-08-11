import { Check, X } from "lucide-react";
import type { Aisle, ShoppingItem } from "../types";

const TORN_CLIPS = [
  "polygon(0% 2%, 4% 0%, 9% 1.5%, 15% 0%, 22% 1%, 30% 0%, 38% 1.3%, 46% 0%, 55% 1%, 63% 0%, 71% 1.4%, 79% 0%, 87% 1%, 94% 0%, 100% 1.5%, 100% 97%, 96% 100%, 90% 98.5%, 82% 100%, 74% 98.7%, 66% 100%, 57% 98.5%, 49% 100%, 40% 98.8%, 32% 100%, 23% 99%, 15% 100%, 7% 98.5%, 0% 100%)",
  "polygon(1% 0%, 8% 1.5%, 16% 0%, 24% 1.2%, 33% 0%, 42% 1.4%, 51% 0%, 60% 1.1%, 69% 0%, 78% 1.3%, 87% 0%, 95% 1%, 100% 0%, 99% 96%, 92% 100%, 84% 98.4%, 76% 100%, 67% 98.6%, 58% 100%, 49% 98.5%, 40% 100%, 31% 98.7%, 22% 100%, 13% 98.6%, 4% 100%, 0% 97%)",
  "polygon(0% 1%, 6% 0%, 13% 1.4%, 21% 0%, 29% 1.2%, 37% 0%, 46% 1.3%, 55% 0%, 64% 1.1%, 73% 0%, 82% 1.4%, 91% 0%, 100% 1.2%, 100% 98%, 93% 100%, 85% 98.5%, 76% 100%, 68% 98.7%, 59% 100%, 50% 98.4%, 41% 100%, 32% 98.6%, 23% 100%, 15% 98.5%, 7% 100%, 0% 98%)",
];
const WOBBLE_ROTATIONS = [-2, 1, -1, 2, -1.5, 1.5];

function Wobbly({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            transform: `rotate(${WOBBLE_ROTATIONS[i % WOBBLE_ROTATIONS.length]}deg) translateY(${i % 2 === 0 ? 0 : 1}px)`,
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </>
  );
}

interface CategoryNoteProps {
  aisle: Aisle;
  items: ShoppingItem[];
  index: number;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onToggleCategory: (aisleId: string) => void;
}

/** פתק "נייר קרוע" בודד לקטגוריה אחת - חלק מה-WRAP במסך הקנייה */
export function CategoryNote({ aisle, items, index, onToggleItem, onRemoveItem, onToggleCategory }: CategoryNoteProps) {
  const allChecked = items.every((it) => it.checked);
  const rotations = [-2.2, 1.7, -0.8, 2.1, -1.4, 1.1];
  const rotate = rotations[index % rotations.length];
  const clip = TORN_CLIPS[index % TORN_CLIPS.length];
  const tapeLeft = 30 + ((index * 17) % 40);
  const tapeRotate = index % 2 === 0 ? 4 : -5;

  return (
    <div style={{ position: "relative", transform: `rotate(${rotate}deg)` }}>
      <div
        style={{
          position: "absolute",
          top: -10,
          left: `${tapeLeft}%`,
          width: 42,
          height: 18,
          zIndex: 3,
          background: `${aisle.accent}88`,
          clipPath:
            "polygon(0% 20%, 8% 0%, 22% 15%, 38% 2%, 55% 18%, 70% 3%, 85% 16%, 100% 5%, 100% 85%, 90% 100%, 75% 88%, 60% 100%, 42% 90%, 25% 100%, 12% 85%, 0% 95%)",
          transform: `rotate(${tapeRotate}deg)`,
        }}
      />

      <div
        style={{
          width: 216,
          background: `radial-gradient(rgba(80,60,30,0.05) 0.6px, transparent 0.8px) 3px 2px/9px 9px, ${aisle.bg}`,
          clipPath: clip,
          boxShadow: "3px 5px 0 rgba(60,45,20,0.08), 5px 10px 14px rgba(50,40,15,0.2)",
          padding: "18px 15px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "'Segoe Print','Comic Sans MS',cursive", fontWeight: 700, fontSize: 17, color: aisle.accent }}>
            <Wobbly text={aisle.name} />
          </span>
        </div>

        <div style={{ fontSize: 11, color: aisle.accent, opacity: 0.65, textAlign: "center", marginBottom: 4 }}>
          {items.filter((i) => i.checked).length}/{items.length} נלקחו
        </div>

        <button
          onClick={() => onToggleCategory(aisle.id)}
          style={{
            display: "block",
            margin: "0 auto 10px",
            border: "none",
            background: "transparent",
            color: aisle.accent,
            fontFamily: "'Segoe Print','Comic Sans MS',cursive",
            fontSize: 12,
            textDecoration: "underline",
            cursor: "pointer",
            padding: "8px 14px", // מרחיב את אזור הלחיצה בלי לשנות את הגודל החזותי
            minHeight: 32,
          }}
        >
          {allChecked ? "בטל הכל ✗" : "סמן הכל ✓"}
        </button>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 2, minHeight: 40 }}>
              {/*
                אזור הלחיצה (הכפתור) הוא 40x40 - קרוב לסטנדרט הנגישות המומלץ למגע (44x44),
                אבל התיבה החזותית בפנים נשארת קטנה ודקה כמו על פתק אמיתי.
              */}
              <button
                onClick={() => onToggleItem(item.id)}
                aria-label={item.checked ? "בטל סימון" : "סמן כנלקח"}
                style={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: `2px solid ${aisle.accent}`,
                    borderRadius: 2,
                    background: item.checked ? aisle.accent : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.checked && <Check size={11} color="#FFFDF3" strokeWidth={3} />}
                </span>
              </button>
              <span
                onClick={() => onToggleItem(item.id)}
                style={{
                  flex: 1,
                  fontFamily: "'Segoe Print','Comic Sans MS',cursive",
                  fontSize: 14,
                  cursor: "pointer",
                  color: item.checked ? `${aisle.accent}77` : "#3A2E1C",
                  textDecoration: item.checked ? "line-through" : "none",
                  padding: "10px 0", // מגדיל את גובה שטח הלחיצה על הטקסט עצמו
                }}
              >
                {item.name}
              </span>
              <button
                onClick={() => onRemoveItem(item.id)}
                aria-label="מחק פריט"
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "transparent",
                  color: `${aisle.accent}66`,
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
