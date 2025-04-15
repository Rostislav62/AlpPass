// AlpPass/src/pages/Submit.tsx

import React, { useState } from "react"; /* Импорт React и хука useState для управления состоянием */
import { useNavigate } from "react-router-dom"; /* Импорт useNavigate для навигации после отправки */
import "../index.css"; /* Импорт глобальных стилей из index.css */

/* Интерфейс пропсов для компонента Submit */
interface SubmitProps {
  darkMode: boolean; /* Пропс для текущей темы (true - тёмная, false - светлая) */
  toggleTheme: () => void; /* Пропс для переключения темы */
}

/* Интерфейс данных формы */
interface FormData {
  beautyTitle: string; /* Название горного массива */
  title: string; /* Название перевала */
  other_titles: string; /* Другие названия */
  coord: { latitude: number; longitude: number; height: number }; /* Координаты */
  difficulties: { season: number; difficulty: number }[]; /* Сложность (сезон и категория) */
  route_description: string; /* Описание маршрута */
}

/* Статичные списки сезонов и сложностей */
const seasons = [
  { id: 1, name: "Весна", code: "Spring" },
  { id: 2, name: "Лето", code: "Summer" },
  { id: 3, name: "Осень", code: "Autumn" },
  { id: 4, name: "Зима", code: "Winter" },
];

const difficulties = [
  { id: 1, code: "1А", description: "Очень простая", characteristics: "Пологие склоны, высота до 3000 м", requirements: "Базовые навыки, обувь для треккинга" },
  { id: 2, code: "1Б", description: "Простая", characteristics: "Крутые склоны, снежники, высота 3000–3500 м", requirements: "Навыки хождения по снегу, треккинговые палки" },
  { id: 3, code: "2А", description: "Средней сложности", characteristics: "Скальные участки, снежные поля, высота 3500–4000 м", requirements: "Верёвки, страховка, базовые навыки альпинизма" },
  { id: 4, code: "2Б", description: "Умеренно сложная", characteristics: "Сложные скалы, лёд, высота 4000–4500 м", requirements: "Кошки, ледоруб, опыт работы с верёвками" },
  { id: 5, code: "3А", description: "Сложная", characteristics: "Ледовые участки, отвесные скалы, высота 4500–5000 м", requirements: "Полный комплект альпинистского снаряжения, опыт" },
  { id: 6, code: "3Б", description: "Очень сложная", characteristics: "Экстремальные условия, высота свыше 5000 м", requirements: "Высокий уровень подготовки, командная работа" },
];

