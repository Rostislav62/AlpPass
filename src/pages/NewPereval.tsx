// AlpPass/src/pages/NewPereval.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { transliterate } from "transliteration";
import "../index.css";

// Интерфейс пропсов компонента
interface PerevalFormProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

// Интерфейс данных локального изображения
interface ImageData {
  file: File;
  preview: string;
  title: string;
}

// Интерфейс данных формы
interface PerevalFormData {
  beautyTitle: string;
  title: string;
  other_titles: string;
  connect: boolean;
  user: {
    email: string;
    family_name: string;
    first_name: string;
    father_name: string;
    phone: string;
  };
  coord: { latitude: string; longitude: string; height: string };
  status: number;
  difficulties: { season: number; difficulty: number }[];
  route_description: string;
  images: (ImageData | null)[];
}

// Списки сезонов и сложностей
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
const IMAGE_API_URL = `${BASE_URL}/api/uploadImage/`;

// Названия слотов для фотографий
const slotLabels = ["Подъём", "Седловина", "Спуск"];

// Компонент PerevalForm
const PerevalForm: React.FC<PerevalFormProps> = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PerevalFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [, setPerevalId] = useState<string | null>(null);

  // Функция генерации имени файла (из EditPereval.tsx)
  const generateFileName = (index: number, perevalTitle: string, file: File): string => {
    const prefix = `${index + 1}_`;
    const uniqueId = Math.random().toString(36).substring(2, 12);
    const transliteratedTitle = transliterate(perevalTitle.toLowerCase()).replace(/[^a-z0-9]/g, "");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    return `${prefix}${uniqueId}_${transliteratedTitle}.${extension}`;
  };

  // Инициализация формы
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
      images: [null, null, null],
    });
  }, []);

  // Очистка URL.createObjectURL
  useEffect(() => {
    return () => {
      if (formData?.images) {
        formData.images.forEach(image => {
          if (image && image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
      }
    };
  }, [formData?.images]);

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

  // Обработчик получения GPS-координат
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

  // Обработчик выбора файла
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!formData || !files || files.length === 0) return;
    const file = files[0];

    // Валидация формата
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrorMessage(`❌ Недопустимый формат файла: ${file.name}. Используйте JPG или PNG.`);
      return;
    }

    // Валидация размера
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`❌ Файл слишком большой: ${file.name}. Максимальный размер: 10 МБ.`);
      return;
    }

    const fileName = generateFileName(index, formData.title, file);
    const newImage: ImageData = {
      file,
      preview: URL.createObjectURL(file),
      title: fileName,
    };
    setFormData(prev => ({
      ...prev!,
      images: [
        ...prev!.images.slice(0, index),
        newImage,
        ...prev!.images.slice(index + 1),
      ].slice(0, 3),
    }));
    setErrorMessage(null);
    e.target.value = "";
  };

  // Обработчик Drag-and-Drop
  const handleDrop = (index: number, e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!formData) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Валидация формата
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setErrorMessage(`❌ Недопустимый формат файла: ${file.name}. Используйте JPG или PNG.`);
        return;
      }

      // Валидация размера
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`❌ Файл слишком большой: ${file.name}. Максимальный размер: 10 МБ.`);
        return;
      }

      const fileName = generateFileName(index, formData.title, file);
      const newImage: ImageData = {
        file,
        preview: URL.createObjectURL(file),
        title: fileName,
      };
      setFormData(prev => ({
        ...prev!,
        images: [
          ...prev!.images.slice(0, index),
          newImage,
          ...prev!.images.slice(index + 1),
        ].slice(0, 3),
      }));
      setErrorMessage(null);
    }
  };

  // Обработчик для предотвращения стандартного поведения dragover
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  // Обработчик локального удаления изображения
  const handleDeleteLocal = (index: number) => {
    if (!formData) return;
    setFormData(prev => {
      const updatedImages = [...prev!.images];
      if (updatedImages[index] && updatedImages[index]!.preview) {
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

  // Валидация формы
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
      // Этап 1: отправка данных перевала (POST)
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
        images: [],
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

      // Успешное создание: этап 2 — отправка фотографий
      setPerevalId(data.id);
      localStorage.setItem("last_pereval_id", data.id);

      const imagesToUpload = formData.images.filter((img): img is ImageData => img !== null);
      if (imagesToUpload.length > 0) {
        setSubmitStatus("Сохранение фотографий...");
        for (let index = 0; index < imagesToUpload.length; index++) {
          const image = imagesToUpload[index];
          const fileName = generateFileName(index, formData.title, image.file);
          const formDataUpload = new FormData();
          formDataUpload.append("pereval_id", data.id);
          formDataUpload.append("image", image.file);
          formDataUpload.append("title", fileName);
          formDataUpload.append("file_name", fileName);

          console.log(`📤 Отправка изображения ${fileName}`);
          const uploadResponse = await fetch(IMAGE_API_URL, {
            method: "POST",
            body: formDataUpload,
          });

          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) {
            throw new Error(uploadData.message || `Ошибка загрузки изображения ${fileName}`);
          }
          console.log(`✅ Изображение ${fileName} успешно загружено:`, uploadData);
        }
      }

      setSubmitStatus("✅ Перевал и фотографии успешно добавлены!");
      setTimeout(() => navigate(`/pereval/${data.id}`), 1000);
    } catch (error) {
      console.error("❌ Ошибка отправки данных:", error);
      setErrorMessage(`❌ ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
      setSubmitStatus(null);
    }
  };

  if (!formData) return <p className="loading-text">Загрузка...</p>;

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