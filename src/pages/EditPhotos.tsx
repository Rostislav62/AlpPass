import React, { useState, useEffect } from "react"; // Импорт React и хуков
import { useParams, useNavigate } from "react-router-dom"; // Импорт хуков для параметров и навигации
import "../index.css"; // Импорт глобальных стилей

// Интерфейс пропсов для EditPhotos
interface EditPhotosProps {
    darkMode: boolean; // Пропс для тёмной темы
    toggleTheme: () => void; // Пропс для переключения темы
}

// Интерфейс данных нового изображения
interface ImageData {
    file: File; // Файл изображения
    preview: string; // URL превью
    title: string; // Название
    uploaded: boolean; // Флаг загрузки
}

// Интерфейс данных существующего фото
interface Photo {
    id: number; // ID фото
    file_name: string; // Имя файла
    title: string; // Название
}

// Константы URL для API
const BASE_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API
const IMAGE_API_URL = `${BASE_URL}/api/uploadImage/`; // URL для загрузки изображения
const PHOTOS_API_URL = `${BASE_URL}/api/uploadImage/photos/`; // URL для получения фото
const DELETE_API_URL = `${BASE_URL}/api/uploadImage/delete/`; // URL для удаления фото
const MEDIA_URL = `${BASE_URL}/media/`; // URL для медиафайлов

