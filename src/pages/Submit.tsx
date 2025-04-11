// AlpPass/src/pages/Submit.tsx

// Импортируем React и хуки useState, useEffect для работы с состоянием и эффектами
import React, { useState, useEffect } from "react";
// Импортируем useNavigate для перенаправления после отправки формы
import { useNavigate } from "react-router-dom";
// Импортируем стили из файла index.css для оформления
import "../index.css";

// Определяем интерфейс пропсов компонента Submit
interface SubmitProps {
  darkMode: boolean; // Флаг тёмной темы
  toggleTheme: () => void; // Функция переключения темы
}

// Определяем интерфейс данных формы для отправки на сервер
interface FormData {
  beautyTitle: string; // Название горного массива
  title: string; // Официальное название перевала
  other_titles: string; // Местное название перевала
  connect: boolean; // Флаг связи (true/false)
  user: { email: string; family_name: string; first_name: string; phone: string }; // Данные пользователя
  coord: { latitude: string; longitude: string; height: string }; // Координаты перевала
  status: number; // Статус перевала (например, 1 для "new")
  difficulties: { season: number; difficulty: number }[]; // Сложности (ID сезона и категории)
  route_description: string; // Описание маршрута
  images: any[]; // Массив изображений (пока пустой)
}

// Определяем интерфейс сезона для выпадающего списка
interface Season {
  id: number; // ID сезона
  code: string; // Код сезона (например, "spring")
  name: string; // Название сезона (например, "Весна")
}

// Определяем интерфейс категории сложности для выпадающего списка
interface Difficulty {
  id: number; // ID категории
  code: string; // Код категории (например, "1Б")
  description: string; // Описание (например, "Простая")
  characteristics: string; // Характеристики (например, "Крутые склоны...")
  requirements: string; // Требования (например, "Навыки хождения...")
}

// Основной компонент Submit для добавления нового перевала
const Submit: React.FC<SubmitProps> = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();

  // Состояние для данных формы
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
    difficulties: [{ season: 0, difficulty: 0 }], // Начальные значения 0 для сезона и сложности
    route_description: "",
    images: [],
  });

  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com";

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        console.log("Запрос сезонов: начало");
        const response = await fetch(`${API_URL}/api/seasons/`);
        console.log("Запрос сезонов: статус", response.status);
        if (!response.ok) {
          throw new Error(`Ошибка запроса сезонов: ${response.status}`);
        }
        const data = await response.json();
        console.log("Полученные сезоны:", data);
        setSeasons(data);
      } catch (error) {
        console.error("Ошибка загрузки сезонов:", error);
      }
    };

    const fetchDifficulties = async () => {
      try {
        console.log("Запрос сложностей: начало");
        const response = await fetch(`${API_URL}/api/difficulty-levels/`);
        console.log("Запрос сложностей: статус", response.status);
        if (!response.ok) {
          throw new Error(`Ошибка запроса сложностей: ${response.status}`);
        }
        const data = await response.json();
        console.log("Полученные сложности:", data);
        setDifficulties(data);
      } catch (error) {
        console.error("Ошибка загрузки сложностей:", error);
      }
    };

    fetchSeasons();
    fetchDifficulties();
  }, [API_URL]);

  // Обработчик изменения значений в полях формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target; // Извлекаем имя и значение поля
    console.log(`Изменение поля ${name}: значение ${value}`); // Логируем изменение для отладки

    if (["latitude", "longitude", "height"].includes(name)) {
      // Если поле относится к координатам, обновляем coord
      setFormData((prev) => ({
        ...prev,
        coord: { ...prev.coord, [name]: value },
      }));
    } else if (["season", "difficulty"].includes(name)) {
      // Если поле относится к сложности, обновляем difficulties
      const newValue = value ? parseInt(value) : 0; // Преобразуем в число, если пусто — 0
      console.log(`Новое значение для ${name}: ${newValue}`); // Логируем новое значение
      setFormData((prev) => ({
        ...prev,
        difficulties: [{ ...prev.difficulties[0], [name]: newValue }],
      }));
      // Если выбрана сложность, обновляем selectedDifficulty
      if (name === "difficulty" && newValue !== 0) {
        const selected = difficulties.find((diff) => diff.id === newValue) || null;
        console.log("Выбрана сложность:", selected); // Логируем выбранную сложность
        setSelectedDifficulty(selected);
      }
    } else {
      // Для остальных полей обновляем напрямую
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ... (остальной код без изменений до рендеринга) ...

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
          <div className="form-group">
            <label htmlFor="season">Сезон:</label>
            <select
              id="season"
              name="season"
              value={formData.difficulties[0].season} // Привязываем значение к состоянию
              onChange={handleChange} // Обработчик изменения
              className="submit-input"
              required
            >
              <option value="0">Выберите сезон</option> {/* Плейсхолдер */}
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season.code})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="difficulty">Категория сложности:</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulties[0].difficulty} // Привязываем значение к состоянию
              onChange={handleChange} // Обработчик изменения
              className="submit-input"
              required
            >
              <option value="0">Выберите сложность</option> {/* Плейсхолдер */}
              {difficulties.map((diff) => (
                <option key={diff.id} value={diff.id}>
                  {diff.code} - {diff.description}
                </option>
              ))}
            </select>
            {/* Отображение деталей выбранной сложности */}
            {selectedDifficulty && (
              <div className="difficulty-details">
                <p><strong>Характеристики:</strong> {selectedDifficulty.characteristics}</p>
                <p><strong>Требования:</strong> {selectedDifficulty.requirements}</p>
              </div>
            )}
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