import { TextEncoder, TextDecoder } from "node:util";

// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// 🔹 Мокаем localStorage для тестов
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => store[key] = value,
    removeItem: (key: string) => delete store[key],
    clear: () => store = {}
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock
});
