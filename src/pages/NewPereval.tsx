// AlpPass/src/pages/NewPereval.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateFileName } from "../utils/generateFileName";
import { uploadImages } from "../utils/uploadImages";
import { ImageData, PerevalFormData } from "./EditPereval";
import "../index.css";

// 📌 Интерфейс пропсов компонента
interface PerevalFormProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

// 📌 Списки сезонов и сложностей для выбора в форме
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

// 📌 Базовые URL API для отправки данных перевала и фотографий
const BASE_URL = "https://rostislav62.pythonanywhere.com";
const API_URL = `${BASE_URL}/api/submitData/`;
const IMAGE_API_URL = `${BASE_URL}/api/uploadImage/`;

// 📌 Названия слотов для фотографий (используются в UI и логах)
const slotLabels = ["Подъём", "Седловина", "Спуск"];

// 📌 Компонент PerevalForm для создания нового перевала
const PerevalForm: React.FC<PerevalFormProps> = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PerevalFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [, setPerevalId] = useState<string | null>(null);

  // 📌 Инициализация формы при загрузке компонента
  useEffect(() => {
    setFormData({
      beautyTitle: "",
      title: "",
      other_titles: "",
      connect: true,
      user: {
        email: localStorage.getItem("user_email") || "",
        family_name: localStorage.getItem("user_family_name") || "",
        first_name: localStorage.getItem("user_first_name") || "",
        father_name: "",
        phone: localStorage.getItem("user_phone") || "",
      },
      coord: { latitude: "", longitude: "", height: "" },
      status: 1,
      difficulties: [{ season: 0, difficulty: 0 }],
      route_description: "",
      images: [null, null, null], // 📌 Инициализируем три пустых слота для фотографий
    });
  }, []);

  // 📌 Очистка URL.createObjectURL для локальных превью фотографий при размонтировании
  useEffect(() => {
    return () => {
      if (formData?.images) {
        formData.images.forEach(image => {
          if (image && image.preview && image.isModified) {
            URL.revokeObjectURL(image.preview);
          }
        });
      }
    };
  }, [formData?.images]);

  // 📌 Обработчик изменения текстовых полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    console.log(`✏️ Изменение поля ${name}:`, value);
    setFormData(prev => ({
      ...prev!,
      [name]: value,
    }));
  };

  // 📌 Обработчик изменения координат (широта, долгота, высота)
  const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    console.log(`📍 Изменение координаты ${name}:`, value);
    setFormData(prev => ({
      ...prev!,
      coord: {
        ...prev!.coord,
        [name]: value,
      },
    }));
  };

  // 📌 Обработчик получения GPS-координат с устройства
  const handleGetGPS = () => {
    if (!formData) return;
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

  // 📌 Обработчик изменения сезона или сложности
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const newValue = parseInt(value, 10);
    if (isNaN(newValue)) {
      console.error(`❌ Ошибка: ${name} получил невалидное значение "${value}"`);
      return;
    }
    console.log(`🏔️ Изменение ${name}:`, newValue);
    setFormData(prev => ({
      ...prev!,
      difficulties: [{ ...prev!.difficulties[0], [name]: newValue }],
    }));
  };

  // 📌 Обработчик выбора файла для загрузки фотографии
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!formData || !files || files.length === 0) return;
    const file = files[0];

    // 📌 Проверяем формат файла (только JPG или PNG)
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrorMessage(`❌ Недопустимый формат файла: ${file.name}. Используйте JPG или PNG.`);
      console.error(`❌ Недопустимый формат файла: ${file.name}`);
      return;
    }

    // 📌 Проверяем размер файла (максимум 10 МБ)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`❌ Файл слишком большой: ${file.name}. Максимальный размер: 10 МБ.`);
      console.error(`❌ Файл слишком большой: ${file.name}`);
      return;
    }

    // 📌 Генерируем имя файла с префиксом, соответствующим слоту (1_, 2_, 3_)
    const fileName = generateFileName(index, formData.title, file);

    // 📌 Создаём объект для нового изображения
    const newImage: ImageData = {
      file,
      preview: URL.createObjectURL(file),
      title: fileName,
      isModified: true, // 📌 Помечаем как новое изображение для загрузки
    };

    // 📌 Логируем добавление фотографии
    console.log(`📷 Новое изображение добавлено в слот ${index} (${slotLabels[index]}): ${fileName}`);

    // 📌 Обновляем массив изображений, заменяя слот
    setFormData(prev => {
      const updatedImages = [...prev!.images];
      updatedImages[index] = newImage;
      return {
        ...prev!,
        images: updatedImages,
      };
    });

    setErrorMessage(null);
    e.target.value = "";
  };

  // 📌 Обработчик Drag-and-Drop для загрузки фотографии
  const handleDrop = (index: number, e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!formData) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // 📌 Проверяем формат файла
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setErrorMessage(`❌ Недопустимый формат файла: ${file.name}. Используйте JPG или PNG.`);
        console.error(`❌ Недопустимый формат файла: ${file.name}`);
        return;
      }

      // 📌 Проверяем размер файла
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`❌ Файл слишком большой: ${file.name}. Максимальный размер: 10 МБ.`);
        console.error(`❌ Файл слишком большой: ${file.name}`);
        return;
      }

      // 📌 Генерируем имя файла с префиксом, соответствующим слоту
      const fileName = generateFileName(index, formData.title, file);

      // 📌 Создаём объект для нового изображения
      const newImage: ImageData = {
        file,
        preview: URL.createObjectURL(file),
        title: fileName,
        isModified: true, // 📌 Помечаем как новое изображение
      };

      // 📌 Логируем добавление через Drag-and-Drop
      console.log(`📷 Новое изображение добавлено в слот ${index} (${slotLabels[index]}) через Drag-and-Drop: ${fileName}`);

      // 📌 Обновляем массив изображений
      setFormData(prev => {
        const updatedImages = [...prev!.images];
        updatedImages[index] = newImage;
        return {
          ...prev!,
          images: updatedImages,
        };
      });

      setErrorMessage(null);
    }
  };

  // 📌 Обработчик для предотвращения стандартного поведения dragover
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  // 📌 Обработчик локального удаления фотографии из слота
  const handleDeleteLocal = (index: number) => {
    if (!formData) return;
    const image = formData.images[index];
    if (!image) {
      console.log(`🗑️ Слот ${index} (${slotLabels[index]}) уже пуст`);
      return;
    }

    // 📌 Логируем удаление
    console.log(`🗑️ Изображение в слоте ${index} (${slotLabels[index]}) удалено локально: ${image.title}`);

    // 📌 Очищаем слот и освобождаем URL
    setFormData(prev => {
      const updatedImages = [...prev!.images];
      if (updatedImages[index]?.preview) {
        URL.revokeObjectURL(updatedImages[index]!.preview);
      }
      updatedImages[index] = null;
      return {
        ...prev!,
        images: updatedImages,
      };
    });

    setErrorMessage(null);
  };

  // 📌 Закрытие модального окна выбора сезона
  const confirmSeasonModal = () => {
    setShowSeasonModal(false);
  };

  // 📌 Закрытие модального окна выбора сложности
  const confirmDifficultyModal = () => {
    setShowDifficultyModal(false);
  };

  // 📌 Получение текста для выбранного сезона в UI
  const getSeasonText = () => {
    if (!formData) return "Выберите сезон";
    const seasonId = formData.difficulties[0].season;
    const season = seasons.find(s => s.id === seasonId);
    return season ? `${season.name} (${season.code})` : "Выберите сезон";
  };

  // 📌 Получение текста для выбранной категории сложности в UI
  const getDifficultyText = () => {
    if (!formData) return "Выберите категорию";
    const difficultyId = formData.difficulties[0].difficulty;
    const difficulty = difficulties.find(d => d.id === difficultyId);
    return difficulty ? `${difficulty.code} - ${difficulty.description}` : "Выберите категорию";
  };

  // 📌 Валидация формы перед отправкой
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

  // 📌 Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // 📌 Проверяем валидность формы
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(`❌ ${validationError}`);
      console.log("📋 Текущее состояние formData:", formData);
      return;
    }

    setSubmitStatus("Сохранение перевала...");
    setErrorMessage(null);

    try {
      // 📌 Шаг 1: Отправляем данные перевала (POST)
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
          latitude: Number(formData.coord.latitude),
          longitude: Number(formData.coord.longitude),
          height: Number(formData.coord.height),
        },
        status: formData.status,
        difficulties: formData.difficulties,
        route_description: formData.route_description,
        images: [], // 📌 Поле images пустое, так как фотографии загружаются отдельно
      };

      console.log("📤 Отправка нового перевала:", submitData);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log("✅ Ответ от сервера (POST):", data);

      if (!response.ok || !data.id) {
        throw new Error(data.message || "Ошибка создания перевала");
      }

      // 📌 Шаг 2: Сохраняем ID перевала и загружаем фотографии
      setPerevalId(data.id);
      localStorage.setItem("last_pereval_id", data.id);

      const imagesToUpload = formData.images.filter((img): img is ImageData => img !== null);
      if (imagesToUpload.length > 0) {
        setSubmitStatus("Сохранение фотографий...");

        // 📌 Создаём фиктивный initialFormData для uploadImages (нет старых фотографий)
        const initialFormData: PerevalFormData = {
          ...formData,
          images: [null, null, null], // 📌 Пустые слоты, так как это новый перевал
        };

        // 📌 Загружаем фотографии с префиксами, соответствующими слотам
        await uploadImages(formData, initialFormData, data.id, slotLabels);
      }

      setSubmitStatus("✅ Перевал и фотографии успешно добавлены!");
      setTimeout(() => navigate(`/pereval/${data.id}`), 1000);
    } catch (error) {
      console.error("❌ Ошибка отправки данных:", error);
      setErrorMessage(`❌ ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
      setSubmitStatus(null);
    }
  };

  // 📌 Отображаем индикатор загрузки, пока форма не инициализирована
  if (!formData) return <p className="loading-text">Загрузка...</p>;

  // 📌 JSX для рендеринга формы
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
          <button type="button" onClick={handleGetGPS} disabled={loadingGPS} className="gps-btn">
            {loadingGPS ? "Загрузка..." : "Получить с GPS"}
          </button>
        </fieldset>

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

        <fieldset className="submit-section">
          <legend>Фотографии</legend>
          <h2 className="upload-photos-title">Добавление фотографий</h2>
          <div className="photo-slots">
            {[0, 1, 2].map(index => (
              <div key={index} className="photo-slot">
                {formData.images[index] === null ? (
                  // 📌 Пустой слот для загрузки фотографии
                  <label
                    className="photo-placeholder"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => handleImageChange(index, e)}
                      className="hidden-input"
                    />
                    <span className="slot-label">Выберите фото, нажав здесь</span>
                    <span className="slot-label slot-title">{slotLabels[index]}</span>
                  </label>
                ) : (
                  // 📌 Отображение загруженной фотографии
                  <div className="image-item">
                    <img
                      src={formData.images[index]!.preview}
                      alt={slotLabels[index]}
                      className="image-preview"
                    />
                    <span className="slot-label slot-title">{slotLabels[index]}</span>
                    <div className="image-actions">
                      <button
                        onClick={() => handleDeleteLocal(index)}
                        className="delete-btn"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="submit-btn">Отправить</button>
      </form>

      {/* 📌 Модальное окно для выбора сезона */}
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

      {/* 📌 Модальное окно для выбора сложности */}
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

      <button onClick={toggleTheme} className="theme-btn">
        {darkMode ? "Светлая тема" : "Тёмная тема"}
      </button>
    </div>
  );
};

export default PerevalForm;