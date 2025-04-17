// AlpPass/src/pages/EditPereval.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

interface EditPerevalProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

interface PerevalData {
  beautyTitle: string;
  title: string;
  other_titles: string;
  coord: { latitude: number; longitude: number; height: number };
  user: { email: string; phone: string };
  status: number;
  route_description: string;
  difficulties: { season: number; difficulty: number }[];
}

const BASE_URL = "https://rostislav62.pythonanywhere.com";
const API_URL = `${BASE_URL}/api/submitData/`;

const EditPereval: React.FC<EditPerevalProps> = ({ darkMode, toggleTheme }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PerevalData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userEmail = localStorage.getItem("user_email") || "";
  const userPhone = localStorage.getItem("user_phone") || "";

  // Списки сезонов и сложностей
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

  useEffect(() => {
    if (!id) {
      console.error("❌ Ошибка: ID перевала отсутствует!");
      alert("Ошибка: невозможно загрузить перевал без ID.");
      return;
    }

    // Загрузка данных перевала
    fetch(`${API_URL}${id}/info/`)
      .then(async response => {
        const text = await response.text();
        console.log("📥 Ответ от сервера (перевал):", text);
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error("❌ Ошибка парсинга JSON:", text);
          throw new Error("Сервер вернул не JSON-ответ");
        }
      })
      .then((data: PerevalData) => {
        if (
          data.status === 1 &&
          data.user.email.trim().toLowerCase() === userEmail.trim().toLowerCase() &&
          data.user.phone.replace(/\s+/g, "") === userPhone.replace(/\s+/g, "")
        ) {
          // Инициализация difficulties, если пусто
          setFormData({
            ...data,
            difficulties: data.difficulties.length > 0 ? data.difficulties : [{ season: 0, difficulty: 0 }],
          });
        } else {
          alert("Редактирование запрещено! Либо статус не new, либо данные пользователя не совпадают.");
        }
      })
      .catch(error => console.error("Ошибка загрузки перевала:", error));
  }, [id, userEmail, userPhone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...(prev as PerevalData),
      [name]: value,
    }));
  };

  const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coord: {
          ...prev.coord,
          [name]: Number(value),
        },
      };
    });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const newValue = parseInt(value, 10);
    if (isNaN(newValue)) {
      console.error(`Ошибка: ${name} получил невалидное значение "${value}"`);
      return;
    }
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        difficulties: [{ ...prev.difficulties[0], [name]: newValue }],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const email = localStorage.getItem("user_email");
    if (!email) {
      setErrorMessage("❌ Email пользователя не найден. Пожалуйста, войдите.");
      return;
    }

    const updatedData = {
      email,
      beautyTitle: formData.beautyTitle,
      title: formData.title,
      other_titles: formData.other_titles,
      coord: formData.coord,
      route_description: formData.route_description,
      difficulties: formData.difficulties,
    };

    try {
      const response = await fetch(`${API_URL}${id}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (response.status === 200 && data.state === 1) {
        alert("✅ Перевал успешно обновлён!");
        setErrorMessage(null);
      } else if (response.status === 400) {
        setErrorMessage(`❌ ${data.message || "Обновление запрещено: статус не new"}`);
      } else if (response.status === 403) {
        setErrorMessage(`❌ ${data.message || "У вас нет прав на редактирование этого перевала"}`);
      } else if (response.status === 404) {
        setErrorMessage(`❌ ${data.message || "Перевал не найден"}`);
      } else {
        throw new Error("Неизвестная ошибка при обновлении");
      }
    } catch (error) {
      console.error("❌ Ошибка при редактировании:", error);
      setErrorMessage("❌ Ошибка при редактировании перевала");
    }
  };

  if (!formData) return <p className="loading-text">Загрузка...</p>;

  return (
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <h1 className="submit-title">Редактировать перевал</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="submit-form">
        <fieldset className="submit-section">
          <legend>Данные перевала</legend>
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
            <label htmlFor="route_description">Описание маршрута:</label>
            <textarea
              id="route_description"
              name="route_description"
              value={formData.route_description || ""}
              onChange={handleChange}
              className="submit-input"
              rows={3}
            />
          </div>
        </fieldset>

        <fieldset className="submit-section">
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

        <fieldset className="submit-section">
          <legend>Уровень сложности</legend>
          <div className="form-group radio-group">
            <label>Сезон:</label>
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
                  <label htmlFor={`season-${season.id}`}>{season.name} ({season.code})</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group radio-group">
            <label>Категория сложности:</label>
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
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => navigate(`/edit-photos/${id}`)}
          className="submit-btn"
        >
          Редактировать фотографии
        </button>

        <button type="submit" className="submit-btn">Сохранить изменения</button>
      </form>
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default EditPereval;