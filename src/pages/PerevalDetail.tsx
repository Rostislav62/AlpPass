import React, { useEffect, useState } from "react"; // Импорт React и хуков
import { useParams } from "react-router-dom"; // Импорт useParams
import "../index.css"; // Импорт стилей

// Интерфейс данных перевала
interface PerevalData {
    id: number; // ID перевала
    beautyTitle: string; // Красивое название
    title: string; // Название
    other_titles: string; // Другие названия
    connect: string; // Связь
    user: { email: string; phone: string; family_name: string; first_name: string; father_name: string }; // Пользователь
    coord: { latitude: number; longitude: number; height: number }; // Координаты
    status: number; // Статус
    difficulties: { season: string; difficulty: string }[]; // Сложности
    images: { data: string; title: string }[]; // Изображения
}

// Интерфейс пропсов
interface PerevalDetailProps {
    darkMode: boolean; // Тёмная тема
    toggleTheme: () => void; // Переключение темы
}

// Базовый URL
const BASE_URL = "https://rostislav62.pythonanywhere.com"; // Базовый URL API
const API_URL = `${BASE_URL}/api/submitData/`; // URL для данных перевала

// Компонент PerevalDetail
const PerevalDetail: React.FC<PerevalDetailProps> = ({ darkMode, toggleTheme }) => {
    const { id } = useParams<{ id: string }>(); // Получаем ID из URL
    const [pereval, setPereval] = useState<PerevalData | null>(null); // Состояние для перевала
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибки
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Состояние для модального фото

    useEffect(() => { // Хук для загрузки данных
        console.log("ID из useParams:", id); // Логируем ID
        if (!id) { // Если ID нет
            setErrorMessage("ID перевала не указан"); // Устанавливаем ошибку
            return;
        }

        fetch(`${API_URL}${id}/info/`) // Запрос к API
            .then(async response => { // Обрабатываем ответ
                const text = await response.text(); // Получаем текст ответа
                console.log(`📥 Ответ от сервера для ID ${id}:`, text); // Логируем текст
                console.log("Статус ответа:", response.status); // Логируем статус
                if (!response.ok) { // Если не 200
                    throw new Error(`Сервер вернул ошибку: ${response.status} - ${text}`); // Бросаем ошибку
                }
                try {
                    return JSON.parse(text); // Парсим JSON
                } catch (error) { // Ошибка парсинга
                    throw new Error(`Сервер вернул не JSON-ответ: ${text}`); // Бросаем ошибку
                }
            })
            .then((data: PerevalData) => { // Обрабатываем данные
                setPereval(data); // Устанавливаем перевал
            })
            .catch(error => { // Обрабатываем ошибки
                console.error("Ошибка загрузки перевала:", error); // Логируем ошибку
                setErrorMessage(`Ошибка загрузки данных перевала: ${error.message}`); // Устанавливаем сообщение
            });
    }, [id]); // Зависимость от ID

    const handleImageClick = (imagePath: string) => { // Обработчик клика по фото
        const fullPath = `${BASE_URL}/media/${imagePath.replace("\\", "/")}`; // Формируем полный путь
        console.log("Полный путь к фото:", fullPath); // Логируем путь
        setSelectedImage(fullPath); // Устанавливаем для модального окна
    };

    const closeModal = () => { // Обработчик закрытия модального окна
        setSelectedImage(null); // Сбрасываем выбранное фото
    };

    if (!pereval) return <p className="loading-text">Загрузка...</p>; // Показываем "Загрузка", если данных нет

    return ( // JSX для рендеринга
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1 className="submit-title">{`${pereval.title} (${pereval.beautyTitle})`}</h1> {/* Заголовок */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке */}
            <fieldset className="submit-section"> {/* Секция данных перевала */}
                <legend>Данные перевала</legend> {/* Заголовок секции */}
                <p><strong>Горный массив:</strong> {pereval.beautyTitle}</p> {/* Массив */}
                <p><strong>Название:</strong> {pereval.title}</p> {/* Название */}
                <p><strong>Другие названия:</strong> {pereval.other_titles || "Нет"}</p> {/* Другие названия */}
                <p><strong>Связь:</strong> {pereval.connect || "Нет"}</p> {/* Связь */}
                <p><strong>Статус:</strong> {pereval.status === 1 ? "New" : "Processed"}</p> {/* Статус */}
            </fieldset>
            <fieldset className="submit-section"> {/* Секция пользователя */}
                <legend>Пользователь</legend> {/* Заголовок секции */}
                <p><strong>ФИО:</strong> {pereval.user.family_name} {pereval.user.first_name} {pereval.user.father_name}</p> {/* ФИО */}
                <p><strong>Email:</strong> {pereval.user.email}</p> {/* Email */}
                <p><strong>Телефон:</strong> {pereval.user.phone}</p> {/* Телефон */}
            </fieldset>
            <fieldset className="submit-section"> {/* Секция координат */}
                <legend>Координаты</legend> {/* Заголовок секции */}
                <p><strong>Широта:</strong> {pereval.coord.latitude}</p> {/* Широта */}
                <p><strong>Долгота:</strong> {pereval.coord.longitude}</p> {/* Долгота */}
                <p><strong>Высота:</strong> {pereval.coord.height}</p> {/* Высота */}
            </fieldset>
            <fieldset className="submit-section"> {/* Секция сложностей */}
                <legend>Сложности</legend> {/* Заголовок секции */}
                {pereval.difficulties.length > 0 ? ( // Если сложности есть
                    pereval.difficulties.map((diff, index) => ( // Перебираем сложности
                        <div key={index}>
                            <p><strong>Сезон:</strong> {diff.season}</p> {/* Сезон */}
                            <p><strong>Сложность:</strong> {diff.difficulty}</p> {/* Сложность */}
                        </div>
                    ))
                ) : (
                    <p>Данные о сложностях отсутствуют</p> // Сообщение, если сложностей нет
                )}
            </fieldset>
            <fieldset className="submit-section"> {/* Секция фотографий */}
                <legend>Фотографии</legend> {/* Заголовок секции */}
                <div className="photos-list"> {/* Список фото */}
                    {pereval.images.length > 0 ? ( // Если фото есть
                        pereval.images.map((img, index) => ( // Перебираем фото
                            <div key={index} className="photo-item"> {/* Элемент фото */}
                                <img
                                    src={`${BASE_URL}/media/${img.data.replace("\\", "/")}`} // Путь к фото
                                    alt={img.title || "Фото перевала"} // Альтернативный текст
                                    className="photo-preview" // Класс для стилей
                                    onClick={() => handleImageClick(img.data)} // Обработчик клика
                                    onError={(e) => console.error(`Ошибка загрузки фото: ${img.data}`)} // Логируем ошибку загрузки
                                />
                                <span>{img.title || "Без названия"}</span> {/* Название */}
                            </div>
                        ))
                    ) : (
                        <p>Фотографии отсутствуют</p> // Сообщение, если фото нет
                    )}
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

export default PerevalDetail; // Экспорт компонента