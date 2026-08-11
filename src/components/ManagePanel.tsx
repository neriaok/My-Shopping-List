import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { Aisle, KeywordsMap, ShoppingItem } from "../types";

interface ManagePanelProps {
  aisles: Aisle[];
  keywordsMap: KeywordsMap;
  unmatchedItems: ShoppingItem[];
  onChangeItemCategory: (itemId: string, categoryId: string) => void;
  onCreateCategory: (name: string) => string | null;
  onCreateCategoryForItem: (itemId: string, categoryName: string, seedKeyword: string) => void;
  onAddKeyword: (aisleId: string, word: string) => void;
  onRemoveKeyword: (aisleId: string, word: string) => void;
  onClose: () => void;
}

export function ManagePanel({
  aisles,
  keywordsMap,
  unmatchedItems,
  onChangeItemCategory,
  onCreateCategory,
  onCreateCategoryForItem,
  onAddKeyword,
  onRemoveKeyword,
  onClose,
}: ManagePanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [keywordDrafts, setKeywordDrafts] = useState<Record<string, string>>({});
  const [showTopNewCategory, setShowTopNewCategory] = useState(false);
  const [topNewCategoryName, setTopNewCategoryName] = useState("");
  const [creatingForItem, setCreatingForItem] = useState<string | null>(null);
  const [itemNewCategoryName, setItemNewCategoryName] = useState("");

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>ניהול קטגוריות</h1>
      <p style={{ color: "#7A7267", fontSize: 14, margin: "0 0 28px", lineHeight: 1.5 }}>
        תקבע איזה מילים שייכות לאיזה מעבר בסופר - השינוי חל מיד על הסיווג האוטומטי
      </p>

      {unmatchedItems.map((item) => (
        <div key={item.id} style={{ background: "#FFFFFF", border: "2px solid #C97B4A", borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#8A4A22", marginBottom: 4 }}>
            "{item.name}" לא זוהה אוטומטית
          </div>
          <div style={{ fontSize: 13.5, color: "#7A7267", marginBottom: 16 }}>
            הוא נמצא כרגע בקטגוריית "שונות". לאן להעביר אותו?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {aisles.filter((a) => a.id !== "other").map((a) => (
              <button
                key={a.id}
                onClick={() => onChangeItemCategory(item.id, a.id)}
                style={{
                  textAlign: "right",
                  fontSize: 14.5,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #DCD3BE",
                  background: "#FBF9F3",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{a.name}</span>
                <span>{a.icon}</span>
              </button>
            ))}

            {creatingForItem === item.id ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  autoFocus
                  value={itemNewCategoryName}
                  onChange={(e) => setItemNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onCreateCategoryForItem(item.id, itemNewCategoryName || item.name, item.name);
                      setCreatingForItem(null);
                      setItemNewCategoryName("");
                    }
                  }}
                  placeholder="שם הקטגוריה החדשה"
                  style={{ flex: 1, fontSize: 14, padding: "10px 12px", borderRadius: 10, border: "1px solid #DCD3BE" }}
                />
                <button
                  onClick={() => {
                    onCreateCategoryForItem(item.id, itemNewCategoryName || item.name, item.name);
                    setCreatingForItem(null);
                    setItemNewCategoryName("");
                  }}
                  style={{ fontSize: 13.5, padding: "10px 16px", borderRadius: 10, border: "none", background: "#4C7A54", color: "#FFF", cursor: "pointer" }}
                >
                  צור ושבץ
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreatingForItem(item.id)}
                style={{
                  fontSize: 14.5,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px dashed #4C7A54",
                  background: "transparent",
                  color: "#4C7A54",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + צור קטגוריה חדשה בשביל זה
              </button>
            )}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>כל הקטגוריות</span>
        <button
          onClick={() => setShowTopNewCategory((v) => !v)}
          style={{ fontSize: 13.5, background: "#2B2521", color: "#F7F3E8", border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer" }}
        >
          + חדשה
        </button>
      </div>

      {showTopNewCategory && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            autoFocus
            value={topNewCategoryName}
            onChange={(e) => setTopNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onCreateCategory(topNewCategoryName);
                setTopNewCategoryName("");
                setShowTopNewCategory(false);
              }
            }}
            placeholder="שם הקטגוריה החדשה"
            style={{ flex: 1, fontSize: 14.5, padding: "11px 14px", borderRadius: 10, border: "1px solid #DCD3BE" }}
          />
          <button
            onClick={() => {
              onCreateCategory(topNewCategoryName);
              setTopNewCategoryName("");
              setShowTopNewCategory(false);
            }}
            style={{ fontSize: 13.5, padding: "11px 18px", borderRadius: 10, border: "none", background: "#4C7A54", color: "#FFF", cursor: "pointer" }}
          >
            צור
          </button>
        </div>
      )}

      {aisles.map((a) => {
        const isOpen = expandedCategory === a.id;
        const kws = keywordsMap[a.id] ?? [];
        return (
          <div key={a.id} style={{ background: "#FFFFFF", border: isOpen ? `2px solid ${a.accent}` : "1px solid #E8E1CF", borderRadius: 14, marginBottom: 14, overflow: "hidden" }}>
            <div onClick={() => setExpandedCategory(isOpen ? null : a.id)} style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                {a.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{a.name}</div>
                <div style={{ fontSize: 12.5, color: "#9A8F82", marginTop: 2 }}>{kws.length} מילות מפתח</div>
              </div>
              <ChevronLeft size={18} style={{ color: isOpen ? a.accent : "#C9C0AE", transform: isOpen ? "rotate(-90deg)" : "none" }} />
            </div>

            {isOpen && (
              <div style={{ padding: "4px 18px 18px", borderTop: "1px solid #F0EBDD" }}>
                <div style={{ fontSize: 12.5, color: "#9A8F82", margin: "14px 0 10px" }}>מילות המפתח שמזהות פריטים לקטגוריה הזו:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {kws.length === 0 && <div style={{ fontSize: 13.5, color: "#B7AF9F" }}>אין עדיין מילות מפתח</div>}
                  {kws.map((w) => (
                    <div key={w} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FBF9F3", borderRadius: 10, padding: "6px 6px 6px 14px" }}>
                      <span style={{ fontSize: 14.5 }}>{w}</span>
                      <button
                        onClick={() => onRemoveKeyword(a.id, w)}
                        aria-label={`הסר את המילה ${w}`}
                        style={{ width: 40, height: 40, border: "none", background: "transparent", color: "#B7AF9F", cursor: "pointer", fontSize: 16 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={keywordDrafts[a.id] ?? ""}
                    onChange={(e) => setKeywordDrafts((prev) => ({ ...prev, [a.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onAddKeyword(a.id, keywordDrafts[a.id] ?? "");
                        setKeywordDrafts((prev) => ({ ...prev, [a.id]: "" }));
                      }
                    }}
                    placeholder="מילת מפתח חדשה..."
                    style={{ flex: 1, fontSize: 13.5, padding: "10px 12px", borderRadius: 10, border: "1.5px dashed #C9BFA6" }}
                  />
                  <button
                    onClick={() => {
                      onAddKeyword(a.id, keywordDrafts[a.id] ?? "");
                      setKeywordDrafts((prev) => ({ ...prev, [a.id]: "" }));
                    }}
                    style={{ fontSize: 13.5, padding: "10px 16px", borderRadius: 10, border: "none", background: a.accent, color: "#FFF", cursor: "pointer" }}
                  >
                    הוסף
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <span onClick={onClose} style={{ fontSize: 13.5, color: "#7A7267", textDecoration: "underline", cursor: "pointer" }}>
          ← חזרה
        </span>
      </div>
    </div>
  );
}
