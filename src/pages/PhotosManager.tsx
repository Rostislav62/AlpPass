// AlpPass/src/pages/PhotosManager.tsx

import React, { useState, useEffect } from "react"; /* Импорт React и хуков */
import { useParams, useNavigate } from "react-router-dom"; /* Импорт хуков для параметров и навигации */
import "../index.css"; /* Импорт глобальных стилей */

/* Интерфейс пропсов для PhotosManager */
interface PhotosManagerProps {
    darkMode: boolean; /* Пропс для тёмной темы */
    toggleTheme: () => void; /* Пропс для переключения темы */
}

/* Интерфейс данных локального изображения */
interface ImageData {
    file: File; /* Файл изображения */
    preview: string; /* URL превью */
    uploaded: boolean; /* Флаг загрузки */
}

/* Интерфейс данных серверного фото */
interface Photo {
    id: number; /* ID фото */
    file_name: string; /* Имя файла */
    title: string; /* Название */
}

/* Константы URL для API */
const BASE_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; /* Базовый URL API */
const IMAGE_API_URL = `${BASE_URL}/api/uploadImage/`; /* URL для загрузки изображения */
const PHOTOS_API_URL = `${BASE_URL}/api/uploadImage/photos/`; /* URL для получения фото */
const DELETE_API_URL = `${BASE_URL}/api/uploadImage/delete/`; /* URL для удаления фото */
const MEDIA_URL = `${BASE_URL}/media/`; /* URL для медиафайлов */

/* Названия слотов */
const slotLabels = ["Подъём", "Седловина", "Спуск"];

