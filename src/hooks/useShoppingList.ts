import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Aisle, KeywordsMap, Mode, PersistedState, ShoppingItem } from "../types";
import { categorize, extractItemNames } from "../utils/categorize";

const STORAGE_KEY = "shopping-app-state";

const INITIAL_AISLES: Aisle[] = [
  { id: "produce", num: 1, name: "ירקות ופירות", accent: "#4C7A54", bg: "#EAF2E8", icon: "🥬" },
  { id: "bakery", num: 2, name: "מאפייה ולחם", accent: "#B8863B", bg: "#F7EFDE", icon: "🍞" },
  { id: "dairy", num: 3, name: "מוצרי חלב וביצים", accent: "#5C7C99", bg: "#E9F0F4", icon: "🥛" },
  { id: "meat", num: 4, name: "בשר, עוף ודגים", accent: "#A6544A", bg: "#F6EAE8", icon: "🍖" },
  { id: "pantry", num: 5, name: "מזווה - יבשים ושימורים", accent: "#8B7355", bg: "#F1EBE2", icon: "🥫" },
  { id: "frozen", num: 6, name: "קפואים", accent: "#6A8CAA", bg: "#EAF0F5", icon: "🧊" },
  { id: "drinks", num: 7, name: "משקאות", accent: "#7A9B76", bg: "#EEF4ED", icon: "🥤" },
  { id: "household", num: 8, name: "ניקיון וטואלטיקה", accent: "#7A7267", bg: "#F0EEEA", icon: "🧽" },
  { id: "other", num: 9, name: "שונות", accent: "#9A8F82", bg: "#F3F0EB", icon: "📦" },
];

const INITIAL_KEYWORDS: KeywordsMap = {
  produce: [
    "עגבני","מלפפון","פלפל","גמבה","בצל","שום","תפוח","בננ","ירק","ירקות","פרי","פירות",
    "חסה","גזר","תפוד","אדמה","בטטה","דלעת","לימון","אבוקדו","ענב","תות","אבטיח","מלון",
    "קישוא","חציל","כרוב","ברוקולי","כרובית","פטרוזיליה","כוסבר","נענע","שמיר","אננס",
    "אפרסק","שזיף","מנגו","תפוז","קלמנטינה","אשכולית","רימון","אגס","דובדבן","משמש","תמר",
    "קיווי","פפאיה","ארטישוק","לפת","סלק","סלרי","פטריות","צנון","שעועית","אפונה","תירס","תרד",
  ],
  bakery: ["לחם","פיתה","בגט","חלה","לחמני","קרואסון","עוגה","עוגי","בורקס","מאפ"],
  dairy: ["חלב","גבינה","יוגורט","קוטג","שמנת","חמאה","ביצים","ביצה","לבן","מעדן"],
  meat: ["עוף","בשר","חזה עוף","כרעי","נקניק","המבורגר","סטייק","דג","סלמון","טונה","קציצ","הודו"],
  pantry: ["אורז","פסטה","קמח","סוכר","שמן","קטשופ","מיונז","טחינה","שימור","תבלין","מלח","דבש","קטניות","חומץ"],
  frozen: ["קפוא","גלידה","ארטיק"],
  drinks: ["מים","מיץ","קולה","סודה","בירה","יין","שתיה","משקה"],
  household: ["נייר טואלט","סבון","שמפו","מגבון","אקונומיקה","כביסה","מרכך","דאודורנט","מנקה"],
  other: [],
};

const NEW_CATEGORY_PALETTE = [
  { accent: "#9C6B9E", bg: "#F3E9F4" },
  { accent: "#C97B4A", bg: "#FBEBDD" },
  { accent: "#4A90A4", bg: "#E7F2F4" },
  { accent: "#8A9A5B", bg: "#EFF2E5" },
  { accent: "#B25C6B", bg: "#F7E9EB" },
];

/**
 * מייצר מזהה ייחודי. שימוש ב-crypto.randomUUID (תקני בדפדפנים מודרניים)
 * במקום משתנה מונה גלובלי - כדי שה-hook יהיה נקי מתופעות לוואי מחוץ ל-React
 * (בטוח מול Strict Mode, Hot Module Reload, ורינדור כפול בפיתוח).
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * ה-hook המרכזי של האפליקציה: מרכז את כל ה-state, הלוגיקה העסקית,
 * וההתמדה (persistence) ב-localStorage. קומפוננטות ה-UI רק קוראות
 * ל-actions שהוא מחזיר - הן לא יודעות איך הנתונים נשמרים או מסווגים.
 */
