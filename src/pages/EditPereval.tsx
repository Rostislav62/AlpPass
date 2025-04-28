import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateFileName } from "../utils/generateFileName";
import { loadImages } from "../utils/loadImages";
import { uploadImages } from "../utils/uploadImages";
import "../index.css";

// 📌 Интерфейс пропсов компонента
interface EditPerevalProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

// 📌 Интерфейс данных локального изображения
export interface ImageData {
  file?: File;
  preview: string;
  title: string;
  id?: number;
  data?: string;
  isModified: boolean;
}

// 📌 Интерфейс данных формы
export interface PerevalFormData {
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

// 📌 Интерфейс ответа сервера для типизации в handleSubmit
interface PerevalResponse {
  state: number;
  message?: string;
}

// 📌 Списки сезонов и сложностей
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

// 📌 Базовые URL API
const BASE_URL = "https://rostislav62.pythonanywhere.com";
const API_URL = `${BASE_URL}/api/submitData/`;
// const IMAGE_API_URL = `${BASE_URL}/api/uploadImage/`;
// const MEDIA_URL = `${BASE_URL}/media/`;

// 📌 Названия слотов для фотографий
const slotLabels = ["Подъём", "Седловина", "Спуск"];

// 📌 Компонент EditPereval
const EditPereval: React.FC<EditPerevalProps> = ({ darkMode, toggleTheme }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PerevalFormData | null>(null);
  const [initialFormData, setInitialFormData] = useState<PerevalFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const userEmail = localStorage.getItem("user_email") || "";
  const userPhone = localStorage.getItem("user_phone") || "";

  // 📌 Загрузка данных перевала
  useEffect(() => {
    if (!id) {
      console.error("❌ Ошибка: ID перевала отсутствует!");
      setErrorMessage("Ошибка: невозможно загрузить перевал без ID.");
      return;
    }

    fetch(`${API_URL}${id}/info/`)
      .then(async response => {
        const text = await response.text();
        console.log("📥 Ответ от сервера (перевал):", text);
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error("❌ Ошибка парсинга JSON:", text);
          throw new Error("Сервер вернул не JSON-ответ");
        }
      })
      .then((data: any) => {
        if (
          data.status === 1 &&
          data.user.email.trim().toLowerCase() === userEmail.trim().toLowerCase() &&
          data.user.phone.replace(/\s+/g, "") === userPhone.replace(/\s+/g, "")
        ) {
          const season = seasons.find(s => s.code === data.difficulties[0]?.season?.code) || { id: 0 };
          const difficulty = difficulties.find(d => d.code === data.difficulties[0]?.difficulty?.code) || { id: 0 };

          const images = loadImages(data.images || []);

          const formData = {
            beautyTitle: data.beautyTitle || "",
            title: data.title || "",
            other_titles: data.other_titles || "",
            connect: data.connect || true,
            user: {
              email: data.user.email || "",
              family_name: data.user.family_name || "",
              first_name: data.user.first_name || "",
              father_name: data.user.father_name || "",
              phone: data.user.phone || "",
            },
            coord: {
              latitude: data.coord.latitude?.toString() || "",
              longitude: data.coord.longitude?.toString() || "",
              height: data.coord.height?.toString() || "",
            },
            status: data.status || 1,
            difficulties: [{ season: season.id, difficulty: difficulty.id }],
            route_description: data.route_description || "",
            images,
          };

          setFormData(formData);
          setInitialFormData(formData);
        } else {
          setErrorMessage("Редактирование запрещено! Либо статус не new, либо данные пользователя не совпадают.");
        }
      })
      .catch(error => {
        console.error("❌ Ошибка загрузки перевала:", error);
        setErrorMessage("❌ Ошибка загрузки данных перевала");
      });
  }, [id, userEmail, userPhone]);

  // 📌 Очистка URL.createObjectURL для локальных превью
  useEffect(() => {
    return () => {
      if (formData?.images) {
        formData.images.forEach(image => {
          if (image && image.preview && !image.id && image.isModified) {
            URL.revokeObjectURL(image.preview);
          }
        });
      }
    };
  }, [formData?.images]);