/* Компонент PhotosManager */
const PhotosManager: React.FC<PhotosManagerProps> = ({ darkMode, toggleTheme }) => {
    const { perevalId } = useParams<{ perevalId: string }>(); /* Получение ID перевала из URL */
    const navigate = useNavigate(); /* Хук для навигации */
    const [slots, setSlots] = useState<Array<ImageData | Photo | null>>([null, null, null]); /* Состояние для 3 слотов */
    const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для ошибки */
    const [selectedImage, setSelectedImage] = useState<string | null>(null); /* Состояние для увеличенного фото */
    const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null); /* Состояние для подтверждения удаления */
    const [uploading, setUploading] = useState<number | null>(null); /* Состояние для индикатора загрузки */

    /* Очистка URL.createObjectURL для локальных превью */
    useEffect(() => {
        return () => {
            slots.forEach(slot => {
                if (slot && (slot as ImageData).preview) {
                    URL.revokeObjectURL((slot as ImageData).preview); /* Освобождаем память */
                }
            });
        };
    }, [slots]);

    /* Загрузка серверных фото при монтировании */
    useEffect(() => {
        if (!perevalId) return; /* Если ID нет, прерываем */
        fetch(`${PHOTOS_API_URL}${perevalId}/`) /* Запрос к API для получения фото */
            .then(async response => {
                const data = await response.json(); /* Парсим ответ */
                console.log("📥 Ответ от сервера (фото):", data); /* Логируем для отладки */
                if (!response.ok) throw new Error(data.message || "Ошибка загрузки фото"); /* Ошибка, если не 200 */
                if (data.state === 1 && Array.isArray(data.photos)) { /* Проверяем валидность данных */
                    const newSlots = [null, null, null] as Array<ImageData | Photo | null>; /* Инициализируем пустые слоты */
                    data.photos.forEach((photo: Photo) => {
                        /* Распределяем фото по слотам на основе префикса */
                        const fileName = photo.file_name.toLowerCase();
                        if (fileName.startsWith("1_")) newSlots[0] = photo;
                        else if (fileName.startsWith("2_")) newSlots[1] = photo;
                        else if (fileName.startsWith("3_")) newSlots[2] = photo;
                        else {
                            /* Если префикса нет, помещаем в первый свободный слот */
                            const freeSlot = newSlots.findIndex(slot => slot === null);
                            if (freeSlot !== -1) newSlots[freeSlot] = photo;
                        }
                    });
                    setSlots(newSlots); /* Устанавливаем слоты */
                }
            })
            .catch(error => { /* Обрабатываем ошибки */
                console.error("Ошибка загрузки фотографий:", error); /* Логируем ошибку */
                setErrorMessage("Ошибка загрузки фотографий."); /* Устанавливаем сообщение */
                setSlots([null, null, null]); /* Сбрасываем слоты */
            });
    }, [perevalId]); /* Зависимость от perevalId */

    /* Обработчик выбора файла для слота */
    const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files; /* Получаем файлы */
        if (files && files.length > 0) { /* Если файл выбран */
            const file = files[0]; /* Берём только первый файл */
            const newImage: ImageData = {
                file,
                preview: URL.createObjectURL(file), /* Генерируем URL превью */
                uploaded: false /* Флаг загрузки */
            };
            setSlots(prev => {
                const updated = [...prev];
                updated[index] = newImage; /* Помещаем в выбранный слот */
                return updated;
            });
            setErrorMessage(null); /* Сбрасываем ошибку */
            e.target.value = ""; /* Сбрасываем input для повторного выбора */
        }
    };

    /* Обработчик Drag-and-Drop */
    const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); /* Предотвращаем открытие файла */
        const files = e.dataTransfer.files; /* Получаем файлы */
        if (files && files.length > 0) { /* Если файл перетащен */
            const file = files[0]; /* Берём только первый файл */
            if (!file.type.startsWith("image/")) { /* Проверяем, что это изображение */
                setErrorMessage("❌ Пожалуйста, перетащите изображение!"); /* Устанавливаем ошибку */
                return;
            }
            const newImage: ImageData = {
                file,
                preview: URL.createObjectURL(file), /* Генерируем URL превью */
                uploaded: false /* Флаг загрузки */
            };
            setSlots(prev => {
                const updated = [...prev];
                updated[index] = newImage; /* Помещаем в выбранный слот */
                return updated;
            });
            setErrorMessage(null); /* Сбрасываем ошибку */
        }
    };

    /* Обработчик для предотвращения стандартного поведения dragover */
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); /* Разрешаем drop */
    };

    /* Обработчик удаления локального фото */
    const handleDeleteLocal = (index: number) => {
        setSlots(prev => {
            const updated = [...prev];
            if (updated[index] && (updated[index] as ImageData).preview) {
                URL.revokeObjectURL((updated[index] as ImageData).preview); /* Освобождаем память */
            }
            updated[index] = null; /* Очищаем слот */
            return updated;
        });
        setErrorMessage(null); /* Сбрасываем ошибку */
    };

    /* Обработчик удаления серверного фото */
    const handleDeleteServer = async (photoId: number, index: number) => {
        if (showConfirmDelete === null) { /* Если подтверждение ещё не показано */
            setShowConfirmDelete(photoId); /* Показываем подтверждение */
            return;
        }

        if (showConfirmDelete === photoId) { /* Если подтверждение активно для этого фото */
            const email = localStorage.getItem("user_email"); /* Получаем email пользователя */
            if (!email) { /* Если email нет */
                setErrorMessage("❌ Email пользователя не найден. Пожалуйста, войдите."); /* Устанавливаем ошибку */
                setShowConfirmDelete(null); /* Сбрасываем подтверждение */
                return;
            }

            try {
                const response = await fetch(`${DELETE_API_URL}${photoId}/`, { /* Запрос на удаление */
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email }) /* Отправляем email */
                });

                const data = await response.json(); /* Парсим ответ */
                if (response.status === 200 && data.state === 1) { /* Если удаление успешно */
                    setSlots(prev => {
                        const updated = [...prev];
                        updated[index] = null; /* Очищаем слот */
                        return updated;
                    });
                    setErrorMessage(null); /* Сбрасываем ошибку */
                } else if (response.status === 400) { /* Если статус не позволяет удалить */
                    setErrorMessage(`❌ ${data.message || "Удаление запрещено: статус не new"}`); /* Устанавливаем ошибку */
                } else if (response.status === 403) { /* Если нет прав */
                    setErrorMessage(`❌ ${data.message || "У вас нет прав на удаление этой фотографии"}`); /* Устанавливаем ошибку */
                } else if (response.status === 404) { /* Если фото не найдено */
                    setErrorMessage(`❌ ${data.message || "Фотография не найдена"}`); /* Устанавливаем ошибку */
                } else {
                    throw new Error("Неизвестная ошибка при удалении"); /* Другая ошибка */
                }
            } catch (error) { /* Обрабатываем ошибки сети */
                console.error("Ошибка удаления фотографии:", error); /* Логируем ошибку */
                setErrorMessage("❌ Ошибка при удалении фотографии"); /* Устанавливаем сообщение */
            } finally {
                setShowConfirmDelete(null); /* Сбрасываем подтверждение */
            }
        }
    };

    /* Обработчик отправки фото на сервер */
    const handleUpload = async (index: number) => {
        const image = slots[index] as ImageData; /* Получаем локальное фото */
        if (!image || image.uploaded) { /* Если уже загружено или слот пуст */
            setErrorMessage("❌ Это фото уже отправлено!"); /* Устанавливаем ошибку */
            return;
        }

        setUploading(index); /* Включаем индикатор загрузки */
        const formData = new FormData(); /* Создаём объект для отправки формы */
        formData.append("pereval_id", perevalId!); /* Добавляем ID перевала */
        formData.append("image", image.file); /* Добавляем файл */
        const prefix = index === 0 ? "1_" : index === 1 ? "2_" : "3_"; /* Определяем префикс */
        formData.append("title", `${prefix}${image.file.name}`); /* Добавляем имя с префиксом */

        try {
            const response = await fetch(IMAGE_API_URL, { /* Запрос на загрузку */
                method: "POST",
                body: formData
            });
            const data = await response.json(); /* Парсим ответ */
            if (!response.ok) throw new Error(data.message || "Ошибка загрузки"); /* Ошибка, если не 200 */

            setSlots(prev => {
                const updated = [...prev];
                updated[index] = { ...image, uploaded: true }; /* Помечаем как загруженное */
                return updated;
            });

            /* Проверяем, все ли локальные фото отправлены */
            const allUploaded = slots.every(slot => !slot || (slot as ImageData).uploaded || (slot as Photo).id);
            if (allUploaded) { /* Если все слоты отправлены или пусты */
                setTimeout(() => navigate(`/pereval/${perevalId}`), 1000); /* Переход к деталям через 1 секунду */
            }
        } catch (error) { /* Обрабатываем ошибки */
            console.error("❌ Ошибка отправки изображения:", error); /* Логируем ошибку */
            setErrorMessage(`❌ Ошибка: ${(error as Error).message}`); /* Устанавливаем сообщение */
        } finally {
            setUploading(null); /* Сбрасываем индикатор загрузки */
        }
    };

    /* Обработчик клика по фото для увеличения */
    const handleImageClick = (preview: string) => {
        setSelectedImage(preview); /* Показываем увеличенное фото */
    };

    /* Обработчик закрытия модального окна */
    const closeModal = () => {
        setSelectedImage(null); /* Скрываем увеличенное фото */
        setShowConfirmDelete(null); /* Сбрасываем подтверждение удаления */
    };

    return ( /* JSX для рендеринга */
        <div className={`upload-photos-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */
            <h1 className="upload-photos-title">
                {slots.every(slot => slot === null) ? "Добавление фотографий" : "Редактирование фотографий"} для перевала #{perevalId}
            </h1> {/* Динамический заголовок */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке */}

            <div className="photo-slots"> {/* Контейнер для слотов */}
                {slots.map((slot, index) => (
                    <div key={index} className="photo-slot"> {/* Слот для фото */}
                        {slot === null ? (
                            /* Пустой слот */
                            <label className="photo-placeholder" onDragOver={handleDragOver} onDrop={(e) => handleDrop(index, e)}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(index, e)}
                                    className="hidden-input"
                                />
                                <span className="slot-label">Выберите фото, нажав здесь</span>
                                <span className="slot-label slot-title">{slotLabels[index]}</span>
                            </label>
                        ) : (slot as ImageData).file ? (
                            /* Локальное фото */
                            <div className="image-item">
                                <img
                                    src={(slot as ImageData).preview}
                                    alt={slotLabels[index]}
                                    className="image-preview"
                                    onClick={() => handleImageClick((slot as ImageData).preview)}
                                />
                                <span className="slot-label slot-title">{slotLabels[index]}</span>
                                <div className="image-actions">
                                    <button
                                        onClick={() => handleUpload(index)}
                                        className="submit-btn"
                                        disabled={(slot as ImageData).uploaded || uploading === index}
                                    >
                                        {(slot as ImageData).uploaded ? "Отправлено" : uploading === index ? (
                                            <span className="spinner"></span>
                                        ) : (
                                            "Отправить"
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLocal(index)}
                                        className="delete-btn"
                                        disabled={(slot as ImageData).uploaded}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Серверное фото */
                            <div className="photo-item">
                                <img
                                    src={`${MEDIA_URL}${(slot as Photo).file_name.replace("\\", "/")}`}
                                    alt={(slot as Photo).title || (slot as Photo).file_name}
                                    className="image-preview"
                                    onClick={() =>
                                        handleImageClick(`${MEDIA_URL}${(slot as Photo).file_name.replace("\\", "/")}`)
                                    }
                                />
                                <span className="slot-label slot-title">{slotLabels[index]}</span>
                                <div className="image-actions">
                                    <button
                                        onClick={() => handleDeleteServer((slot as Photo).id, index)}
                                        className="delete-btn"
                                    >
                                        Удалить
                                    </button>
                                </div>
                                {showConfirmDelete === (slot as Photo).id && (
                                    <div className="confirm-modal">
                                        <div className="confirm-modal-content">
                                            <p>Вы уверены? Фото будет удалено с сервера без возможности восстановления.</p>
                                            <button
                                                onClick={() => handleDeleteServer((slot as Photo).id, index)}
                                                className="submit-btn"
                                            >
                                                Да
                                            </button>
                                            <button onClick={closeModal} className="delete-btn">
                                                Нет
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedImage && (
                /* Модальное окно для увеличенного фото */
                <div className="modal" onClick={closeModal}>
                    <img src={selectedImage} alt="Увеличенное фото" className="modal-image" />
                </div>
            )}
            <button onClick={toggleTheme} className="theme-btn">
                {darkMode ? "Светлая тема" : "Тёмная тема"}
            </button> {/* Кнопка смены темы */}
        </div>
    );
};

export default PhotosManager; /* Экспорт компонента */