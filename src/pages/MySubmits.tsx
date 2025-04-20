// AlpPass/src/pages/MySubmits.tsx

import React, { useEffect, useState } from "react"; // Импорт React и хуков
import { Link, useNavigate } from "react-router-dom"; // Импорт Link и useNavigate
import "../index.css"; // Импорт стилей

// Интерфейс пропсов
interface MySubmitsProps {
    darkMode: boolean; // Тёмная тема
    toggleTheme: () => void; // Переключение темы
}

// Интерфейс данных перевала
interface Pereval {
    id: number; // ID перевала
    beautyTitle: string; // Красивое название
    title: string; // Основное название
    other_titles: string; // Другие названия
    connect: boolean; // Связь
    add_time: string; // Время добавления
    route_description: string | null; // Описание маршрута
    user: number; // ID пользователя
    coord: number; // ID координат
    status: number; // Статус
}

// Компонент MySubmits
const MySubmits: React.FC<MySubmitsProps> = ({ darkMode, toggleTheme }) => {
    const [perevals, setPerevals] = useState<Pereval[]>([]); // Состояние для перевалов
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибки
    const userEmail = localStorage.getItem("user_email"); // Email из localStorage
    const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API
    const navigate = useNavigate(); // Хук для навигации

    useEffect(() => { // Хук для загрузки данных
        if (!userEmail) { // Если email нет
            setErrorMessage("Ошибка: Email не найден. Авторизуйтесь заново."); // Устанавливаем ошибку
            console.log("No user logged in, skipping submits fetch"); // Логируем
            return;
        }

        const url = `${API_URL}/api/auth/users/${userEmail}/submits/?nocache=${new Date().getTime()}`; // URL с nocache
        console.log("Fetching submits from:", url); // Логируем URL

        fetch(url) // Запрос к API
            .then(async response => { // Обрабатываем ответ
                const data = await response.json(); // Парсим JSON
                console.log("📥 API Response:", data); // Логируем ответ

                if (!response.ok) { // Если не 200
                    throw new Error(data.message || `HTTP error! Status: ${response.status}`); // Бросаем ошибку
                }

                if (!data || !Array.isArray(data.data)) { // Проверяем данные
                    throw new Error("Некорректный формат данных от сервера"); // Ошибка формата
                }

                setPerevals(data.data); // Устанавливаем перевалы
            })
            .catch(error => { // Обрабатываем ошибки
                console.error("Ошибка загрузки перевалов:", error); // Логируем ошибку
                setErrorMessage("Ошибка сети или сервера. Проверьте подключение."); // Устанавливаем сообщение
            });
    }, [userEmail, API_URL]); // Зависимости

    const handleRowClick = (perevalId: number) => { // Обработчик клика по строке
        console.log("Клик по перевалу, ID:", perevalId); // Логируем клик
        navigate(`/pereval/${perevalId}`); // Переход на страницу деталей
    };

    if (!userEmail) { // Если email нет
        return <div>Пожалуйста, войдите в систему</div>; // Показываем сообщение
    }

    return ( // JSX для рендеринга
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1 className="submit-title centered-title">Мои перевалы</h1> {/* Заголовок */}
            {errorMessage && ( // Если есть ошибка
                <p className="error-message">{errorMessage}</p> // Показываем сообщение
            )}
            <div className="table-wrapper"> {/* Обёртка таблицы */}
                <table className="mysubmits-table"> {/* Таблица */}
                    <thead> {/* Заголовки */}
                        <tr>
                            <th className="mysubmits-th">Название</th> {/* Колонка названия */}
                            <th className="mysubmits-th">Статус</th> {/* Колонка статуса */}
                            <th className="mysubmits-th">Дата добавления</th> {/* Колонка даты */}
                            <th className="mysubmits-th">Действия</th> {/* Колонка действий */}
                        </tr>
                    </thead>
                    <tbody> {/* Тело таблицы */}
                        {perevals.map((p) => ( // Перебираем перевалы
                            <tr
                                key={p.id} // Уникальный ключ по ID
                                className="mysubmits-row" // Класс для строки
                                onClick={() => handleRowClick(p.id)} // Обработчик клика
                                style={{ cursor: "pointer" }} // Курсор указателя
                            >
                                <td className="mysubmits-td">{p.title}</td> {/* Название */}
                                <td className="mysubmits-td">{p.status === 1 ? "new" : "Обработан"}</td> {/* Статус */}
                                <td className="mysubmits-td">{p.add_time}</td> {/* Дата */}
                                <td className="mysubmits-td"> {/* Действия */}
                                    {p.status === 1 && ( // Если статус "new"
                                        <>
                                            <Link
                                                to={`/edit/${p.id}`} // Ссылка на редактирование (старая логика)
                                                className="edit-link" // Класс для стилей
                                                onClick={(e) => e.stopPropagation()} // Предотвращаем срабатывание handleRowClick
                                            >
                                                Редактировать
                                            </Link>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={toggleTheme} className="theme-btn centered-btn"> {/* Кнопка смены темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Текст кнопки */}
            </button>
        </div>
    );
};

export default MySubmits; // Экспорт компонента