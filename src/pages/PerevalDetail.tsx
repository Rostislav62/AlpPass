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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pereval, setPereval] = useState<PerevalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Подъём" | "Седловина" | "Спуск">("Седловина");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com";

  // Загрузка данных перевала
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
  }, [id, API_URL]);

  // Обработчик переключения вкладок
  const handleTabClick = (tab: "Подъём" | "Седловина" | "Спуск") => {
    setActiveTab(tab);
  };

  // Обработчик открытия/закрытия модального окна
  const handleImageClick = (imageUrl: string | null) => {
    setModalImage(imageUrl);
  };

  if (loading) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>Загрузка...</div>;
  }

  if (error) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>{error}</div>;
  }

  if (!pereval) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>Перевал не найден</div>;
  }

  // Форматирование даты в локальный формат
  const formattedDate = new Date(pereval.add_time).toLocaleDateString();

  // Определение фотографии для текущей вкладки
  const tabImages = {
    Подъём: pereval.images[0]?.data || null,
    Седловина: pereval.images[1]?.data || null,
    Спуск: pereval.images[2]?.data || null,
  };
  const currentImage = tabImages[activeTab];

  return (
    <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Заголовок */}
      <div className="pereval-header">
        <div className="pereval-title">
          <span className="pereval-name">пер. {pereval.title}</span>
          <span className="pereval-difficulty">{pereval.difficulties[0]?.difficulty.code || "Не указано"}</span>
          <span className="pereval-height">{pereval.coord.height}м</span>
        </div>
        <p className="pereval-date">{formattedDate}</p>
      </div>

      {/* Разделительная линия */}
      <hr className="pereval-divider" />

      {/* Вкладки */}
      <div className="pereval-tabs">
        <button
          className={`pereval-tab ${activeTab === "Подъём" ? "active" : ""}`}
          onClick={() => handleTabClick("Подъём")}
        >
          Подъём
        </button>
        <button
          className={`pereval-tab ${activeTab === "Седловина" ? "active" : ""}`}
          onClick={() => handleTabClick("Седловина")}
        >
          Седловина
        </button>
        <button
          className={`pereval-tab ${activeTab === "Спуск" ? "active" : ""}`}
          onClick={() => handleTabClick("Спуск")}
        >
          Спуск
        </button>
      </div>

      {/* Фото */}
      <div className="pereval-photo-container">
        {currentImage ? (
          <div className="pereval-photo">
            <img src={currentImage} alt={activeTab} className="pereval-image" />
            <span className="pereval-coordinates">
              {pereval.coord.latitude}, {pereval.coord.longitude}
            </span>
            <div className="pereval-zoom" onClick={() => handleImageClick(currentImage)}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="10" r="6" stroke="#fff" strokeWidth="2" />
                <path d="M10 7v6m-3 3h6" stroke="#fff" strokeWidth="2" />
                <path d="M14.5 14.5L20 20" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="pereval-photo-empty">
            <span>Нет фото</span>
          </div>
        )}
      </div>

      {/* Описание */}
      <p className="pereval-description">
        {pereval.route_description || "Описание отсутствует"}
      </p>

      {/* Подробнее */}
      <a href="#" className="pereval-more" onClick={(e) => e.preventDefault()}>
        Подробнее
      </a>

      {/* Кнопка темы */}
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>

      {/* Модальное окно */}
      {modalImage && (
        <div className="pereval-modal" onClick={() => handleImageClick(null)}>
          <img src={modalImage} alt="Увеличенное фото" className="pereval-modal-image" />
        </div>
      )}
    </div>
  );
};

export default PerevalDetail;