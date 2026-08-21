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

/**
 * מפרק שורה חופשית - שיכולה להיות גם משפט טבעי כמו "אני רוצה שתקנה לי חלב וביצים",
 * ולא רק פריט בודד - לרשימת שמות פריטים נפרדים.
 *
 * הרעיון: משתמשים באותה מילת-מפתח שכבר משמשת את categorize, רק הפוך - סורקים את השורה
 * ומחפשים בתוכה מילים ידועות מתוך keywordsMap. מילות "מילוי" כמו "אני"/"רוצה"/"תקנה לי"
 * פשוט לא תואמות שום מילת מפתח ומושמטות, בלי צורך ברשימת stopwords נפרדת.
 *
 * שורות קצרות (פחות משלוש מילים) לא עוברות פירוק בכלל, כדי לא לפגוע בשמות פריטים
 * לגיטימיים דו-מיליים כמו "חזה עוף" (מילת מפתח דו-מילית בעצמה) או "חלב סויה".
 */
export function extractItemNames(
  line: string,
  aisles: Aisle[],
  keywordsMap: KeywordsMap
): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];
  if (trimmed.split(/\s+/).length < 3) return [trimmed];

  const allKeywords = aisles
    .flatMap((aisle) => keywordsMap[aisle.id] ?? [])
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  let scratch = normalizeHebrew(trimmed.toLowerCase());
  const found: { start: number; word: string }[] = [];

  for (const keyword of allKeywords) {
    const normKeyword = normalizeHebrew(keyword.toLowerCase());
    const idx = scratch.indexOf(normKeyword);
    if (idx === -1) continue;

    // מרחיבים את ההתאמה לגבולות המילה המלאה בטקסט המקורי (לא המנורמל) - כדי
    // לשמר את הצורה שהמשתמש הקליד בפועל (למשל "עגבניות" ולא רק "עגבני"),
    // וכדי לתפוס אוטומטית וא"ו חיבור שמחוברת ישירות למילה ("וביצים").
    let start = idx;
    let end = idx + normKeyword.length;
    while (start > 0 && !/\s/.test(trimmed[start - 1])) start--;
    while (end < trimmed.length && !/\s/.test(trimmed[end])) end++;

    let word = trimmed.slice(start, end);
    if (word.length > 2 && word[0] === "ו") word = word.slice(1);
    found.push({ start, word });

    scratch = scratch.slice(0, start) + " ".repeat(end - start) + scratch.slice(end);
  }

  // ממיינים לפי סדר ההופעה המקורי במשפט, לא לפי סדר אורך מילת המפתח שסרקנו בו
  found.sort((a, b) => a.start - b.start);

  return found.length > 0 ? found.map((f) => f.word) : [trimmed];
}
