// AlpPass/src/pages/Submit.tsx

// Импортируем React и хуки useState для работы с состоянием
import React, { useState } from "react";
// Импортируем useNavigate для перенаправления после отправки формы
import { useNavigate } from "react-router-dom";
// Импортируем стили из файла index.css для оформления
import "../index.css";

// Определяем интерфейс пропсов компонента Submit
interface SubmitProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

// Определяем интерфейс данных формы для отправки на сервер
interface FormData {
  beautyTitle: string;
  title: string;
  other_titles: string;
  connect: boolean;
  user: { email: string; family_name: string; first_name: string; phone: string };
  coord: { latitude: string; longitude: string; height: string };
  status: number;
  difficulties: { season: number; difficulty: number }[];
  route_description: string;
  images: any[];
}

// Основной компонент Submit для добавления нового перевала
const Submit: React.FC<SubmitProps> = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    beautyTitle: "",
    title: "",
    other_titles: "",
    connect: true,
    user: {
      email: localStorage.getItem("user_email") || "",
      family_name: localStorage.getItem("user_family_name") || "",
      first_name: localStorage.getItem("user_first_name") || "",
      phone: localStorage.getItem("user_phone") || "",
    },
    coord: { latitude: "", longitude: "", height: "" },
    status: 1,
    difficulties: [{ season: 0, difficulty: 0 }],
    route_description: "",
    images: [],
  });

  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);

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

  const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Изменение поля ${name}: значение "${value}"`);

    if (["latitude", "longitude", "height"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        coord: { ...prev.coord, [name]: value },
      }));
    } else if (["season", "difficulty"].includes(name)) {
      const newValue = parseInt(value, 10);
      if (isNaN(newValue)) {
        console.error(`Ошибка: ${name} получил невалидное значение "${value}"`);
        return;
      }
      console.log(`Новое значение для ${name}: ${newValue}`);
      setFormData((prev) => ({
        ...prev,
        difficulties: [{ ...prev.difficulties[0], [name]: newValue }],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGetGPS = () => {
    if ("geolocation" in navigator) {
      setLoadingGPS(true);
      setErrorMessage(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coord: {
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
              height: position.coords.altitude ? position.coords.altitude.toFixed(0) : prev.coord.height,
            },
          }));
          setLoadingGPS(false);
          if (!position.coords.altitude) {
            setErrorMessage("⚠️ Высота недоступна на этом устройстве, введите вручную");
          }
        },
        (error) => {
          setErrorMessage(`❌ Ошибка GPS: ${error.message}`);
          setLoadingGPS(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setErrorMessage("❌ Геолокация не поддерживается вашим устройством");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.beautyTitle ||
      !formData.title ||
      !formData.user.email ||
      !formData.user.family_name ||
      !formData.user.first_name ||
      !formData.user.phone ||
      !formData.coord.latitude ||
      !formData.coord.longitude ||
      !formData.coord.height ||
      formData.difficulties[0].season === 0 ||
      formData.difficulties[0].difficulty === 0
    ) {
      setErrorMessage("❌ Все обязательные поля должны быть заполнены!");
      console.log("Текущее состояние formData:", formData);
      return;
    }

    setSubmitStatus("Сохранение перевала...");
    setErrorMessage(null);

    try {
      console.log("📤 Отправка данных перевала на сервер:", formData);
      const perevalResponse = await fetch(`${API_URL}/api/submitData/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const perevalData = await perevalResponse.json();
      console.log("✅ Ответ от сервера (перевал):", perevalData);

      if (!perevalResponse.ok) {
        throw new Error(`Ошибка сервера: ${perevalData.message || JSON.stringify(perevalData)}`);
      }

      const perevalId = perevalData.id;
      localStorage.setItem("last_pereval_id", perevalId);
      setSubmitStatus("✅ Перевал успешно добавлен! Перенаправление...");

      setTimeout(() => navigate(`/add-images/${perevalId}`), 1000);
    } catch (error) {
      console.error("❌ Ошибка отправки данных:", error);
      setErrorMessage(`❌ Ошибка: ${(error as Error).message}`);
      setSubmitStatus(null);
    }
  };

  return (
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <h1 className="submit-title">Добавить новый перевал</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {submitStatus && <p className="submit-status">{submitStatus}</p>}
      <form onSubmit={handleSubmit} className="submit-form">
        <fieldset className="submit-section">
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
            <label htmlFor="title">Официальное название перевала:</label>
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
            <label htmlFor="other_titles">Местное название перевала:</label>
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

        <fieldset className="submit-section">
          <legend>Координаты</legend>
          <div className="form-group">
            <label htmlFor="latitude">Широта:</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.coord.latitude}
              onChange={handleChange}
              className="submit-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Долгота:</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.coord.longitude}
              onChange={handleChange}
              className="submit-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Высота:</label>
            <input
              type="text"
              id="height"
              name="height"
              value={formData.coord.height}
              onChange={handleChange}
              className="submit-input"
              required
            />
          </div>
          <button type="button" onClick={handleGetGPS} disabled={loadingGPS} className="gps-btn">
            {loadingGPS ? "Загрузка..." : "Получить с GPS"}
          </button>
        </fieldset>

        <fieldset className="submit-section">
          <legend>Уровень сложности</legend>
          <div className="form-group radio-group">
            <label>Сезон:</label>
            <div className="radio-container">
              {seasons.map((season) => (
                <div key={season.id} className="radio-box">
                  <input
                    type="radio"
                    id={`season-${season.id}`}
                    name="season"
                    value={season.id}
                    checked={formData.difficulties[0].season === season.id}
                    onChange={handleChange}
                  />
                  <label htmlFor={`season-${season.id}`}>{season.name} ({season.code})</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group radio-group">
            <label>Категория сложности:</label>
            <div className="radio-container">
              {difficulties.map((diff) => (
                <div key={diff.id} className="radio-box">
                  <input
                    type="radio"
                    id={`difficulty-${diff.id}`}
                    name="difficulty"
                    value={diff.id}
                    checked={formData.difficulties[0].difficulty === diff.id}
                    onChange={handleChange}
                  />
                  <label htmlFor={`difficulty-${diff.id}`}>
                    {diff.code} - {diff.description}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        <button type="submit" className="submit-btn">Отправить</button>
      </form>
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

// Экспортируем компонент Submit как default
export default Submit;