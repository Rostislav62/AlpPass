// AlpPass/src/pages/AllPass.tsx

import React, { useEffect, useState } from "react"; // Импорт React и хуков
import { useNavigate } from "react-router-dom"; // Импорт useNavigate
import "../index.css"; // Импорт стилей

// Интерфейс данных перевала
interface Pereval {
    id?: number; // Опциональный ID
    pk?: number; // Опциональный pk
    beautyTitle: string; // Горный массив
    title: string; // Название перевала
    other_titles: string; // Другие названия
    connect: boolean; // Связь
    add_time: string; // Время добавления
    user: {
        id: number;
        family_name: string;
        first_name: string;
        father_name: string;
        phone: string;
        email: string;
    };
    coord: {
        id: number;
        latitude: number;
        longitude: number;
        height: number;
    };
    status: number; // Статус
    difficulties: { season: number; difficulty: number }[]; // Сложности
    images: { id: number; data: string; title: string }[]; // Изображения
}

// Интерфейс пропсов
interface AllPassProps {
    darkMode: boolean; // Тёмная тема
    toggleTheme: () => void; // Переключение темы
}

// Базовый URL API
const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Динамический URL

// Компонент AllPass
const AllPass: React.FC<AllPassProps> = ({ darkMode, toggleTheme }) => {
    const [perevals, setPerevals] = useState<Pereval[]>([]); // Состояние для перевалов
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибки
    const navigate = useNavigate(); // Хук для навигации

    useEffect(() => { // Хук для загрузки данных
        fetch(`${API_URL}/api/submitData/list/`) // Запрос к API
            .then(response => response.json()) // Парсим JSON
            .then((data: Pereval[]) => {
                console.log("📥 Ответ от /api/submitData/list/:", data); // Логируем ответ
                if (!Array.isArray(data)) { // Проверяем, массив ли данные
                    setErrorMessage("Ошибка загрузки данных"); // Устанавливаем ошибку
                    return;
                }
                if (data.length > 0) { // Если данные есть
                    console.log("Первый перевал:", data[0]); // Логируем первый объект
                }
                setPerevals(data); // Устанавливаем перевалы
            })
            .catch(error => { // Обрабатываем ошибки
                console.error("Ошибка загрузки перевалов:", error); // Логируем ошибку
                setErrorMessage("Ошибка сети. Попробуйте позже."); // Устанавливаем сообщение
            });
    }, []); // Пустой массив — эффект при монтировании

    const handleRowClick = (pereval: Pereval) => { // Обработчик клика по строке
        const perevalId = pereval.id ?? pereval.pk; // Используем id или pk
        console.log("Клик по перевалу:", pereval.title, "ID:", perevalId); // Логируем клик
        if (perevalId === undefined) { // Если ID нет
            console.error("ID перевала не определён!"); // Логируем ошибку
            setErrorMessage("Ошибка: ID перевала отсутствует в данных"); // Устанавливаем сообщение
            return;
        }
        navigate(`/pereval/${perevalId}`); // Переход на страницу деталей
    };

    return ( // JSX для рендеринга
        <div className={`allpass-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1 className="allpass-title">Все перевалы</h1> {/* Заголовок */}
            {errorMessage && ( // Если есть ошибка
                <p className="error-message">{errorMessage}</p> // Показываем сообщение
            )}
            <div className="table-wrapper"> {/* Обёртка таблицы */}
                <table className="pereval-table"> {/* Таблица */}
                    <thead> {/* Заголовки */}
                        <tr>
                            <th>Горный массив</th> {/* Колонка массива */}
                            <th>Перевал</th> {/* Колонка перевала */}
                        </tr>
                    </thead>
                    <tbody> {/* Тело таблицы */}
                        {perevals.map((p, index) => ( // Перебираем перевалы
                            <tr
                                key={`${(p.id ?? p.pk ?? index)}-${index}`} // Уникальный ключ
                                className="pereval-row" // Класс для строки
                                onClick={() => handleRowClick(p)} // Обработчик клика
                                style={{ cursor: "pointer" }} // Курсор указателя
                            >
                                <td>{p.beautyTitle}</td> {/* Горный массив */}
                                <td>{p.title}</td> {/* Название перевала */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка смены темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Текст кнопки */}
            </button>
        </div>
    );
};

export default AllPass; // Экспорт компонента