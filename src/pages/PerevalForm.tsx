// AlpPass/src/pages/PerevalForm.tsx

import React, { useState, useEffect } from "react"; // Импорт React и хуков
import { useParams, useNavigate } from "react-router-dom"; // Импорт хуков для параметров и навигации
import PhotosManager from "./PhotosManager"; // Импорт PhotosManager для управления фотографиями
import "../index.css"; // Импорт глобальных стилей

// Интерфейс пропсов компонента
interface PerevalFormProps {
  darkMode: boolean; // Пропс для тёмной темы
  toggleTheme: () => void; // Пропс для переключения темы
}

// Интерфейс данных формы (объединяет поля из Submit.tsx и EditPereval.tsx)
interface PerevalFormData {
  beautyTitle: string; // Название горного массива
  title: string; // Название перевала
  other_titles: string; // Другие названия
  connect: boolean; // Флаг соединения (всегда true для новых перевалов)
  user: {
    email: string; // Email пользователя
    family_name: string; // Фамилия (обязательна для новых перевалов)
    first_name: string; // Имя (обязательно для новых перевалов)
    father_name: string; // Отчество (опционально)
    phone: string; // Телефон
  };
  coord: { latitude: string; longitude: string; height: string }; // Координаты
  status: number; // Статус перевала
  difficulties: { season: number; difficulty: number }[]; // Сезон и сложность
  route_description: string; // Описание маршрута
  images: any[]; // Пустой массив для POST-запроса (обязателен)
}

// Списки сезонов и сложностей (как в Submit.tsx и EditPereval.tsx)
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

// Базовый URL API
const BASE_URL = "https://rostislav62.pythonanywhere.com";
const API_URL = `${BASE_URL}/api/submitData/`;

