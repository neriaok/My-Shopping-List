/**
 * טיפוסי הליבה של האפליקציה.
 * שמורים בקובץ נפרד כדי שכל שכבה (hook, קומפוננטות, utils)
 * תוכל לייבא אותם בלי תלות מעגלית.
 */

export interface Aisle {
  id: string;
  /** מיקום המעבר בסדר ההליכה בסופר - מהכניסה ועד הקופה */
  num: number;
  name: string;
  /** צבע הדגשה (טקסט, מסגרות, סמנים) */
  accent: string;
  /** צבע רקע פסטלי לפתק */
  bg: string;
  /** אימוג'י ייצוגי לקטגוריה */
  icon: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  /** מזהה של Aisle, או "other" אם לא זוהה */
  category: string;
  checked: boolean;
}

/** ממפה מזהה קטגוריה -> מערך מילות מפתח לזיהוי אוטומטי */
export type KeywordsMap = Record<string, string[]>;

export type Mode = "building" | "shopping" | "manage";

export interface PersistedState {
  items: ShoppingItem[];
  aisles: Aisle[];
  keywordsMap: KeywordsMap;
  noteText: string;
}