  // 📌 Обработчик изменения текстовых полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    console.log(`✏️ Изменение поля ${name}:`, value);
    setFormData(prev => ({
      ...prev!,
      [name]: value,
    }));
  };

  // 📌 Обработчик изменения координат
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

  // 📌 Обработчик получения GPS-координат
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

  // 📌 Обработчик изменения сезона/сложности
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

  // 📌 Обработчик выбора файла для слота изображения
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!formData || !files || files.length === 0) return;
    const file = files[0];

    // 📌 Проверяем формат файла
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

    // 📌 Генерируем имя файла
    const fileName = generateFileName(index, formData.title, file);

    // 📌 Создаём объект для нового изображения
    const newImage: ImageData = {
      file,
      preview: URL.createObjectURL(file),
      title: fileName,
      data: `pereval_images/${fileName}`,
      isModified: true,
      id: formData.images[index]?.id,
    };

    // 📌 Выводим сообщение в консоль
    console.log(`📷 Новое изображение добавлено в слот ${index} (${slotLabels[index]}) локально: ${fileName}${newImage.id ? `, заменяет ID ${newImage.id}` : ''}`);

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
    e.target.value = "";
  };

  // 📌 Обработчик Drag-and-Drop для изображений
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

      // 📌 Генерируем имя файла
      const fileName = generateFileName(index, formData.title, file);

      // 📌 Создаём объект для нового изображения
      const newImage: ImageData = {
        file,
        preview: URL.createObjectURL(file),
        title: fileName,
        data: `pereval_images/${fileName}`,
        isModified: true,
        id: formData.images[index]?.id,
      };

      // 📌 Выводим сообщение в консоль
      console.log(`📷 Новое изображение добавлено в слот ${index} (${slotLabels[index]}) через Drag-and-Drop: ${fileName}${newImage.id ? `, заменяет ID ${newImage.id}` : ''}`);

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

  // 📌 Обработчик удаления изображения
  const handleDeleteImage = (index: number) => {
    if (!formData) return;
    const image = formData.images[index];
    if (!image) {
      console.log(`🗑️ Слот ${index} (${slotLabels[index]}) уже пуст`);
      return;
    }

    // 📌 Выводим сообщение в консоль
    console.log(`🗑️ Изображение в слоте ${index} (${slotLabels[index]}) удалено локально: ${image.title}${image.id ? ` (ID ${image.id})` : ''}`);

    // 📌 Обновляем массив изображений, очищая слот
    setFormData(prev => {
      const updatedImages = [...prev!.images];
      if (updatedImages[index]?.preview && updatedImages[index]?.isModified) {
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

  // 📌 Закрытие модального окна сезона
  const confirmSeasonModal = () => {
    setShowSeasonModal(false);
  };

  // 📌 Закрытие модального окна сложности
  const confirmDifficultyModal = () => {
    setShowDifficultyModal(false);
  };

  // 📌 Получение текста для выбранного сезона
  const getSeasonText = () => {
    if (!formData) return "Выберите сезон";
    const seasonId = formData.difficulties[0].season;
    const season = seasons.find(s => s.id === seasonId);
    return season ? `${season.name} (${season.code})` : "Выберите сезон";
  };

  // 📌 Получение текста для выбранной сложности
  const getDifficultyText = () => {
    if (!formData) return "Выберите категорию";
    const difficultyId = formData.difficulties[0].difficulty;
    const difficulty = difficulties.find(d => d.id === difficultyId);
    return difficulty ? `${difficulty.code} - ${difficulty.description}` : "Выберите категорию";
  };

  // 📌 Валидация формы
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

  // 📌 Обработчик для предотвращения закрытия модального окна
  const handleModalContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // 📌 Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !initialFormData || !id) return;

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
      // 📌 Шаг 1 и 2: Удаление и загрузка фотографий
      await uploadImages(formData, initialFormData, id, slotLabels);

      // 📌 Шаг 3: Формируем данные для обновления перевала (без поля images)
      const updatedData: any = { email: formData.user.email };

      if (formData.beautyTitle !== initialFormData.beautyTitle) {
        updatedData.beautyTitle = formData.beautyTitle;
      }
      if (formData.title !== initialFormData.title) {
        updatedData.title = formData.title;
      }
      if (formData.other_titles !== initialFormData.other_titles) {
        updatedData.other_titles = formData.other_titles;
      }
      if (formData.route_description !== initialFormData.route_description) {
        updatedData.route_description = formData.route_description;
      }
      if (
        formData.coord.latitude !== initialFormData.coord.latitude ||
        formData.coord.longitude !== initialFormData.coord.longitude ||
        formData.coord.height !== initialFormData.coord.height
      ) {
        updatedData.coord = {
          latitude: Number(formData.coord.latitude),
          longitude: Number(formData.coord.longitude),
          height: Number(formData.coord.height),
        };
      }
      if (
        formData.difficulties[0].season !== initialFormData.difficulties[0].season ||
        formData.difficulties[0].difficulty !== initialFormData.difficulties[0].difficulty
      ) {
        updatedData.difficulties = [
          {
            season: formData.difficulties[0].season,
            difficulty: formData.difficulties[0].difficulty,
          },
        ];
      }

      // 📌 Отправляем обновление перевала
      console.log("📤 Отправка обновления перевала:", updatedData);

      const response = await fetch(`${API_URL}${id}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data: PerevalResponse = await response.json();
      console.log("✅ Ответ от сервера (PATCH):", data);

      if (response.status !== 200 || data.state !== 1) {
        throw new Error(data.message || "Ошибка обновления перевала");
      }

      setSubmitStatus("✅ Перевал успешно обновлён!");
      setTimeout(() => navigate(`/pereval/${id}`), 2000);
    } catch (error) {
      console.error("❌ Ошибка обновления данных:", error);
      setErrorMessage(`❌ ${error instanceof Error ? error.message : "Ошибка сервера, попробуйте позже"}`);
      setSubmitStatus(null);
    }
  };

  // 📌 Рендеринг компонента
  if (!formData) return <p className="loading-text">Загрузка...</p>;

  return (
    <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <h1 className="submit-title">Редактировать перевал</h1>
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
              rows={5}
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
          <h2 className="upload-photos-title">Редактирование фотографий</h2>
          <div className="photo-slots">
            {[0, 1, 2].map(index => (
              <div key={index} className="photo-slot">
                {formData.images[index] === null ? (
                  // 📌 Пустой слот
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
                  // 📌 Загруженное изображение
                  <div className="image-item">
                    <img
                      src={formData.images[index]!.preview}
                      alt={slotLabels[index]}
                      className="image-preview"
                      onError={() => console.error(`❌ Ошибка загрузки изображения: ${formData.images[index]!.preview}`)}
                    />
                    <span className="slot-label slot-title">{slotLabels[index]}</span>
                    <div className="image-actions">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
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

        <button type="submit" className="submit-btn">Сохранить изменения</button>
      </form>

      {showSeasonModal && (
        <div className="modal" onClick={() => setShowSeasonModal(false)}>
          <div className="modal-content" onClick={handleModalContentClick}>
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
          <div className="modal-content" onClick={handleModalContentClick}>
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

export default EditPereval;