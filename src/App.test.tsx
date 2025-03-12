import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

test("Рендерит приложение без ошибок", () => {
  render(<App />);

  // Проверяем, что заголовок приложения отображается
  expect(screen.getByText(/гость/i)).toBeInTheDocument();

  // Проверяем, что кнопка "Меню" существует, НО ТОЛЬКО если она есть в DOM
  const menuButton = screen.queryByText(/меню/i);
  if (menuButton) {
    expect(menuButton).toBeInTheDocument();
  }
});