// Компонент PerevalForm
const PerevalForm: React.FC<PerevalFormProps> = ({ darkMode, toggleTheme }) => {
  // Получение ID перевала из URL (для редактирования)
  const { id } = useParams<{ id: string }>();
  // Хук для навигации
  const navigate = useNavigate();

  // Состояние формы
  const [formData, setFormData] = useState<PerevalFormData | null>(null);
  // Состояние для ошибок
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Состояние для статуса отправки
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  // Состояние для загрузки GPS
  const [loadingGPS, setLoadingGPS] = useState(false);
  // Состояние для модального окна сезона
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  // Состояние для модального окна сложности
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  // Состояние для ID перевала (используется для PhotosManager)
  const [perevalId, setPerevalId] = useState<string | null>(id || null);

  // Загрузка данных перевала при редактировании
  useEffect(() => {
    // Если есть ID, это режим редактирования
    if (id) {
      fetch(`${API_URL}${id}/info/`)
        .then(async response => {
          const text = await response.text(); // Получаем текст ответа
          console.log("📥 Ответ от сервера (перевал):", text);
          try {
            return JSON.parse(text); // Парсим JSON
          } catch (error) {
            console.error("❌ Ошибка парсинга JSON:", text);
            throw new Error("Сервер вернул не JSON-ответ");
          }
        })
        .then((data: PerevalFormData) => {
          const userEmail = localStorage.getItem("user_email") || "";
          const userPhone = localStorage.getItem("user_phone") || "";
          // Проверяем, что перевал можно редактировать
          if (
            data.status === 1 &&
            data.user.email.trim().toLowerCase() === userEmail.trim().toLowerCase() &&
            data.user.phone.replace(/\s+/g, "") === userPhone.replace(/\s+/g, "")
          ) {
            // Инициализируем форму данными из API
            setFormData({
              ...data,
              coord: {
                latitude: data.coord.latitude.toString(),
                longitude: data.coord.longitude.toString(),
                height: data.coord.height.toString(),
              },
              difficulties: data.difficulties.length > 0 ? data.difficulties : [{ season: 0, difficulty: 0 }],
              connect: true, // Для совместимости, хотя не используется в PATCH
              images: [], // Для совместимости, хотя не используется в PATCH
            });
          } else {
            setErrorMessage("Редактирование запрещено! Либо статус не new, либо данные пользователя не совпадают.");
          }
        })
        .catch(error => {
          console.error("Ошибка загрузки перевала:", error);
          setErrorMessage("Ошибка загрузки данных перевала.");
        });
    } else {
      // Если ID нет, инициализируем пустую форму для нового перевала
      setFormData({
        beautyTitle: "",
        title: "",
        other_titles: "",
        connect: true, // Всегда true для новых перевалов
        user: {
          email: localStorage.getItem("user_email") || "",
          family_name: localStorage.getItem("user_family_name") || "",
          first_name: localStorage.getItem("user_first_name") || "",
          father_name: "",
          phone: localStorage.getItem("user_phone") || "",
        },
        coord: { latitude: "", longitude: "", height: "" },
        status: 1, // Новый перевал
        difficulties: [{ season: 0, difficulty: 0 }],
        route_description: "",
        images: [], // Пустой массив для POST
      });
    }
  }, [id]);

  // Обработчик изменения текстовых полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev!,
      [name]: value,
    }));
  };


  // Обработчик изменения координат
  const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev!,
      coord: {
        ...prev!.coord,
        [name]: value,
      },
    }));
  };

  // Обработчик получения GPS-координат (только для новых перевалов)
  const handleGetGPS = () => {
    if (!formData || id) return; // GPS только для новых перевалов
    if ("geolocation" in navigator) {
      setLoadingGPS(true);
      setErrorMessage(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev!,
            coord: {
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
              height: position.coords.altitude ? position.coords.altitude.toFixed(0) : prev!.coord.height,
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

  // Обработчик изменения сезона/сложности
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const newValue = parseInt(value, 10);
    if (isNaN(newValue)) {
      console.error(`Ошибка: ${name} получил невалидное значение "${value}"`);
      return;
    }
    setFormData(prev => ({
      ...prev!,
      difficulties: [{ ...prev!.difficulties[0], [name]: newValue }],
    }));
  };

  // Закрытие модального окна сезона
  const confirmSeasonModal = () => {
    setShowSeasonModal(false);
  };

  // Закрытие модального окна сложности
  const confirmDifficultyModal = () => {
    setShowDifficultyModal(false);
  };

  // Получение текста для выбранного сезона
  const getSeasonText = () => {
    if (!formData) return "Выберите сезон";
    const seasonId = formData.difficulties[0].season;
    const season = seasons.find(s => s.id === seasonId);
    return season ? `${season.name} (${season.code})` : "Выберите сезон";
  };

  // Получение текста для выбранной сложности
  const getDifficultyText = () => {
    if (!formData) return "Выберите категорию";
    const difficultyId = formData.difficulties[0].difficulty;
    const difficulty = difficulties.find(d => d.id === difficultyId);
    return difficulty ? `${difficulty.code} - ${difficulty.description}` : "Выберите категорию";
  };

  // Валидация формы (для новых перевалов)
  const validateForm = () => {
    if (!formData) return "Форма не загружена";
    if (!formData.beautyTitle) return "Название горного массива обязательно";
    if (!formData.title) return "Название перевала обязательно";
    if (!formData.user.email) return "Email пользователя не найден. Пожалуйста, войдите.";
    if (!formData.coord.latitude) return "Широта обязательна";
    if (!formData.coord.longitude) return "Долгота обязательна";
    if (!formData.coord.height) return "Высота обязательна";
    if (formData.difficulties[0].season === 0) return "Сезон обязателен";
    if (formData.difficulties[0].difficulty === 0) return "Категория сложности обязательна";
    return null;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Валидация
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(`❌ ${validationError}`);
      console.log("Текущее состояние formData:", formData);
      return;
    }

    setSubmitStatus("Сохранение перевала...");
    setErrorMessage(null);

    try {
      let response;
      if (id) {
        // Режим редактирования (PATCH)
        const updatedData = {
          email: formData.user.email,
          beautyTitle: formData.beautyTitle,
          title: formData.title,
          other_titles: formData.other_titles,
          coord: {
            latitude: Number(formData.coord.latitude),
            longitude: Number(formData.coord.longitude),
            height: Number(formData.coord.height),
          },
          route_description: formData.route_description,
          difficulties: formData.difficulties,
        };

        console.log("📤 Отправка обновлённых данных:", updatedData);
        response = await fetch(`${API_URL}${id}/update/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
      } else {
        // Режим создания (POST)
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
          route_description: formData.route_description,
          images: formData.images, // Пустой массив
        };

        console.log("📤 Отправка нового перевала:", submitData);
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
      }

      const data = await response.json();
      console.log("✅ Ответ от сервера:", data);

      if (id && response.status === 200 && data.state === 1) {
        // Успешное редактирование
        setSubmitStatus("✅ Перевал успешно обновлён!");
        setTimeout(() => navigate(`/pereval/${id}`), 1000); // Редирект на страницу деталей
      } else if (!id && response.ok && data.id) {
        // Успешное создание
        setSubmitStatus("✅ Перевал успешно добавлен!");
        localStorage.setItem("last_pereval_id", data.id); // Сохранение ID в localStorage
        setPerevalId(data.id); // Установка ID для PhotosManager
        setTimeout(() => navigate(`/pereval/${data.id}`), 1000); // Редирект на страницу деталей
      } else {
        // Обработка ошибок
        if (response.status === 400) {
          setErrorMessage(`❌ ${data.message || "Обновление запрещено: статус не new"}`);
        } else if (response.status === 403) {
          setErrorMessage(`❌ ${data.message || "У вас нет прав на редактирование этого перевала"}`);
        } else if (response.status === 404) {
          setErrorMessage(`❌ ${data.message || "Перевал не найден"}`);
        } else {
          throw new Error(`Ошибка сервера: ${JSON.stringify(data)}`);
        }
        setSubmitStatus(null);
      }
    } catch (error) {
      console.error("❌ Ошибка отправки данных:", error);
      setErrorMessage(`❌ ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
      setSubmitStatus(null);
    }
  };

  // Если форма не загружена (для редактирования)
  if (!formData) return <p className="loading-text">Загрузка...</p>;

  return (
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Заголовок формы */}
      <h1 className="submit-title">{id ? "Редактировать перевал" : "Добавить новый перевал"}</h1>
      {/* Сообщение об ошибке */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {/* Статус отправки */}
      {submitStatus && <p className="submit-status">{submitStatus}</p>}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="submit-form">
        {/* Секция: Данные перевала */}
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
        
        {/* Секция: Координаты */}
        <fieldset className="submit-section">
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
          {/* Кнопка GPS (только для новых перевалов) */}
          {!id && (
            <button type="button" onClick={handleGetGPS} disabled={loadingGPS} className="gps-btn">
              {loadingGPS ? "Загрузка..." : "Получить с GPS"}
            </button>
          )}
        </fieldset>

        {/* Секция: Уровень сложности */}
        <fieldset className="submit-section">
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

        {/* Секция: Фотографии */}
        {perevalId && (
          <fieldset className="submit-section">
            <legend>Фотографии</legend>
            <PhotosManager darkMode={darkMode} toggleTheme={toggleTheme} />
          </fieldset>
        )}

        {/* Кнопка отправки */}
        <button type="submit" className="submit-btn">{id ? "Сохранить изменения" : "Отправить"}</button>
      </form>

      {/* Модальное окно для выбора сезона */}
      {showSeasonModal && (
        <div className="modal" onClick={() => setShowSeasonModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Выберите сезон</h2>
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

      {/* Модальное окно для выбора сложности */}
      {showDifficultyModal && (
        <div className="modal" onClick={() => setShowDifficultyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Выберите категорию сложности</h2>
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
            <button className="modal-btn" onClick={confirmDifficultyModal}>
              Выбрать
            </button>
          </div>
        </div>
      )}

      {/* Кнопка переключения темы */}
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default PerevalForm; // Экспорт компонента