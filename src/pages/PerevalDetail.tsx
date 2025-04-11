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
    return <div className={`loading ${darkMode ? "dark-mode" : "light-mode"}`}>Загрузка...</div>;
  }

  if (error) {
    return <div className={`error ${darkMode ? "dark-mode" : "light-mode"}`}>{error}</div>;
  }

  if (!pereval) {
    return <div className={`error ${darkMode ? "dark-mode" : "light-mode"}`}>Перевал не найден</div>;
  }

  return (
    <div className={`pereval-detail-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <h1 className="pereval-detail-title">{pereval.title}</h1>
      <button onClick={() => navigate("/submit")} className="back-btn">Назад</button>

      <fieldset className="pereval-section">
        <legend>Данные перевала</legend>
        <p><strong>Название массива:</strong> {pereval.beautyTitle}</p>
        <p><strong>Официальное название:</strong> {pereval.title}</p>
        <p><strong>Местное название:</strong> {pereval.other_titles || "Не указано"}</p>
        <p><strong>Связь:</strong> {pereval.connect ? "Да" : "Нет"}</p>
        <p><strong>Дата добавления:</strong> {new Date(pereval.add_time).toLocaleString()}</p>
        <p><strong>Описание маршрута:</strong> {pereval.route_description || "Не указано"}</p>
      </fieldset>

      <fieldset className="pereval-section">
        <legend>Пользователь</legend>
        <p><strong>Фамилия:</strong> {pereval.user.family_name}</p>
        <p><strong>Имя:</strong> {pereval.user.first_name}</p>
        <p><strong>Отчество:</strong> {pereval.user.father_name || "Не указано"}</p>
        <p><strong>Телефон:</strong> {pereval.user.phone}</p>
        <p><strong>Email:</strong> {pereval.user.email}</p>
      </fieldset>

      <fieldset className="pereval-section">
        <legend>Координаты</legend>
        <p><strong>Широта:</strong> {pereval.coord.latitude}</p>
        <p><strong>Долгота:</strong> {pereval.coord.longitude}</p>
        <p><strong>Высота:</strong> {pereval.coord.height} м</p>
      </fieldset>

      <fieldset className="pereval-section">
        <legend>Сложности</legend>
        {pereval.difficulties.length > 0 ? (
          pereval.difficulties.map((diff, index) => (
            <div key={index}>
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

      <fieldset className="pereval-section">
        <legend>Изображения</legend>
        {pereval.images.length > 0 ? (
          pereval.images.map((img) => (
            <div key={img.id} className="image-item">
              <img src={img.data} alt={img.title} className="pereval-image" />
              <p>{img.title}</p>
            </div>
          ))
        ) : (
          <p>Изображения отсутствуют</p>
        )}
      </fieldset>

      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default PerevalDetail;