/* Компонент формы отправки нового перевала */
const Submit: React.FC<SubmitProps> = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate(); /* Хук для навигации */
  const [formData, setFormData] = useState<FormData>({ /* Инициализация состояния формы */
    beautyTitle: "",
    title: "",
    other_titles: "",
    coord: { latitude: 0, longitude: 0, height: 0 },
    difficulties: [{ season: 0, difficulty: 0 }],
    route_description: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для ошибок */
  const [showSeasonModal, setShowSeasonModal] = useState(false); /* Состояние для модалки сезона */
  const [showDifficultyModal, setShowDifficultyModal] = useState(false); /* Состояние для модалки сложности */

  const BASE_URL = "https://rostislav62.pythonanywhere.com"; /* Базовый URL API */
  const API_URL = `${BASE_URL}/api/submitData/`; /* URL для отправки данных перевала */

  /* Обработчик изменения текстовых полей */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /* Обработчик изменения координат */
  const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      coord: {
        ...prev.coord,
        [name]: Number(value),
      },
    }));
  };

  /* Обработчик изменения сезона и сложности в модалке */
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value, 10);
    if (isNaN(newValue)) {
      console.error(`Ошибка: ${name} получил невалидное значение "${value}"`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      difficulties: [{ ...prev.difficulties[0], [name]: newValue }],
    }));
  };

  /* Закрытие модалки сезона с сохранением выбора */
  const confirmSeasonModal = () => {
    setShowSeasonModal(false);
  };

  /* Закрытие модалки сложности с сохранением выбора */
  const confirmDifficultyModal = () => {
    setShowDifficultyModal(false);
  };

  /* Получение текста для выбранного сезона */
  const getSeasonText = () => {
    const seasonId = formData.difficulties[0].season;
    const season = seasons.find(s => s.id === seasonId);
    return season ? `${season.name} (${season.code})` : "Выберите сезон";
  };

  /* Получение текста для выбранной сложности */
  const getDifficultyText = () => {
    const difficultyId = formData.difficulties[0].difficulty;
    const difficulty = difficulties.find(d => d.id === difficultyId);
    return difficulty ? `${difficulty.code} - ${difficulty.description}` : "Выберите категорию";
  };

  /* Обработчик отправки формы */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = localStorage.getItem("user_email");
    if (!email) {
      setErrorMessage("❌ Email пользователя не найден. Пожалуйста, войдите.");
      return;
    }

    const submitData = {
      user: { email },
      beautyTitle: formData.beautyTitle,
      title: formData.title,
      other_titles: formData.other_titles,
      coord: formData.coord,
      difficulties: formData.difficulties,
      route_description: formData.route_description,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log("✅ Ответ от сервера (перевал):", data);

      if (response.status === 201 && data.state === 1 && data.id) {
        alert("✅ Перевал успешно добавлен!");
        setErrorMessage(null);
        navigate(`/pereval/${data.id}`);
      } else {
        throw new Error(`Ошибка сервера: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("❌ Ошибка отправки данных:", error);
      setErrorMessage(`❌ ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    }
  };

  return ( /* Начало JSX для рендеринга формы */
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер формы с динамической темой */}
      <h1 className="submit-title">Добавить новый перевал</h1> {/* Заголовок формы */}
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Отображение ошибок */}
      <form onSubmit={handleSubmit} className="submit-form"> {/* Форма с обработчиком отправки */}
        <fieldset className="submit-section"> {/* Секция данных перевала */}
          <legend>Данные перевала</legend>
          <div className="form-group">
            <label htmlFor="beautyTitle">Название горного массива:</label>
            <input
              type="text"
              id="beautyTitle"
              name="beautyTitle"
              value={formData.beautyTitle}
              onChange={handleChange}
              className="submit-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">Название перевала:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="submit-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="other_titles">Другие названия:</label>
            <input
              type="text"
              id="other_titles"
              name="other_titles"
              value={formData.other_titles}
              onChange={handleChange}
              className="submit-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="route_description">Описание маршрута:</label>
            <textarea
              id="route_description"
              name="route_description"
              value={formData.route_description}
              onChange={handleChange}
              className="submit-input"
              rows={3}
            />
          </div>
        </fieldset>

        <fieldset className="submit-section"> {/* Секция координат */}
          <legend>Координаты</legend>
          <div className="form-group">
            <label htmlFor="latitude">Широта:</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.coord.latitude}
              onChange={handleCoordChange}
              className="submit-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Долгота:</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.coord.longitude}
              onChange={handleCoordChange}
              className="submit-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Высота:</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.coord.height}
              onChange={handleCoordChange}
              className="submit-input"
              required
            />
          </div>
        </fieldset>

        <fieldset className="submit-section"> {/* Секция уровня сложности */}
          <legend>Уровень сложности</legend>
          <div className="form-group">
            <label htmlFor="season">Сезон:</label>
            <div
              className="submit-input submit-choice"
              onClick={() => setShowSeasonModal(true)}
            >
              {getSeasonText()} {/* Отображение текущего сезона или плейсхолдера */}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="difficulty">Категория сложности:</label>
            <div
              className="submit-input submit-choice"
              onClick={() => setShowDifficultyModal(true)}
            >
              {getDifficultyText()} {/* Отображение текущей сложности или плейсхолдера */}
            </div>
          </div>
        </fieldset>

        <button type="submit" className="submit-btn">Отправить</button> {/* Кнопка отправки формы */}
      </form>

      {/* Модальное окно для выбора сезона */}
      {showSeasonModal && (
        <div className="modal" onClick={() => setShowSeasonModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Выберите сезон</h2> {/* Заголовок модалки */}
            <div className="radio-container">
              {seasons.map(season => (
                <div key={season.id} className="radio-box">
                  <input
                    type="radio"
                    id={`season-${season.id}`}
                    name="season"
                    value={season.id}
                    checked={formData.difficulties[0].season === season.id}
                    onChange={handleDifficultyChange}
                  />
                  <label htmlFor={`season-${season.id}`}>
                    {season.name} ({season.code})
                  </label>
                </div>
              ))}
            </div>
            <button className="modal-btn" onClick={confirmSeasonModal}>
              Выбрать
            </button> {/* Кнопка подтверждения */}
          </div>
        </div>
      )}

      {/* Модальное окно для выбора сложности */}
      {showDifficultyModal && (
        <div className="modal" onClick={() => setShowDifficultyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Выберите категорию сложности</h2> {/* Заголовок модалки */}
            <div className="radio-container">
              {difficulties.map(diff => (
                <div key={diff.id} className="radio-box">
                  <input
                    type="radio"
                    id={`difficulty-${diff.id}`}
                    name="difficulty"
                    value={diff.id}
                    checked={formData.difficulties[0].difficulty === diff.id}
                    onChange={handleDifficultyChange}
                  />
                  <label htmlFor={`difficulty-${diff.id}`}>
                    {diff.code} - {diff.description}
                  </label>
                </div>
              ))}
            </div>
            <button className="modal-btn" onClick={confirmDifficultyModal}>
              Выбрать
            </button> {/* Кнопка подтверждения */}
          </div>
        </div>
      )}

      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Кнопка переключения темы */}
      </button>
    </div>
  ); /* Конец JSX */
};

export default Submit; /* Экспорт компонента */