export function useShoppingList() {
  const [mode, setMode] = useState<Mode>("building");
  const [returnMode, setReturnMode] = useState<Mode>("building");
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [aisles, setAisles] = useState<Aisle[]>(INITIAL_AISLES);
  const [keywordsMap, setKeywordsMap] = useState<KeywordsMap>(INITIAL_KEYWORDS);
  const [noteText, setNoteText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const paletteIndex = useRef(0);

  // --- טעינה חד-פעמית מ-localStorage בעליית הקומפוננטה ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: PersistedState = JSON.parse(raw);
        if (data.items) setItems(data.items);
        if (data.aisles) setAisles(data.aisles);
        if (data.keywordsMap) setKeywordsMap(data.keywordsMap);
        if (data.noteText) setNoteText(data.noteText);
        // מסך "ניהול" לא אמור להיות מסך הנחיתה - חוזרים לקנייה/פתק לפי מה שהיה
        if (data.mode === "shopping" || data.mode === "building") {
          setMode(data.mode);
        } else if (data.items && data.items.length > 0) {
          setMode("shopping");
        }
      }
    } catch {
      // localStorage לא זמין (למשל SSR) או נתונים פגומים - מתחילים נקי
    } finally {
      setLoaded(true);
    }
  }, []);

  // --- שמירה בכל שינוי רלוונטי, אחרי שהטעינה הראשונית הסתיימה ---
  useEffect(() => {
    if (!loaded) return;
    const data: PersistedState = { items, aisles, keywordsMap, noteText, mode };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // אפשרי למשל אם המכסה של localStorage מלאה - לא קריטי, ממשיכים
    }
  }, [items, aisles, keywordsMap, noteText, mode, loaded]);

  const openManage = useCallback(() => {
    setReturnMode(mode);
    setMode("manage");
  }, [mode]);

  const closeManage = useCallback(() => setMode(returnMode), [returnMode]);

  const startShopping = useCallback(() => {
    const rawLines = noteText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const names = rawLines.flatMap((line) => extractItemNames(line, aisles, keywordsMap));
    if (names.length === 0) return;
    const newItems: ShoppingItem[] = names.map((name) => ({
      id: generateId(),
      name,
      category: categorize(name, aisles, keywordsMap),
      checked: false,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setNoteText("");
    setMode("shopping");
  }, [noteText, aisles, keywordsMap]);

  const backToNote = useCallback(() => {
    setNoteText(items.map((it) => it.name).join("\n"));
    setItems([]);
    setMode("building");
  }, [items]);

  const addQuickItem = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const names = extractItemNames(trimmed, aisles, keywordsMap);
      setItems((prev) => [
        ...prev,
        ...names.map((n) => ({ id: generateId(), name: n, category: categorize(n, aisles, keywordsMap), checked: false })),
      ]);
    },
    [aisles, keywordsMap]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  }, []);

  const toggleCategory = useCallback((aisleId: string) => {
    setItems((prev) => {
      const inCategory = prev.filter((it) => it.category === aisleId);
      const allChecked = inCategory.length > 0 && inCategory.every((it) => it.checked);
      return prev.map((it) => (it.category === aisleId ? { ...it, checked: !allChecked } : it));
    });
  }, []);

  const changeItemCategory = useCallback((id: string, category: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, category } : it)));
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((it) => !it.checked));
  }, []);

  const addKeyword = useCallback((aisleId: string, word: string) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    setKeywordsMap((prev) => ({ ...prev, [aisleId]: [...(prev[aisleId] ?? []), trimmed] }));
  }, []);

  const removeKeyword = useCallback((aisleId: string, word: string) => {
    setKeywordsMap((prev) => ({ ...prev, [aisleId]: (prev[aisleId] ?? []).filter((w) => w !== word) }));
  }, []);

  const createCategory = useCallback(
    (name: string): string | null => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const palette = NEW_CATEGORY_PALETTE[paletteIndex.current % NEW_CATEGORY_PALETTE.length];
      paletteIndex.current += 1;
      const id = generateId();
      const newAisle: Aisle = { id, num: aisles.length + 1, name: trimmed, accent: palette.accent, bg: palette.bg, icon: "🏷️" };
      setAisles((prev) => [...prev, newAisle]);
      setKeywordsMap((prev) => ({ ...prev, [id]: [] }));
      return id;
    },
    [aisles.length]
  );

  const createCategoryForItem = useCallback(
    (itemId: string, categoryName: string, seedKeyword: string) => {
      const newId = createCategory(categoryName);
      if (!newId) return;
      changeItemCategory(itemId, newId);
      addKeyword(newId, seedKeyword);
    },
    [createCategory, changeItemCategory, addKeyword]
  );

  // --- ערכים נגזרים - מחושבים מחדש מ-items/aisles, לא state נפרד ---
  const totalCount = items.length;
  const checkedCount = useMemo(() => items.filter((it) => it.checked).length, [items]);
  const progress = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  const groups = useMemo(
    () =>
      aisles
        .map((aisle) => ({ aisle, items: items.filter((it) => it.category === aisle.id) }))
        .filter((g) => g.items.length > 0),
    [aisles, items]
  );

  const unmatchedItems = useMemo(() => items.filter((it) => it.category === "other"), [items]);

  return {
    // state
    mode,
    items,
    aisles,
    keywordsMap,
    noteText,
    loaded,
    // derived
    totalCount,
    checkedCount,
    progress,
    groups,
    unmatchedItems,
    // actions
    setNoteText,
    openManage,
    closeManage,
    startShopping,
    backToNote,
    addQuickItem,
    removeItem,
    toggleItem,
    toggleCategory,
    changeItemCategory,
    clearChecked,
    addKeyword,
    removeKeyword,
    createCategory,
    createCategoryForItem,
  };
}
