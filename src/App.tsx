import { useState } from "react";
import { ArrowRight, Plus, Settings, ShoppingBasket } from "lucide-react";
import { useShoppingList } from "./hooks/useShoppingList";
import { ShoppingNote } from "./components/ShoppingNote";
import { CategoryNote } from "./components/CategoryNote";
import { ManagePanel } from "./components/ManagePanel";
import { ProgressBar } from "./components/ProgressBar";
import styles from "./App.module.css";

export default function App() {
  const list = useShoppingList();
  const [quickAdd, setQuickAdd] = useState("");

  if (!list.loaded) {
    return (
      <div dir="rtl" className={styles.page} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9A8F82", fontSize: 14 }}>טוען את הרשימה שלך...</div>
      </div>
    );
  }

  const gearButton = (
    <button className={styles.gearButton} onClick={list.openManage} aria-label="ניהול קטגוריות">
      <Settings size={17} />
    </button>
  );

  if (list.mode === "manage") {
    return (
      <div dir="rtl" className={styles.page} style={{ background: "var(--color-bg-manage)" }}>
        <div className={styles.inner}>
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
      <div dir="rtl" className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <ShoppingBasket size={26} color="#4C7A54" />
            <h1 className={styles.title}>רשימת קניות</h1>
            {gearButton}
          </div>
          <p className={styles.subtitle}>תרשום פריט בכל שורה, בכל סדר שבא לך - נסדר לפי מעברים כשתלחץ למטה</p>
          <ShoppingNote noteText={list.noteText} onChange={list.setNoteText} onStart={list.startShopping} />
        </div>
      </div>
    );
  }

  // mode === "shopping"
  return (
    <div dir="rtl" className={styles.page}>
      <div className={styles.innerWide}>
        <button className={styles.backLink} onClick={list.backToNote}>
          <ArrowRight size={15} />
          חזרה לפתק
        </button>

        <div className={styles.header}>
          <ShoppingBasket size={26} color="#4C7A54" />
          <h1 className={styles.titleShopping}>בקנייה</h1>
          {gearButton}
        </div>
        <p className={styles.subtitle}>כל קטגוריה בפתק משלה - סמן פריט בודד, או את כל הקטגוריה בבת אחת</p>

        {list.unmatchedItems.length > 0 && (
          <div className={styles.unmatchedBanner} onClick={list.openManage}>
            ⚠️ {list.unmatchedItems.length} פריטים לא זוהו אוטומטית - לחץ כדי לשבץ אותם לקטגוריה
          </div>
        )}

        <ProgressBar checkedCount={list.checkedCount} totalCount={list.totalCount} progress={list.progress} />

        <div className={styles.quickAddRow}>
          <input
            className={styles.quickAddInput}
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                list.addQuickItem(quickAdd);
                setQuickAdd("");
              }
            }}
            placeholder="שכחת משהו? הוסף כאן"
          />
          <button
            className={styles.quickAddButton}
            onClick={() => {
              list.addQuickItem(quickAdd);
              setQuickAdd("");
            }}
          >
            <Plus size={18} />
            הוסף
          </button>
        </div>

        <div className={styles.notesGrid}>
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
          <button className={styles.clearButton} onClick={list.clearChecked}>
            נקה פריטים שנלקחו ({list.checkedCount})
          </button>
        )}
      </div>
    </div>
  );
}