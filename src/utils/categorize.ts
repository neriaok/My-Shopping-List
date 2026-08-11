import type { Aisle, KeywordsMap } from "../types";

/**
 * מנרמל אותיות עבריות סופיות (ן/נ, ם/מ, ך/כ, ף/פ, ץ/צ) לצורתן הרגילה.
 *
 * למה זה נחוץ: "מלפפון" ביחיד מסתיים ב-נ' סופית (ן, U+05DF), אבל "מלפפונים"
 * ברבים מכיל נ' רגילה (נ, U+05E0) - שני תווי יוניקוד שונים. בלי הנירמול הזה,
 * String.includes לא היה מזהה את הצורה המורחבת (ריבוי, סמיכות וכו').
 */
export function normalizeHebrew(str: string): string {
  return str
    .replace(/ך/g, "כ")
    .replace(/ם/g, "מ")
    .replace(/ן/g, "נ")
    .replace(/ף/g, "פ")
    .replace(/ץ/g, "צ");
}

/**
 * מסווג שם פריט לקטגוריה, לפי חיפוש מילת מפתח כתת-מחרוזת (case/סופיות-insensitive).
 * פונקציה טהורה: אותה קלט תמיד מייצר אותה תוצאה, קל לבדוק ביחידה.
 *
 * @returns מזהה הקטגוריה הראשונה שמתאימה, או "other" אם לא נמצאה התאמה
 */
export function categorize(
  name: string,
  aisles: Aisle[],
  keywordsMap: KeywordsMap
): string {
  const clean = normalizeHebrew(name.trim().toLowerCase());

  for (const aisle of aisles) {
    const words = keywordsMap[aisle.id];
    if (!words || words.length === 0) continue;
    if (words.some((word) => clean.includes(normalizeHebrew(word)))) {
      return aisle.id;
    }
  }

  return "other";
}
