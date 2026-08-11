import { describe, it, expect } from "vitest";
import { categorize, normalizeHebrew } from "./categorize";
import type { Aisle, KeywordsMap } from "../types";

const aisles: Aisle[] = [
  { id: "produce", num: 1, name: "ירקות ופירות", accent: "#4C7A54", bg: "#EAF2E8", icon: "🥬" },
  { id: "dairy", num: 2, name: "מוצרי חלב", accent: "#5C7C99", bg: "#E9F0F4", icon: "🥛" },
  { id: "other", num: 3, name: "שונות", accent: "#9A8F82", bg: "#F3F0EB", icon: "📦" },
];

const keywordsMap: KeywordsMap = {
  produce: ["מלפפון", "עגבני", "גזר"],
  dairy: ["חלב", "גבינה"],
  other: [],
};

describe("normalizeHebrew", () => {
  it("ממיר אותיות סופיות (ן,ם,ך,ף,ץ) לצורתן הרגילה", () => {
    expect(normalizeHebrew("מלפפון")).toBe("מלפפונ"); // ן -> נ
    expect(normalizeHebrew("שלום")).toBe("שלומ"); // ם -> מ
  });

  it("לא נוגע במילים בלי אותיות סופיות", () => {
    expect(normalizeHebrew("גזר")).toBe("גזר");
  });
});

describe("categorize", () => {
  it("מזהה פריט ביחיד", () => {
    expect(categorize("מלפפון", aisles, keywordsMap)).toBe("produce");
  });

  it("מזהה פריט ברבים, למרות שינוי האות הסופית", () => {
    // זה בדיוק הבאג שתוקן: "מלפפון" (נ' סופית) בתוך "מלפפונים" (נ' רגילה)
    expect(categorize("מלפפונים", aisles, keywordsMap)).toBe("produce");
  });

  it("לא תלוי ברווחים מיותרים או אותיות גדולות/קטנות", () => {
    expect(categorize("  עגבניות  ", aisles, keywordsMap)).toBe("produce");
  });

  it("מחזיר other כשאין התאמה", () => {
    expect(categorize("טיטולים", aisles, keywordsMap)).toBe("other");
  });

  it("מכבד את סדר הקטגוריות - הראשונה שמתאימה זוכה", () => {
    const ambiguousKeywords: KeywordsMap = {
      produce: ["חלב"], // מכוון בכוונה כדי לבדוק סדר עדיפויות
      dairy: ["חלב"],
      other: [],
    };
    expect(categorize("חלב", aisles, ambiguousKeywords)).toBe("produce");
  });
});
