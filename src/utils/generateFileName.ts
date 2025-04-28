import { transliterate } from "transliteration";

export const generateFileName = (index: number, perevalTitle: string, file: File): string => {
  const prefix = `${index + 1}_`;
  const uniqueId = Math.random().toString(36).substring(2, 12);
  const transliteratedTitle = transliterate(perevalTitle.toLowerCase()).replace(/[^a-z0-9]/g, "");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return `${prefix}${uniqueId}_${transliteratedTitle}.${extension}`;
};