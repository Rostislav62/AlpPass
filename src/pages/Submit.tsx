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
  connect: boolean; /* Флаг соединения */
  user: {
    email: string;
    family_name: string;
    first_name: string;
    father_name: string;
    phone: string;
  }; /* Данные пользователя */
  coord: { latitude: string; longitude: string; height: string }; /* Координаты */
  status: number; /* Статус перевала */
  difficulties: { season: number; difficulty: number }[]; /* Сложность (сезон и категория) */
  route_description: string; /* Описание маршрута */
  images: any[]; /* Изображения */
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

  /* Инициализация состояния формы (взято из старой версии с добавлением father_name) */
  const [formData, setFormData] = useState<FormData>({
    beautyTitle: "",
    title: "",
    other_titles: "",
    connect: true, /* Фиксированное значение из требований */
    user: {
      email: localStorage.getItem("user_email") || "",
      family_name: localStorage.getItem("user_family_name") || "",
      first_name: localStorage.getItem("user_first_name") || "",
      father_name: "", /* Пустое, как указано в JSON */
      phone: localStorage.getItem("user_phone") || "",
    },
    coord: { latitude: "", longitude: "", height: "" }, /* Строки, как указано */
    status: 1, /* Фиксированное значение из требований */
    difficulties: [{ season: 0, difficulty: 0 }],
    route_description: "",
    images: [], /* Пустой массив, как в старой версии */
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для ошибок */
  const [submitStatus, setSubmitStatus] = useState<string | null>(null); /* Состояние для статуса отправки */
  const [loadingGPS, setLoadingGPS] = useState(false); /* Состояние для GPS */
  const [showSeasonModal, setShowSeasonModal] = useState(false); /* Состояние для модалки сезона (из новой версии) */
  const [showDifficultyModal, setShowDifficultyModal] = useState(false); /* Состояние для модалки сложности (из новой версии) */

  const API_URL = "https://rostislav62.pythonanywhere.com/api/submitData/"; /* URL для отправки данных перевала */

  /* Обработчик изменения текстовых полей (взято из новой версии) */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* Обработчик изменения координат (адаптировано из старой версии для строк) */
  const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      coord: {
        ...prev.coord,
        [name]: value,
      },
    }));
  };

  /* Обработчик GPS (взято из старой версии) */
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

  /* Обработчик изменения сезона и сложности в модалке (взято из новой версии) */
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value, 10);
    if (isNaN(newValue)) {
      console.error(`Ошибка: ${name} получил невалидное значение "${value}"`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      difficulties: [{ ...prev.difficulties[0], [name]: newValue }],
    }));
  };

  /* Закрытие модалки сезона (взято из новой версии) */
  const confirmSeasonModal = () => {
    setShowSeasonModal(false);
  };

  /* Закрытие модалки сложности (взято из новой версии) */
  const confirmDifficultyModal = () => {
    setShowDifficultyModal(false);
  };

  /* Получение текста для выбранного сезона (взято из новой версии) */
  const getSeasonText = () => {
    const seasonId = formData.difficulties[0].season;
    const season = seasons.find((s) => s.id === seasonId);
    return season ? `${season.name} (${season.code})` : "Выберите сезон";
  };

  /* Получение текста для выбранной сложности (взято из новой версии) */
  const getDifficultyText = () => {
    const difficultyId = formData.difficulties[0].difficulty;
    const difficulty = difficulties.find((d) => d.id === difficultyId);
    return difficulty ? `${difficulty.code} - ${difficulty.description}` : "Выберите категорию";
  };

  /* Валидация формы (взято из старой версии с дополнениями) */
  const validateForm = () => {
    if (!formData.beautyTitle) return "Название горного массива обязательно";
    if (!formData.title) return "Название перевала обязательно";
    if (!formData.user.email) return "Email пользователя не найден. Пожалуйста, войдите.";
    if (!formData.user.family_name) return "Фамилия обязательна";
    if (!formData.user.first_name) return "Имя обязательно";
    if (!formData.user.phone) return "Телефон обязателен";
    if (!formData.coord.latitude) return "Широта обязательна";
    if (!formData.coord.longitude) return "Долгота обязательна";
    if (!formData.coord.height) return "Высота обязательна";
    if (formData.difficulties[0].season === 0) return "Сезон обязателен";
    if (formData.difficulties[0].difficulty === 0) return "Категория сложности обязательна";
    return null;
  };

  /* Обработчик отправки формы (комбинация старой и новой версии) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(`❌ ${validationError}`);
      console.log("Текущее состояние formData:", formData);
      return;
    }

    setSubmitStatus("Сохранение перевала...");
    setErrorMessage(null);

    /* Формирование данных для отправки согласно JSON (взято из требований) */
    const submitData = {
      beautyTitle: formData.beautyTitle,
      title: formData.title,
      other_titles: formData.other_titles,
      connect: formData.connect,
      user: {
        email: formData.user.email,
        family_name: formData.user.family_name,
        first_name: formData.user.first_name,
        father_name: formData.user.father_name,
        phone: formData.user.phone,
      },
      coord: {
        latitude: formData.coord.latitude,
        longitude: formData.coord.longitude,
        height: formData.coord.height,
      },
      status: formData.status,
      difficulties: formData.difficulties,
      images: formData.images,
      route_description: formData.route_description,
    };

    try {
      console.log("📤 Отправка данных перевала на сервер:", submitData);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log("✅ Ответ от сервера (перевал):", data);

      if (response.status === 201 && data.state === 1 && data.id) {
        setSubmitStatus("✅ Перевал успешно добавлен! Перенаправление...");
        localStorage.setItem("last_pereval_id", data.id);
        setTimeout(() => navigate(`/add-images/${data.id}`), 1000);
      } else {
        throw new Error(`Ошибка сервера: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("❌ Ошибка отправки данных:", error);
      setErrorMessage(`❌ ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
      setSubmitStatus(null);
    }
  };

  return (
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер формы с темой (из новой версии) */}
      <h1 className="submit-title">Добавить новый перевал</h1> {/* Заголовок (из обеих версий) */}
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Ошибки (из обеих версий) */}
      {submitStatus && <p className="submit-status">{submitStatus}</p>} {/* Статус отправки (из старой версии) */}
      <form onSubmit={handleSubmit} className="submit-form"> {/* Форма (из новой версии) */}
        <fieldset className="submit-section"> {/* Секция данных перевала (из новой версии) */}
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

        <fieldset className="submit-section"> {/* Секция координат (из новой версии с GPS из старой) */}
          <legend>Координаты</legend>
          <div className="form-group">
            <label htmlFor="latitude">Широта:</label>
            <input
              type="text"
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
              type="text"
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
              type="text"
              id="height"
              name="height"
              value={formData.coord.height}
              onChange={handleCoordChange}
              className="submit-input"
              required
            />
          </div>
          <button type="button" onClick={handleGetGPS} disabled={loadingGPS} className="gps-btn">
            {loadingGPS ? "Загрузка..." : "Получить с GPS"}
          </button>
        </fieldset>

        <fieldset className="submit-section"> {/* Секция сложности с модалками (из новой версии) */}
          <legend>Уровень сложности</legend>
          <div className="form-group">
            <label htmlFor="season">Сезон:</label>
            <div
              className="submit-input submit-choice"
              onClick={() => setShowSeasonModal(true)}
            >
              {getSeasonText()}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="difficulty">Категория сложности:</label>
            <div
              className="submit-input submit-choice"
              onClick={() => setShowDifficultyModal(true)}
            >
              {getDifficultyText()}
            </div>
          </div>
        </fieldset>

        <button type="submit" className="submit-btn">Отправить</button> {/* Кнопка отправки (из обеих версий) */}
      </form>

      {/* Модальное окно для выбора сезона (из новой версии) */}
      {showSeasonModal && (
        <div className="modal" onClick={() => setShowSeasonModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Выберите сезон</h2>
            <div className="radio-container">
              {seasons.map((season) => (
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
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно для выбора сложности (из новой версии) */}
      {showDifficultyModal && (
        <div className="modal" onClick={() => setShowDifficultyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Выберите категорию сложности</h2>
            <div className="radio-container">
              {difficulties.map((diff) => (
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
            </button>
          </div>
        </div>
      )}

      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Кнопка темы (из обеих версий) */}
      </button>
    </div>
  );
};

export default Submit; /* Экспорт компонента */