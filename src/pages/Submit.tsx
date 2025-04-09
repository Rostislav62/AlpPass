// AlpPass/src/pages/Submit.tsx
// Создаёт новый перевал.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

interface SubmitProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

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
    difficulties: [{ season: 1, difficulty: 1 }],
    route_description: "",
    images: [],
  });
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (["latitude", "longitude", "height"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        coord: { ...prev.coord, [name]: value },
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
      !formData.coord.height
    ) {
      console.error("❌ Ошибка: Все обязательные поля должны быть заполнены!");
      setErrorMessage("❌ Все обязательные поля должны быть заполнены! Проверьте данные в localStorage.");
      return;
    }

    setSubmitStatus("Сохранение перевала...");
    setErrorMessage(null);

    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"; // Перенесли сюда
    try {
      console.log("📤 Отправка данных перевала на сервер:", formData);
      console.log("Отправляемые данные:", JSON.stringify(formData, null, 2));
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
          <button
            type="button"
            onClick={handleGetGPS}
            disabled={loadingGPS}
            className="gps-btn"
          >
            {loadingGPS ? "Загрузка..." : "Получить с GPS"}
          </button>
        </fieldset>

        <button type="submit" className="submit-btn">Отправить</button>
      </form>
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default Submit;