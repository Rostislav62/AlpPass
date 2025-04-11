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
  // Инициализируем хук для навигации
  const navigate = useNavigate();

  // Состояние для данных формы
  const [formData, setFormData] = useState<FormData>({
    beautyTitle: "", // Начальное значение для названия массива
    title: "", // Начальное значение для официального названия
    other_titles: "", // Начальное значение для местного названия
    connect: true, // По умолчанию перевал считается "на связи"
    user: {
      email: localStorage.getItem("user_email") || "", // Email из localStorage или пустая строка
      family_name: localStorage.getItem("user_family_name") || "", // Фамилия из localStorage
      first_name: localStorage.getItem("user_first_name") || "", // Имя из localStorage
      phone: localStorage.getItem("user_phone") || "", // Телефон из localStorage
    },
    coord: { latitude: "", longitude: "", height: "" }, // Начальные пустые координаты
    status: 1, // Статус по умолчанию "new"
    difficulties: [{ season: 0, difficulty: 0 }], // Начальные значения сложности (0 — не выбрано)
    route_description: "", // Начальное значение описания маршрута
    images: [], // Пустой массив для изображений
  });

  // Состояние для статуса отправки формы (например, "Сохранение...")
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  // Состояние для сообщения об ошибке
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Состояние для индикации загрузки GPS
  const [loadingGPS, setLoadingGPS] = useState(false);
  // Состояние для списка сезонов из базы
  const [seasons, setSeasons] = useState<Season[]>([]);
  // Состояние для списка категорий сложности из базы
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  // Состояние для хранения выбранной сложности (для отображения деталей)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  // Базовый URL API, берётся из переменной окружения или по умолчанию
  const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com";

  // Эффект для загрузки сезонов и сложностей при монтировании компонента
  useEffect(() => {
    // Асинхронная функция для получения сезонов
    const fetchSeasons = async () => {
      try {
        console.log("Запрос сезонов: начало"); // Логируем начало запроса
        const response = await fetch(`${API_URL}/api/seasons/`); // Запрос к API сезонов
        console.log("Запрос сезонов: статус", response.status); // Логируем статус ответа
        if (!response.ok) {
          throw new Error(`Ошибка запроса сезонов: ${response.status}`);
        }
        const data = await response.json(); // Парсим ответ в JSON
        console.log("Полученные сезоны:", data); // Логируем полученные данные
        setSeasons(data); // Устанавливаем сезоны в состояние
      } catch (error) {
        console.error("Ошибка загрузки сезонов:", error); // Логируем ошибку
      }
    };

    // Асинхронная функция для получения категорий сложности
    const fetchDifficulties = async () => {
      try {
        console.log("Запрос сложностей: начало"); // Логируем начало запроса
        const response = await fetch(`${API_URL}/api/difficulty-levels/`); // Запрос к API сложностей
        console.log("Запрос сложностей: статус", response.status); // Логируем статус ответа
        if (!response.ok) {
          throw new Error(`Ошибка запроса сложностей: ${response.status}`);
        }
        const data = await response.json(); // Парсим ответ в JSON
        console.log("Полученные сложности:", data); // Логируем полученные данные
        setDifficulties(data); // Устанавливаем категории в состояние
      } catch (error) {
        console.error("Ошибка загрузки сложностей:", error); // Логируем ошибку
      }
    };

    fetchSeasons(); // Вызываем загрузку сезонов
    fetchDifficulties(); // Вызываем загрузку сложностей
  }, [API_URL]); // Добавляем API_URL в зависимости, чтобы убрать предупреждение ESLint

  // Обработчик изменения значений в полях формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target; // Извлекаем имя и значение поля
    if (["latitude", "longitude", "height"].includes(name)) {
      // Если поле относится к координатам, обновляем coord
      setFormData((prev) => ({
        ...prev,
        coord: { ...prev.coord, [name]: value },
      }));
    } else if (["season", "difficulty"].includes(name)) {
      // Если поле относится к сложности, обновляем difficulties (преобразуем в число)
      const newValue = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        difficulties: [{ ...prev.difficulties[0], [name]: newValue }],
      }));
      // Если выбрана сложность, обновляем selectedDifficulty
      if (name === "difficulty") {
        const selected = difficulties.find((diff) => diff.id === newValue) || null;
        setSelectedDifficulty(selected);
      }
    } else {
      // Для остальных полей обновляем напрямую
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Обработчик получения координат через GPS
  const handleGetGPS = () => {
    if ("geolocation" in navigator) { // Проверяем поддержку геолокации в браузере
      setLoadingGPS(true); // Устанавливаем флаг загрузки
      setErrorMessage(null); // Сбрасываем сообщение об ошибке
      navigator.geolocation.getCurrentPosition(
        (position) => { // Успешный callback при получении позиции
          setFormData((prev) => ({
            ...prev,
            coord: {
              latitude: position.coords.latitude.toFixed(6), // Широта с 6 знаками
              longitude: position.coords.longitude.toFixed(6), // Долгота с 6 знаками
              height: position.coords.altitude ? position.coords.altitude.toFixed(0) : prev.coord.height, // Высота или прежнее значение
            },
          }));
          setLoadingGPS(false); // Сбрасываем флаг загрузки
          if (!position.coords.altitude) { // Если высота недоступна
            setErrorMessage("⚠️ Высота недоступна на этом устройстве, введите вручную");
          }
        },
        (error) => { // Callback при ошибке
          setErrorMessage(`❌ Ошибка GPS: ${error.message}`);
          setLoadingGPS(false);
        },
        { enableHighAccuracy: true } // Опции для высокой точности
      );
    } else {
      setErrorMessage("❌ Геолокация не поддерживается вашим устройством"); // Браузер не поддерживает GPS
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы
    // Проверяем, что все обязательные поля заполнены
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
      formData.difficulties[0].season === 0 || // Проверяем, выбран ли сезон
      formData.difficulties[0].difficulty === 0 // Проверяем, выбрана ли сложность
    ) {
      setErrorMessage("❌ Все обязательные поля должны быть заполнены!"); // Сообщение об ошибке
      return;
    }

    setSubmitStatus("Сохранение перевала..."); // Устанавливаем статус отправки
    setErrorMessage(null); // Сбрасываем ошибку

    try {
      console.log("📤 Отправка данных перевала на сервер:", formData); // Логируем данные перед отправкой
      const perevalResponse = await fetch(`${API_URL}/api/submitData/`, { // Отправляем POST-запрос
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Указываем тип данных
        },
        body: JSON.stringify(formData), // Преобразуем данные в JSON
      });

      const perevalData = await perevalResponse.json(); // Получаем ответ от сервера
      console.log("✅ Ответ от сервера (перевал):", perevalData); // Логируем ответ

      if (!perevalResponse.ok) { // Проверяем, успешен ли запрос
        throw new Error(`Ошибка сервера: ${perevalData.message || JSON.stringify(perevalData)}`);
      }

      const perevalId = perevalData.id; // Извлекаем ID созданного перевала
      localStorage.setItem("last_pereval_id", perevalId); // Сохраняем ID в localStorage
      setSubmitStatus("✅ Перевал успешно добавлен! Перенаправление..."); // Устанавливаем статус успеха

      setTimeout(() => navigate(`/add-images/${perevalId}`), 1000); // Перенаправляем через 1 секунду
    } catch (error) {
      console.error("❌ Ошибка отправки данных:", error); // Логируем ошибку
      setErrorMessage(`❌ Ошибка: ${(error as Error).message}`); // Показываем ошибку пользователю
      setSubmitStatus(null); // Сбрасываем статус отправки
    }
  };

  // Рендеринг формы
  return (
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Основной контейнер с динамической темой */}
      <h1 className="submit-title">Добавить новый перевал</h1> {/* Заголовок формы */}
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке, если есть */}
      {submitStatus && <p className="submit-status">{submitStatus}</p>} {/* Статус отправки, если есть */}
      <form onSubmit={handleSubmit} className="submit-form"> {/* Форма с обработчиком отправки */}
        <fieldset className="submit-section"> {/* Секция данных перевала */}
          <legend>Данные перевала</legend> {/* Заголовок секции */}
          <div className="form-group"> {/* Группа для названия массива */}
            <label htmlFor="beautyTitle">Название горного массива:</label> {/* Метка */}
            <input
              type="text"
              id="beautyTitle"
              name="beautyTitle"
              value={formData.beautyTitle}
              onChange={handleChange}
              className="submit-input"
              required
            /> {/* Поле ввода названия массива */}
          </div>
          <div className="form-group"> {/* Группа для официального названия */}
            <label htmlFor="title">Официальное название перевала:</label> {/* Метка */}
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="submit-input"
              required
            /> {/* Поле ввода официального названия */}
          </div>
          <div className="form-group"> {/* Группа для местного названия */}
            <label htmlFor="other_titles">Местное название перевала:</label> {/* Метка */}
            <input
              type="text"
              id="other_titles"
              name="other_titles"
              value={formData.other_titles}
              onChange={handleChange}
              className="submit-input"
            /> {/* Поле ввода местного названия, необязательное */}
          </div>
          <div className="form-group"> {/* Группа для описания маршрута */}
            <label htmlFor="route_description">Описание маршрута:</label> {/* Метка */}
            <textarea
              id="route_description"
              name="route_description"
              value={formData.route_description}
              onChange={handleChange}
              className="submit-input"
              rows={3}
            /> {/* Текстовое поле для описания маршрута */}
          </div>
        </fieldset>

        <fieldset className="submit-section"> {/* Секция координат */}
          <legend>Координаты</legend> {/* Заголовок секции */}
          <div className="form-group"> {/* Группа для широты */}
            <label htmlFor="latitude">Широта:</label> {/* Метка */}
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.coord.latitude}
              onChange={handleChange}
              className="submit-input"
              required
            /> {/* Поле ввода широты */}
          </div>
          <div className="form-group"> {/* Группа для долготы */}
            <label htmlFor="longitude">Долгота:</label> {/* Метка */}
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.coord.longitude}
              onChange={handleChange}
              className="submit-input"
              required
            /> {/* Поле ввода долготы */}
          </div>
          <div className="form-group"> {/* Группа для высоты */}
            <label htmlFor="height">Высота:</label> {/* Метка */}
            <input
              type="text"
              id="height"
              name="height"
              value={formData.coord.height}
              onChange={handleChange}
              className="submit-input"
              required
            /> {/* Поле ввода высоты */}
          </div>
          <button type="button" onClick={handleGetGPS} disabled={loadingGPS} className="gps-btn">
            {loadingGPS ? "Загрузка..." : "Получить с GPS"} {/* Кнопка для получения GPS */}
          </button>
        </fieldset>

        <fieldset className="submit-section"> {/* Секция уровня сложности */}
          <legend>Уровень сложности</legend> {/* Заголовок секции */}
          <div className="form-group"> {/* Группа для сезона */}
            <label htmlFor="season">Сезон:</label> {/* Метка */}
            <select
              id="season"
              name="season"
              value={formData.difficulties[0].season}
              onChange={handleChange}
              className="submit-input"
              required
            > {/* Выпадающий список сезонов */}
              <option value="0">Выберите сезон</option> {/* Плейсхолдер */}
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season.code}) {/* Отображаем название и код */}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group"> {/* Группа для категории сложности */}
            <label htmlFor="difficulty">Категория сложности:</label> {/* Метка */}
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulties[0].difficulty}
              onChange={handleChange}
              className="submit-input"
              required
            > {/* Выпадающий список категорий */}
              <option value="0">Выберите сложность</option> {/* Плейсхолдер */}
              {difficulties.map((diff) => (
                <option key={diff.id} value={diff.id}>
                  {diff.code} - {diff.description} {/* Отображаем только код и описание */}
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

        <button type="submit" className="submit-btn">Отправить</button> {/* Кнопка отправки формы */}
      </form>
      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Кнопка переключения темы */}
      </button>
    </div>
  );
};

// Экспортируем компонент Submit как default
export default Submit;