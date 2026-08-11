import { useState } from "react";
import { ArrowRight, Plus, Settings, ShoppingBasket } from "lucide-react";
import { useShoppingList } from "./hooks/useShoppingList";
import { ShoppingNote } from "./components/ShoppingNote";
import { CategoryNote } from "./components/CategoryNote";
import { ManagePanel } from "./components/ManagePanel";
import { ProgressBar } from "./components/ProgressBar";

const wrapStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F0EAD9",
  fontFamily: "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', sans-serif",
  color: "#2B2521",
  padding: "32px 16px 80px",
};

export default function App() {
  const list = useShoppingList();
  const [quickAdd, setQuickAdd] = useState("");

  if (!list.loaded) {
    return (
      <div dir="rtl" style={{ ...wrapStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9A8F82", fontSize: 14 }}>טוען את הרשימה שלך...</div>
      </div>
    );
  }

  const gearButton = (
    <button
      onClick={list.openManage}
      aria-label="ניהול קטגוריות"
      style={{
        marginRight: "auto",
        border: "1px solid #DCD3BE",
        background: "#FFF",
        borderRadius: 10,
        width: 42,
        height: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Settings size={17} />
    </button>
  );

  if (list.mode === "manage") {
    return (
      <div dir="rtl" style={{ ...wrapStyle, background: "#F5F1E6" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <ManagePanel
            aisles={list.aisles}
            keywordsMap={list.keywordsMap}
            unmatchedItems={list.unmatchedItems}
            onChangeItemCategory={list.changeItemCategory}
            onCreateCategory={list.createCategory}
            onCreateCategoryForItem={list.createCategoryForItem}
            onAddKeyword={list.addKeyword}
            onRemoveKeyword={list.removeKeyword}
            onClose={list.closeManage}
          />
        </div>
      </div>
    );
  }

  if (list.mode === "building") {
    return (
      <div dir="rtl" style={wrapStyle}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <ShoppingBasket size={26} color="#4C7A54" />
            <h1 style={{ fontSize: "clamp(21px, 6vw, 28px)", fontWeight: 800, margin: 0 }}>רשימת קניות</h1>
            {gearButton}
          </div>
          <p style={{ color: "#7A7267", fontSize: 14, margin: "4px 0 26px" }}>
            תרשום פריט בכל שורה, בכל סדר שבא לך - נסדר לפי מעברים כשתלחץ למטה
          </p>
          <ShoppingNote noteText={list.noteText} onChange={list.setNoteText} onStart={list.startShopping} />
        </div>
      </div>
    );
  }

  // mode === "shopping"
  return (
    <div dir="rtl" style={wrapStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <button onClick={list.backToNote} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "transparent", color: "#7A7267", cursor: "pointer", marginBottom: 14 }}>
          <ArrowRight size={15} />
          חזרה לפתק
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <ShoppingBasket size={26} color="#4C7A54" />
          <h1 style={{ fontSize: "clamp(20px, 5.5vw, 26px)", fontWeight: 800, margin: 0 }}>בקנייה</h1>
          {gearButton}
        </div>
        <p style={{ color: "#7A7267", fontSize: 14, margin: "4px 0 20px" }}>
          כל קטגוריה בפתק משלה - סמן פריט בודד, או את כל הקטגוריה בבת אחת
        </p>

        {list.unmatchedItems.length > 0 && (
          <div
            onClick={list.openManage}
            style={{ background: "#FBF0E4", border: "1px solid #E8CBA3", borderRadius: 12, padding: "12px 16px", marginBottom: 20, maxWidth: 560, fontSize: 13.5, color: "#8A5A20", cursor: "pointer" }}
          >
            ⚠️ {list.unmatchedItems.length} פריטים לא זוהו אוטומטית - לחץ כדי לשבץ אותם לקטגוריה
          </div>
        )}

        <ProgressBar checkedCount={list.checkedCount} totalCount={list.totalCount} progress={list.progress} />

        <div style={{ display: "flex", gap: 8, marginBottom: 28, maxWidth: 560 }}>
          <input
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                list.addQuickItem(quickAdd);
                setQuickAdd("");
              }
            }}
            placeholder="שכחת משהו? הוסף כאן"
            style={{ flex: 1, padding: "13px 14px", borderRadius: 10, border: "1px solid #DCD3BE", fontSize: 15, minHeight: 44 }}
          />
          <button
            onClick={() => {
              list.addQuickItem(quickAdd);
              setQuickAdd("");
            }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "13px 18px", borderRadius: 10, border: "none", background: "#2B2521", color: "#F7F3E8", cursor: "pointer", minHeight: 44 }}
          >
            <Plus size={18} />
            הוסף
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 34, paddingTop: 14 }}>
          {list.groups.map(({ aisle, items }, idx) => (
            <CategoryNote
              key={aisle.id}
              aisle={aisle}
              items={items}
              index={idx}
              onToggleItem={list.toggleItem}
              onRemoveItem={list.removeItem}
              onToggleCategory={list.toggleCategory}
            />
          ))}
        </div>

        {list.checkedCount > 0 && (
          <button
            onClick={list.clearChecked}
            style={{ display: "block", margin: "28px auto 0", border: "none", background: "transparent", color: "#A6544A", cursor: "pointer", textDecoration: "underline" }}
          >
            נקה פריטים שנלקחו ({list.checkedCount})
          </button>
        )}
      </div>
    </div>
  );
}