// Компонент EditPhotos
const EditPhotos: React.FC<EditPhotosProps> = ({ darkMode, toggleTheme }) => {
    const { id } = useParams<{ id: string }>(); // Получаем ID перевала из URL
    const navigate = useNavigate(); // Хук для навигации
    const [currentPhotos, setCurrentPhotos] = useState<Photo[]>([]); // Состояние для текущих фото
    const [newImages, setNewImages] = useState<ImageData[]>([]); // Состояние для новых фото
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибки
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Состояние для увеличенного фото
    const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null); // Состояние для подтверждения удаления

    useEffect(() => { // Хук для загрузки текущих фото при монтировании
        if (!id) return; // Если ID нет, прерываем
        fetch(`${PHOTOS_API_URL}${id}/`) // Запрос к API для получения фото
            .then(async response => {
                const data = await response.json(); // Парсим ответ
                console.log("📥 Ответ от сервера (фото):", data); // Логируем для отладки
                if (!response.ok) throw new Error(data.message || "Ошибка загрузки фото"); // Ошибка, если не 200
                if (data.state === 1 && Array.isArray(data.photos)) { // Проверяем валидность данных
                    setCurrentPhotos(data.photos); // Устанавливаем текущие фото
                } else {
                    setCurrentPhotos([]); // Если данных нет, пустой массив
                }
            })
            .catch(error => { // Обрабатываем ошибки
                console.error("Ошибка загрузки фотографий:", error); // Логируем ошибку
                setErrorMessage("Ошибка загрузки текущих фотографий."); // Устанавливаем сообщение
                setCurrentPhotos([]); // Сбрасываем фото
            });
    }, [id]); // Зависимость от ID перевала

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Обработчик выбора новых фото
        const files = e.target.files; // Получаем файлы
        if (files) { // Если файлы выбраны
            const newFiles = Array.from(files); // Преобразуем в массив
            const remainingSlots = 3 - (currentPhotos.length + newImages.length); // Оставшиеся слоты
            if (newFiles.length > remainingSlots) { // Проверяем лимит
                setErrorMessage(`❌ Нельзя загрузить больше ${remainingSlots} фото!`); // Устанавливаем ошибку
                return;
            }

            const newImagesData = newFiles.map(file => ({ // Создаём данные для новых фото
                file,
                preview: URL.createObjectURL(file), // Генерируем URL превью
                title: "", // Пустое название
                uploaded: false // Флаг загрузки
            }));
            setNewImages(prev => [...prev, ...newImagesData]); // Добавляем новые фото в состояние
            setErrorMessage(null); // Сбрасываем ошибку
        }
    };

    const handleTitleChange = (index: number, value: string) => { // Обработчик изменения названия
        if (value.length > 255) { // Проверяем лимит символов
            setErrorMessage("❌ Описание не может превышать 255 символов!"); // Устанавливаем ошибку
            return;
        }
        setNewImages(prev => { // Обновляем состояние
            const updated = [...prev];
            updated[index].title = value; // Меняем название
            return updated;
        });
        setErrorMessage(null); // Сбрасываем ошибку
    };

    const handleDeleteNewImage = (index: number) => { // Обработчик удаления нового фото
        setNewImages(prev => prev.filter((_, i) => i !== index)); // Удаляем фото из состояния
        setErrorMessage(null); // Сбрасываем ошибку
    };

    const handleDeleteCurrentPhoto = async (photoId: number) => { // Обработчик удаления текущего фото
        if (showConfirmDelete === null) { // Если подтверждение ещё не показано
            setShowConfirmDelete(photoId); // Показываем подтверждение
            return;
        }

        if (showConfirmDelete === photoId) { // Если подтверждение активно для этого фото
            const email = localStorage.getItem("user_email"); // Получаем email пользователя
            if (!email) { // Если email нет
                setErrorMessage("❌ Email пользователя не найден. Пожалуйста, войдите."); // Устанавливаем ошибку
                setShowConfirmDelete(null); // Сбрасываем подтверждение
                return;
            }

            try {
                const response = await fetch(`${DELETE_API_URL}${photoId}/`, { // Запрос на удаление
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email }) // Отправляем email в теле запроса
                });

                const data = await response.json(); // Парсим ответ
                if (response.status === 200 && data.state === 1) { // Если удаление успешно
                    setCurrentPhotos(prev => prev.filter(photo => photo.id !== photoId)); // Удаляем фото из состояния
                    setErrorMessage(null); // Сбрасываем ошибку
                } else if (response.status === 400) { // Если статус не позволяет удалить
                    setErrorMessage(`❌ ${data.message || "Удаление запрещено: статус не new"}`); // Устанавливаем ошибку
                } else if (response.status === 403) { // Если нет прав
                    setErrorMessage(`❌ ${data.message || "У вас нет прав на удаление этой фотографии"}`); // Устанавливаем ошибку
                } else if (response.status === 404) { // Если фото не найдено
                    setErrorMessage(`❌ ${data.message || "Фотография не найдена"}`); // Устанавливаем ошибку
                } else {
                    throw new Error("Неизвестная ошибка при удалении"); // Другая ошибка
                }
            } catch (error) { // Обрабатываем ошибки сети
                console.error("Ошибка удаления фотографии:", error); // Логируем ошибку
                setErrorMessage("❌ Ошибка при удалении фотографии"); // Устанавливаем сообщение
            } finally {
                setShowConfirmDelete(null); // Сбрасываем подтверждение
            }
        }
    };

    const cancelDelete = () => { // Обработчик отмены удаления
        setShowConfirmDelete(null); // Сбрасываем подтверждение
    };

    const handleUpload = async (index: number) => { // Обработчик загрузки нового фото
        const image = newImages[index]; // Получаем фото по индексу
        if (image.uploaded) { // Если уже загружено
            setErrorMessage("❌ Это фото уже отправлено!"); // Устанавливаем ошибку
            return;
        }

        const formData = new FormData(); // Создаём объект для отправки формы
        formData.append("pereval_id", id!); // Добавляем ID перевала
        formData.append("image", image.file); // Добавляем файл изображения
        formData.append("title", image.title || image.file.name); // Добавляем название

        try {
            const response = await fetch(IMAGE_API_URL, { // Запрос на загрузку
                method: "POST",
                body: formData
            });
            const data = await response.json(); // Парсим ответ
            if (!response.ok) throw new Error(data.message || "Ошибка загрузки"); // Ошибка, если не 200

            setNewImages(prev => { // Обновляем состояние
                const updated = [...prev];
                updated[index].uploaded = true; // Помечаем как загруженное
                return updated;
            });

            const allUploaded = newImages.every(img => img.uploaded); // Проверяем, все ли загружены
            if (allUploaded && newImages.length > 0) { // Если все загружены
                setTimeout(() => navigate("/menu"), 1000); // Переход на меню через 1 секунду
            }
        } catch (error) { // Обрабатываем ошибки
            console.error("❌ Ошибка отправки изображения:", error); // Логируем ошибку
            setErrorMessage(`❌ Ошибка: ${(error as Error).message}`); // Устанавливаем сообщение
        }
    };

    const handleImageClick = (preview: string) => { // Обработчик клика по фото
        setSelectedImage(preview); // Показываем увеличенное фото
    };

    const closeModal = () => { // Обработчик закрытия модального окна
        setSelectedImage(null); // Скрываем увеличенное фото
    };

    return ( // JSX для рендеринга
        <div className={`upload-photos-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1 className="upload-photos-title">Редактирование фотографий для перевала #{id}</h1> {/* Заголовок */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке */}

            <fieldset className="submit-section"> {/* Секция текущих фото */}
                <legend>Текущие фотографии</legend> {/* Заголовок секции */}
                <div className="current-photos-list"> {/* Список текущих фото */}
                    {currentPhotos.length > 0 ? ( // Если фото есть
                        currentPhotos.map(photo => ( // Перебираем фото
                            <div key={photo.id} className="photo-item"> {/* Элемент фото */}
                                <img
                                    src={`${MEDIA_URL}${photo.file_name.replace("\\", "/")}`} // Путь к фото
                                    alt={photo.title || photo.file_name} // Альтернативный текст
                                    className="photo-preview" // Класс для стилей
                                    onClick={() => handleImageClick(`${MEDIA_URL}${photo.file_name.replace("\\", "/")}`)} // Обработчик клика
                                />
                                <span>{photo.title || photo.file_name}</span> {/* Название */}
                                <button
                                    onClick={() => handleDeleteCurrentPhoto(photo.id)} // Обработчик удаления
                                    className="delete-btn" // Класс для стилей
                                >
                                    Удалить
                                </button>
                                {showConfirmDelete === photo.id && ( // Если активно подтверждение
                                    <div className="confirm-modal"> {/* Модальное окно подтверждения */}
                                        <p>Вы уверены? Фото будет удалено с сервера без возможности восстановления.</p> {/* Текст */}
                                        <button onClick={() => handleDeleteCurrentPhoto(photo.id)} className="submit-btn"> {/* Кнопка "Да" */}
                                            Да
                                        </button>
                                        <button onClick={cancelDelete} className="delete-btn"> {/* Кнопка "Нет" */}
                                            Нет
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Фотографии отсутствуют. Добавьте новые ниже.</p> // Сообщение, если фото нет
                    )}
                </div>
            </fieldset>

            <fieldset className="submit-section"> {/* Секция новых фото */}
                <legend>Добавить новые фотографии</legend> {/* Заголовок секции */}
                <div className="form-group"> {/* Группа формы */}
                    <label htmlFor="images">Выберите фотографии (до 3):</label> {/* Подпись */}
                    <input
                        type="file" // Тип — файл
                        id="images" // ID для label
                        name="images" // Имя поля
                        accept="image/*" // Только изображения
                        multiple // Множественный выбор
                        onChange={handleImageChange} // Обработчик выбора
                        className="upload-photos-input" // Класс для стилей
                        disabled={currentPhotos.length + newImages.length >= 3} // Блокировка при лимите
                    />
                </div>
                <div className="image-list"> {/* Список новых фото */}
                    {newImages.map((img, index) => ( // Перебираем новые фото
                        <div key={index} className="image-item"> {/* Элемент фото */}
                            <img
                                src={img.preview} // Путь к превью
                                alt={`Фото ${index + 1}`} // Альтернативный текст
                                className="image-preview" // Класс для стилей
                                onClick={() => handleImageClick(img.preview)} // Обработчик клика
                            />
                            <div className="form-group"> {/* Группа формы */}
                                <label htmlFor={`title-${index}`}>Описание (до 255 символов):</label> {/* Подпись */}
                                <input
                                    type="text" // Тип — текст
                                    id={`title-${index}`} // ID для label
                                    value={img.title} // Значение из состояния
                                    onChange={(e) => handleTitleChange(index, e.target.value)} // Обработчик изменения
                                    className="upload-photos-input" // Класс для стилей
                                    maxLength={255} // Лимит символов
                                    disabled={img.uploaded} // Блокировка после загрузки
                                />
                            </div>
                            <div className="image-actions"> {/* Контейнер кнопок */}
                                <button
                                    onClick={() => handleUpload(index)} // Обработчик загрузки
                                    className="upload-btn" // Класс для стилей
                                    disabled={img.uploaded} // Блокировка после загрузки
                                >
                                    {img.uploaded ? "Отправлено" : "Отправить"} {/* Текст кнопки */}
                                </button>
                                <button
                                    onClick={() => handleDeleteNewImage(index)} // Обработчик удаления
                                    className="delete-btn" // Класс для стилей
                                    disabled={img.uploaded} // Блокировка после загрузки
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>

            {selectedImage && ( // Модальное окно для увеличенного фото
                <div className="modal" onClick={closeModal}> {/* Контейнер модального окна */}
                    <img src={selectedImage} alt="Увеличенное фото" className="modal-image" /> {/* Увеличенное фото */}
                </div>
            )}
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка смены темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Текст кнопки */}
            </button>
        </div>
    );
};

export default EditPhotos; // Экспорт компонента