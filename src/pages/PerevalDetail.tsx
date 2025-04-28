// AlpPass/src/pages/PerevalDetail.tsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadImages } from "../utils/loadImages";
import { ImageData } from "./EditPereval";
import "../index.css";

// 📌 Интерфейс пропсов компонента
interface PerevalDetailProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

// 📌 Интерфейс данных перевала, возвращаемых сервером
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

// 📌 Базовые URL для API и медиафайлов
const BASE_URL = "https://rostislav62.pythonanywhere.com";
const API_URL = `${BASE_URL}/api/submitData/`;
const MEDIA_URL = `${BASE_URL}/media/`;

// 📌 Компонент PerevalDetail для отображения информации о перевале
const PerevalDetail: React.FC<PerevalDetailProps> = ({ darkMode, toggleTheme }) => {
  const { id } = useParams<{ id: string }>();
  const [pereval, setPereval] = useState<PerevalData | null>(null);
  const [images, setImages] = useState<(ImageData | null)[]>([null, null, null]); // 📌 Храним распределённые фотографии
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Подъём" | "Седловина" | "Спуск">("Седловина");
  const [modalImage, setModalImage] = useState<string | null>(null);

  // 📌 Загрузка данных перевала и распределение фотографий
  useEffect(() => {
    const fetchPereval = async () => {
      try {
        console.log(`📥 Запрос данных перевала ID ${id}`);
        const response = await fetch(`${API_URL}${id}/info/`);
        if (!response.ok) {
          throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }
        const data = await response.json();
        console.log("✅ Ответ от сервера:", data);

        // 📌 Распределяем фотографии по слотам (Подъём, Седловина, Спуск) с помощью loadImages
        const loadedImages = loadImages(data.images);
        setImages(loadedImages);
        setPereval(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Ошибка загрузки:", err);
        setError(`Ошибка: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    fetchPereval();
  }, [id]);

  // 📌 Обработчик переключения вкладок (Подъём, Седловина, Спуск)
  const handleTabClick = (tab: "Подъём" | "Седловина" | "Спуск") => {
    console.log(`🔄 Переключение на вкладку: ${tab}`);
    setActiveTab(tab);
  };

  // 📌 Обработчик открытия/закрытия модального окна с увеличенным фото
  const handleImageClick = (imageUrl: string | null) => {
    console.log(imageUrl ? `🔍 Открытие фото: ${imageUrl}` : "🔍 Закрытие модального окна");
    setModalImage(imageUrl);
  };

  // 📌 Отображение загрузки
  if (loading) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>Загрузка...</div>;
  }

  // 📌 Отображение ошибки
  if (error) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>{error}</div>;
  }

  // 📌 Отображение, если перевал не найден
  if (!pereval) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>Перевал не найден</div>;
  }

  // 📌 Форматируем дату добавления перевала
  const formattedDate = new Date(pereval.add_time).toLocaleDateString();

  // 📌 Определяем фотографии для вкладок на основе массива images
  const tabImages = {
    Подъём: images[0]?.preview || null, // 📌 Используем preview из ImageData
    Седловина: images[1]?.preview || null,
    Спуск: images[2]?.preview || null,
  };
  const currentImage = tabImages[activeTab];

  // 📌 JSX для рендеринга страницы
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
      <button className="pereval-more">Подробнее</button>

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