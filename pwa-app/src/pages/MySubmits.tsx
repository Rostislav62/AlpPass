import React, { useEffect, useState } from "react"; /* Импорт React и хуков useState, useEffect для управления состоянием и эффектами */
import { Link } from "react-router-dom"; /* Импорт Link для навигации вместо тега <a> */
import "../index.css"; /* Импорт глобальных стилей из файла index.css */

/* Определение интерфейса пропсов для компонента MySubmits */
interface MySubmitsProps {
    darkMode: boolean; /* Пропс darkMode для указания текущей темы (true - тёмная, false - светлая) */
    toggleTheme: () => void; /* Пропс toggleTheme для переключения темы */
}

/* Определение интерфейса данных перевала */
interface Pereval {
    id: number; /* ID перевала */
    title: string; /* Название перевала */
    status: number; /* Статус перевала (1 - new, иначе обработан) */
}

/* Константа с URL API для получения данных пользователя */
const API_URL = "http://127.0.0.1:8000/api/auth/users/";

/* Получение email пользователя из localStorage */
const userEmail = localStorage.getItem("user_email");

/* Определение компонента MySubmits как функционального компонента с использованием интерфейса пропсов */
const MySubmits: React.FC<MySubmitsProps> = ({ darkMode, toggleTheme }) => {
    const [perevals, setPerevals] = useState<Pereval[]>([]); /* Состояние для хранения списка перевалов, изначально пустой массив */
    const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для хранения сообщения об ошибке, изначально null */

    useEffect(() => { /* Использование хука useEffect для загрузки данных при монтировании */
        if (!userEmail) { /* Проверка наличия email в localStorage */
            setErrorMessage("Ошибка: Email не найден. Авторизуйтесь заново."); /* Установка сообщения об ошибке */
            return; /* Прерывание выполнения */
        }

        fetch(`${API_URL}${userEmail}/submits/?nocache=${new Date().getTime()}`) /* GET-запрос к API с параметром nocache для избежания кэширования */
            .then(async response => {
                const data = await response.json(); /* Преобразование ответа в JSON */
                console.log("📥 Ответ API:", data); /* Логирование ответа для отладки */

                if (!response.ok) { /* Проверка успешности ответа */
                    throw new Error(data.message || "Ошибка сервера"); /* Выброс ошибки с сообщением от сервера */
                }

                if (!data || typeof data !== "object" || !Array.isArray(data.data)) { /* Проверка структуры данных */
                    setErrorMessage("Ошибка: Сервер вернул некорректные данные."); /* Установка сообщения об ошибке */
                    return; /* Прерывание выполнения */
                }
                setPerevals(data.data); /* Установка списка перевалов в состояние */
            })
            .catch(error => { /* Обработка ошибок запроса */
                console.error("Ошибка загрузки перевалов:", error); /* Логирование ошибки */
                setErrorMessage("Ошибка сети. Проверьте подключение."); /* Установка сообщения об ошибке */
            });
    }, []); /* Пустой массив зависимостей, чтобы эффект сработал только при монтировании */

    return ( /* Возврат JSX структуры компонента */
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
            <h1 className="submit-title centered-title">Мои перевалы</h1> {/* Заголовок с новым классом для центрирования */}
            {errorMessage && ( /* Условный рендеринг сообщения об ошибке */
                <p className="error-message">{errorMessage}</p> /* Текст ошибки с классом для стилизации */
            )}
            <div className="table-wrapper"> {/* Обёртка таблицы для прокрутки на маленьких экранах */}
                <table className="mysubmits-table"> {/* Таблица с классом для стилизации */}
                    <thead> {/* Заголовок таблицы */}
                        <tr>
                            <th className="mysubmits-th">Название</th> {/* Заголовок столбца "Название" */}
                            <th className="mysubmits-th">Статус</th> {/* Заголовок столбца "Статус" */}
                            <th className="mysubmits-th">Действия</th> {/* Заголовок столбца "Действия" */}
                        </tr>
                    </thead>
                    <tbody> {/* Тело таблицы */}
                        {perevals.map((p) => ( /* Итерация по списку перевалов */
                            <tr key={p.id} className="mysubmits-row"> {/* Строка таблицы с уникальным ключом и классом */}
                                <td className="mysubmits-td">{p.title}</td> {/* Ячейка с названием */}
                                <td className="mysubmits-td">{p.status === 1 ? "new" : "Обработан"}</td> {/* Ячейка со статусом */}
                                <td className="mysubmits-td"> {/* Ячейка с действиями */}
                                    {p.status === 1 && ( /* Условный рендеринг ссылки для статуса "new" */
                                        <Link to={`/edit/${p.id}`} className="edit-link">Редактировать</Link> /* Ссылка на страницу редактирования */
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={toggleTheme} className="theme-btn centered-btn"> {/* Кнопка переключения темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Условный текст кнопки */}
            </button>
        </div>
    ); /* Конец возвращаемого JSX */
};

export default MySubmits; /* Экспорт компонента MySubmits как основного */