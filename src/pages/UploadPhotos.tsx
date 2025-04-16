// AlpPass/src/pages/UploadPhotos.tsx

import React, { useState } from "react"; /* Импорт React и хука useState для управления состоянием */
import { useParams, useNavigate } from "react-router-dom"; /* Импорт хуков для параметров URL и навигации */
import "../index.css"; /* Импорт глобальных стилей из файла index.css */

/* Определение интерфейса пропсов для компонента UploadPhotos */
interface UploadPhotosProps {
    darkMode: boolean; /* Пропс darkMode для указания текущей темы (true - тёмная, false - светлая) */
    toggleTheme: () => void; /* Пропс toggleTheme для переключения темы */
}

/* Определение интерфейса данных изображения */
interface ImageData {
    file: File; /* Файл изображения */
    preview: string; /* URL предпросмотра */
    title: string; /* Описание изображения (до 255 символов) */
    uploaded: boolean; /* Флаг, отправлено ли фото на сервер */
}

/* Константа с URL API для загрузки изображений */
const IMAGE_API_URL = "https://rostislav62.pythonanywhere.com/api/uploadImage/"; /* URL для отправки изображений */

/* Определение компонента UploadPhotos как функционального компонента */
const UploadPhotos: React.FC<UploadPhotosProps> = ({ darkMode, toggleTheme }) => {
    const { perevalId } = useParams<{ perevalId: string }>(); /* Получение ID перевала из URL */
    const navigate = useNavigate(); /* Хук для программной навигации */
    const [images, setImages] = useState<ImageData[]>([]); /* Состояние для хранения изображений */
    const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для сообщения об ошибке */
    const [selectedImage, setSelectedImage] = useState<string | null>(null); /* Состояние для увеличенного фото */

    /* Массив текстов для меток под полями ввода описания */
    const titleLabels = [
        "Подъём, до 255 символов",
        "Седловина, до 255 символов",
        "Спуск, до 255 символов"
    ];

    /* Обработчик выбора файлов */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files; /* Получение выбранных файлов */
        if (files) {
            const newFiles = Array.from(files); /* Преобразование в массив */
            const remainingSlots = 3 - images.length; /* Оставшееся место для фото */
            if (newFiles.length > remainingSlots) {
                setErrorMessage(`❌ Нельзя загрузить больше ${remainingSlots} фото! Удалите лишние.`); /* Ошибка при превышении лимита */
                return;
            }

            const newImages = newFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file), /* Создание URL для предпросмотра */
                title: "", /* Изначально пустое описание, сервер задаёт имя */
                uploaded: false /* Изначально не отправлено */
            }));
            setImages(prev => [...prev, ...newImages]); /* Добавление новых фото */
            setErrorMessage(null); /* Сброс ошибки */
        }
    };

    /* Обработчик изменения описания фото */
    const handleTitleChange = (index: number, value: string) => {
        if (value.length > 255) {
            setErrorMessage("❌ Описание не может превышать 255 символов!"); /* Предупреждение о лимите */
            return;
        }
        setImages(prev => {
            const updated = [...prev];
            updated[index].title = value; /* Обновление описания */
            return updated;
        });
        setErrorMessage(null); /* Сброс ошибки */
    };

    /* Обработчик удаления фото */
    const handleDelete = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index)); /* Удаление фото из списка */
        setErrorMessage(null); /* Сброс ошибки */
    };

    /* Обработчик отправки фото на сервер */
    const handleUpload = async (index: number) => {
        const image = images[index]; /* Выбор изображения */
        if (image.uploaded) {
            setErrorMessage("❌ Это фото уже отправлено!"); /* Ошибка, если фото уже отправлено */
            return;
        }

        const formData = new FormData(); /* Создание FormData для отправки */
        formData.append("pereval_id", perevalId!); /* Добавление ID перевала */
        formData.append("image", image.file); /* Добавление файла */
        formData.append("title", image.title || image.file.name); /* Добавление описания или имени файла */

        try {
            console.log("📤 Отправка изображения:", image.file.name); /* Логирование отправки */
            const response = await fetch(IMAGE_API_URL, {
                method: "POST", /* Метод запроса */
                body: formData /* Отправка FormData */
            });

            const data = await response.json(); /* Получение ответа */
            console.log("✅ Ответ от сервера (изображение):", data); /* Логирование ответа */

            if (!response.ok) {
                throw new Error(`Ошибка: ${data.message || "Неизвестная ошибка"}`);
            }

            setImages(prev => {
                const updated = [...prev];
                updated[index].uploaded = true; /* Установка флага отправки */
                return updated;
            });
        } catch (error) {
            console.error("❌ Ошибка отправки изображения:", error); /* Логирование ошибки */
            setErrorMessage(`❌ Ошибка: ${(error as Error).message}`); /* Уведомление пользователя */
        }
    };

    /* Обработчик перехода к странице деталей перевала */
    const handleNavigateToDetails = () => {
        navigate(`/pereval/${perevalId}`); /* Перенаправление на страницу деталей */
    };

    /* Обработчик увеличения фото */
    const handleImageClick = (preview: string) => {
        setSelectedImage(preview); /* Установка выбранного фото для увеличения */
    };

    /* Закрытие увеличенного фото */
    const closeModal = () => {
        setSelectedImage(null); /* Сброс увеличенного фото */
    };

    return ( /* Возврат JSX структуры компонента */
        <div className={`upload-photos-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
            <h1 className="upload-photos-title">Загрузка фотографий для перевала #{perevalId}</h1> {/* Заголовок с ID перевала */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке, если есть */}
            <div className="form-group"> {/* Группа поля ввода */}
                <label htmlFor="images">Выберите фотографии (до 3):</label> {/* Метка для поля */}
                <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*" /* Только изображения */
                    multiple /* Возможность выбора нескольких файлов */
                    onChange={handleImageChange}
                    className="upload-photos-input"
                    disabled={images.length >= 3} /* Блокировка, если уже 3 фото */
                /> {/* Поле выбора файлов */}
            </div>
            <div className="image-list"> {/* Контейнер для списка фото */}
                {images.map((img, index) => (
                    <div key={index} className="image-item"> {/* Элемент списка фото */}
                        <img
                            src={img.preview}
                            alt={`Фото ${index + 1}`}
                            className="image-preview"
                            onClick={() => handleImageClick(img.preview)} /* Увеличение по клику */
                        /> {/* Предпросмотр фото */}
                        <div className="form-group"> {/* Группа поля ввода описания */}
                            <label htmlFor={`title-${index}`}>{titleLabels[index]}</label> {/* Метка с индивидуальным текстом */}
                            <input
                                type="text"
                                id={`title-${index}`}
                                value={img.title}
                                onChange={(e) => handleTitleChange(index, e.target.value)}
                                className="upload-photos-input"
                                maxLength={255} /* Ограничение длины */
                                disabled={img.uploaded} /* Блокировка после отправки */
                            /> {/* Поле ввода описания */}
                        </div>
                        <div className="image-actions"> {/* Контейнер для кнопок */}
                            <button
                                onClick={() => handleUpload(index)}
                                className="upload-btn"
                                disabled={img.uploaded} /* Блокировка после отправки */
                            >
                                {img.uploaded ? "Отправлено" : "Отправить"} {/* Условный текст кнопки */}
                            </button>
                            <button
                                onClick={() => handleDelete(index)}
                                className="delete-btn"
                                disabled={img.uploaded} /* Блокировка после отправки */
                            >
                                Удалить {/* Кнопка удаления */}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={handleNavigateToDetails}
                className="submit-btn"
            >
                Перейти к деталям
            </button> {/* Кнопка для перехода к странице деталей перевала */}
            {selectedImage && ( /* Модальное окно для увеличенного фото */
                <div className="modal" onClick={closeModal}> {/* Контейнер модального окна */}
                    <img src={selectedImage} alt="Увеличенное фото" className="modal-image" /> {/* Увеличенное фото */}
                </div>
            )}
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка переключения темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Условный текст кнопки */}
            </button> {/* Закрывающий тег кнопки переключения темы */}
        </div> /* Закрывающий тег главного контейнера */
    ); /* Конец возвращаемого JSX */
};

export default UploadPhotos; /* Экспорт компонента UploadPhotos как основного */