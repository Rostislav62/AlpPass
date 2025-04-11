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
  const [activeTab, setActiveTab] = useState<"ascent" | "saddle" | "descent">("saddle");

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
  }, [id, API_URL]);

  if (loading) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>Загрузка...</div>;
  }

  if (error) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>{error}</div>;
  }

  if (!pereval) {
    return <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>Перевал не найден</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getImageForTab = () => {
    if (activeTab === "ascent") return pereval.images[0]?.data || "";
    if (activeTab === "saddle") return pereval.images[1]?.data || "";
    if (activeTab === "descent") return pereval.images[2]?.data || "";
    return "";
  };

  return (
    <div className={`pereval-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="pereval-header">
        <span className="pereval-title">
          Пер. {pereval.title} &nbsp;&nbsp; {pereval.difficulties[0]?.difficulty.code} &nbsp;&nbsp; {pereval.coord.height}м
        </span>
        <span className="pereval-dropdown">▼</span>
      </div>
      <div className="pereval-date">{formatDate(pereval.add_time)}</div>
      <hr className="pereval-divider" />
      <div className="pereval-tabs">
        <button
          className={`pereval-tab ${activeTab === "ascent" ? "active" : ""}`}
          onClick={() => setActiveTab("ascent")}
        >
          Подъём
        </button>
        <button
          className={`pereval-tab ${activeTab === "saddle" ? "active" : ""}`}
          onClick={() => setActiveTab("saddle")}
        >
          Седловина
        </button>
        <button
          className={`pereval-tab ${activeTab === "descent" ? "active" : ""}`}
          onClick={() => setActiveTab("descent")}
        >
          Спуск
        </button>
      </div>
      <div className="photo-box">
        <img src={getImageForTab()} alt={activeTab} className="pereval-photo" />
        <div className="photo-overlay">
          <span className="direction-icon">↑</span>
          <span className="zoom-icon">↔</span>
          <span className="coords">
            {pereval.coord.latitude} {pereval.coord.longitude}
          </span>
        </div>
      </div>
      <p className="pereval-description">{pereval.route_description || "Описание отсутствует"}</p>
      <span className="pereval-more">Подробнее</span>
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default PerevalDetail;