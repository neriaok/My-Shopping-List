import { Check, X } from "lucide-react";
import type { Aisle, ShoppingItem } from "../types";
import styles from "./CategoryNote.module.css";

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

/** פתק "נייר קרוע" בודד לקטגוריה אחת - חלק מהגריד במסך הקנייה (Mobile First: ראו CategoryNote.module.css) */
export function CategoryNote({ aisle, items, index, onToggleItem, onRemoveItem, onToggleCategory }: CategoryNoteProps) {
  const allChecked = items.every((it) => it.checked);
  const rotations = [-2.2, 1.7, -0.8, 2.1, -1.4, 1.1];
  const rotate = rotations[index % rotations.length];
  const clip = TORN_CLIPS[index % TORN_CLIPS.length];
  const tapeLeft = 30 + ((index * 17) % 40);
  const tapeRotate = index % 2 === 0 ? 4 : -5;

  // משתני CSS דינמיים (תלויי קטגוריה/אינדקס) - כל השאר מגיע מהמודול הקבוע ב-CSS
  const wrapperVars = {
    transform: `rotate(${rotate}deg)`,
  } as React.CSSProperties;

  const noteVars = {
    clipPath: clip,
    boxShadow: "3px 5px 0 rgba(60,45,20,0.08), 5px 10px 14px rgba(50,40,15,0.2)",
    ["--note-bg-layers" as any]: `radial-gradient(rgba(80,60,30,0.05) 0.6px, transparent 0.8px) 3px 2px/9px 9px, ${aisle.bg}`,
    ["--accent" as any]: aisle.accent,
  } as React.CSSProperties;

  const tapeVars = {
    left: `${tapeLeft}%`,
    transform: `rotate(${tapeRotate}deg)`,
    ["--tape-color" as any]: `${aisle.accent}88`,
  } as React.CSSProperties;

  return (
    <div className={styles.wrapper} style={wrapperVars}>
      <div className={styles.tape} style={tapeVars} />

      <div className={styles.note} style={noteVars}>
        <div className={styles.titleRow}>
          <span className={styles.title}>
            <Wobbly text={aisle.name} />
          </span>
        </div>

        <div className={styles.counter}>
          {items.filter((i) => i.checked).length}/{items.length} נלקחו
        </div>

        <button className={styles.toggleAllButton} onClick={() => onToggleCategory(aisle.id)}>
          {allChecked ? "בטל הכל ✗" : "סמן הכל ✓"}
        </button>

        <div className={styles.itemsList}>
          {items.map((item) => {
            const itemVars = {
              ["--accent" as any]: aisle.accent,
              ["--checkbox-bg" as any]: item.checked ? aisle.accent : "transparent",
              ["--item-color" as any]: item.checked ? `${aisle.accent}77` : "#3A2E1C",
              ["--item-decoration" as any]: item.checked ? "line-through" : "none",
            } as React.CSSProperties;

            return (
              <div key={item.id} className={styles.itemRow} style={itemVars}>
                <button
                  className={styles.checkboxButton}
                  onClick={() => onToggleItem(item.id)}
                  aria-label={item.checked ? "בטל סימון" : "סמן כנלקח"}
                >
                  <span className={styles.checkboxVisual}>
                    {item.checked && <Check size={11} color="#FFFDF3" strokeWidth={3} />}
                  </span>
                </button>

                <span className={styles.itemName} onClick={() => onToggleItem(item.id)}>
                  {item.name}
                </span>

                <button className={styles.removeButton} onClick={() => onRemoveItem(item.id)} aria-label="מחק פריט">
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}