// AlpPass/src/pages/PerevalDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

interface PerevalDetailProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

interface PerevalData {
  id: number;
  beautyTitle: string;
  title: string;
  other_titles: string;
  connect: boolean;
  add_time: string;
  user: {
    id: number;
    family_name: string;
    first_name: string;
    father_name: string;
    phone: string;
    email: string;
  };
  coord: {
    id: number;
    latitude: number;
    longitude: number;
    height: number;
  };
  status: number;
  difficulties: {
    season: { code: string; name: string };
    difficulty: { code: string; description: string; characteristics: string; requirements: string };
  }[];
  images: { id: number; data: string; title: string }[];
  route_description: string;
}

const PerevalDetail: React.FC<PerevalDetailProps> = ({ darkMode, toggleTheme }) => {
  const { id } = useParams<{ id: string }>(); // Получаем ID перевала из URL
  const navigate = useNavigate();
  const [pereval, setPereval] = useState<PerevalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com";

  useEffect(() => {
    const fetchPereval = async () => {
      try {
        const response = await fetch(`${API_URL}/api/submitData/${id}/info/`);
        if (!response.ok) {
          throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }
        const data = await response.json();
        setPereval(data);
        setLoading(false);
      } catch (err) {
        setError(`Ошибка: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    fetchPereval();
  }, [id, API_URL]); // Добавляем API_URL в зависимости

  if (loading) {
    return <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>Загрузка...</div>;
  }

  if (error) {
    return <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>{error}</div>;
  }

  if (!pereval) {
    return <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>Перевал не найден</div>;
  }

  return (
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <h1 className="submit-title">{pereval.title}</h1>
      <button onClick={() => navigate("/submit")} className="theme-btn">Назад</button>

      <fieldset className="submit-section">
        <legend>Данные перевала</legend>
        <div className="form-group">
          <label>Название массива:</label>
          <p>{pereval.beautyTitle}</p>
        </div>
        <div className="form-group">
          <label>Официальное название:</label>
          <p>{pereval.title}</p>
        </div>
        <div className="form-group">
          <label>Местное название:</label>
          <p>{pereval.other_titles || "Не указано"}</p>
        </div>
        <div className="form-group">
          <label>Связь:</label>
          <p>{pereval.connect ? "Да" : "Нет"}</p>
        </div>
        <div className="form-group">
          <label>Дата добавления:</label>
          <p>{new Date(pereval.add_time).toLocaleString()}</p>
        </div>
        <div className="form-group">
          <label>Описание маршрута:</label>
          <p>{pereval.route_description || "Не указано"}</p>
        </div>
      </fieldset>

      <fieldset className="submit-section">
        <legend>Пользователь</legend>
        <div className="form-group">
          <label>Фамилия:</label>
          <p>{pereval.user.family_name}</p>
        </div>
        <div className="form-group">
          <label>Имя:</label>
          <p>{pereval.user.first_name}</p>
        </div>
        <div className="form-group">
          <label>Отчество:</label>
          <p>{pereval.user.father_name || "Не указано"}</p>
        </div>
        <div className="form-group">
          <label>Телефон:</label>
          <p>{pereval.user.phone}</p>
        </div>
        <div className="form-group">
          <label>Email:</label>
          <p>{pereval.user.email}</p>
        </div>
      </fieldset>

      <fieldset className="submit-section">
        <legend>Координаты</legend>
        <div className="form-group">
          <label>Широта:</label>
          <p>{pereval.coord.latitude}</p>
        </div>
        <div className="form-group">
          <label>Долгота:</label>
          <p>{pereval.coord.longitude}</p>
        </div>
        <div className="form-group">
          <label>Высота:</label>
          <p>{pereval.coord.height} м</p>
        </div>
      </fieldset>

      <fieldset className="submit-section">
        <legend>Сложности</legend>
        {pereval.difficulties.length > 0 ? (
          pereval.difficulties.map((diff, index) => (
            <div key={index} className="form-group">
              <p><strong>Сезон:</strong> {diff.season.name} ({diff.season.code})</p>
              <p><strong>Сложность:</strong> {diff.difficulty.code} - {diff.difficulty.description}</p>
              <p><strong>Характеристики:</strong> {diff.difficulty.characteristics}</p>
              <p><strong>Требования:</strong> {diff.difficulty.requirements}</p>
            </div>
          ))
        ) : (
          <p>Данные о сложностях отсутствуют</p>
        )}
      </fieldset>

      <fieldset className="submit-section">
        <legend>Изображения</legend>
        <div className="photos-list">
          {pereval.images.length > 0 ? (
            pereval.images.map((img) => (
              <div key={img.id} className="photo-item">
                <img src={img.data} alt={img.title} className="photo-preview" />
                <p>{img.title}</p>
              </div>
            ))
          ) : (
            <p>Изображения отсутствуют</p>
          )}
        </div>
      </fieldset>

      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default PerevalDetail;