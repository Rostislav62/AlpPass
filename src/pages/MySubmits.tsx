import React, { useEffect, useState } from "react"; // Импорт React и хуков для состояния и эффектов
import { Link } from "react-router-dom"; // Импорт Link для навигации
import "../index.css"; // Импорт глобальных стилей

// Интерфейс пропсов для компонента MySubmits
interface MySubmitsProps {
    darkMode: boolean; // Пропс для тёмной темы (true - тёмная, false - светлая)
    toggleTheme: () => void; // Пропс для переключения темы, функция без аргументов
}

// Интерфейс данных перевала
interface Pereval {
    id: number; // ID перевала
    title: string; // Название перевала
    status: number; // Статус перевала (1 - new, иначе обработан)
}

// Получение email пользователя из localStorage
const userEmail = localStorage.getItem("user_email"); // Сохраняем email в переменную, будет null если пользователь не вошёл

// Определение компонента MySubmits
const MySubmits: React.FC<MySubmitsProps> = ({ darkMode, toggleTheme }) => {
    const [perevals, setPerevals] = useState<Pereval[]>([]); // Состояние для списка перевалов, изначально пустой массив
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для сообщения об ошибке, изначально null
    const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API из окружения или дефолтный

    useEffect(() => { // Хук для выполнения запроса при монтировании компонента
        if (!userEmail) { // Если email нет (пользователь не авторизован)
            setErrorMessage("Ошибка: Email не найден. Авторизуйтесь заново."); // Устанавливаем сообщение об ошибке
            console.log("No user logged in, skipping submits fetch"); // Логируем для отладки
            return; // Прерываем выполнение эффекта
        }

        const url = `${API_URL}/api/auth/users/${userEmail}/submits/?nocache=${new Date().getTime()}`; // Формируем правильный URL с nocache
        console.log("Fetching submits from:", url); // Логируем URL для отладки

        fetch(url) // Выполняем GET-запрос к API
            .then(async response => { // Обрабатываем ответ
                const data = await response.json(); // Парсим JSON из ответа
                console.log("📥 Ответ API:", data); // Логируем ответ для отладки

                if (!response.ok) { // Если ответ не 200 (например, 404 или 500)
                    throw new Error(data.message || "Ошибка сервера"); // Бросаем ошибку с сообщением от сервера
                }

                if (!data || typeof data !== "object" || !Array.isArray(data.data)) { // Проверяем структуру данных
                    setErrorMessage("Ошибка: Сервер вернул некорректные данные."); // Устанавливаем сообщение об ошибке
                    return; // Прерываем выполнение
                }

                setPerevals(data.data); // Устанавливаем список перевалов в состояние
            })
            .catch(error => { // Обрабатываем ошибки запроса
                console.error("Ошибка загрузки перевалов:", error); // Логируем ошибку
                setErrorMessage("Ошибка сети. Проверьте подключение."); // Устанавливаем сообщение об ошибке
            });
    }, []); // Пустой массив зависимостей — эффект срабатывает только при монтировании

    return ( // JSX структура компонента
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> // Главный контейнер с динамической темой
            <h1 className="submit-title centered-title">Мои перевалы</h1> // Заголовок страницы, центрированный
            {errorMessage && ( // Условный рендеринг сообщения об ошибке, если оно есть
                <p className="error-message">{errorMessage}</p> // Текст ошибки с классом для стилизации
            )}
            <div className="table-wrapper"> // Обёртка таблицы для прокрутки на маленьких экранах
                <table className="mysubmits-table"> // Таблица с классом для стилизации
                    <thead> // Заголовок таблицы
                        <tr>
                            <th className="mysubmits-th">Название</th> // Заголовок столбца "Название"
                            <th className="mysubmits-th">Статус</th> // Заголовок столбца "Статус"
                            <th className="mysubmits-th">Действия</th> // Заголовок столбца "Действия"
                        </tr>
                    </thead>
                    <tbody> // Тело таблицы
                        {perevals.map((p) => ( // Перебираем массив перевалов
                            <tr key={p.id} className="mysubmits-row"> // Строка таблицы с уникальным ключом
                                <td className="mysubmits-td">{p.title}</td> // Ячейка с названием перевала
                                <td className="mysubmits-td">{p.status === 1 ? "new" : "Обработан"}</td> // Ячейка со статусом (new или Обработан)
                                <td className="mysubmits-td"> // Ячейка с действиями
                                    {p.status === 1 && ( // Если статус "new", показываем ссылку
                                        <Link to={`/edit/${p.id}`} className="edit-link">Редактировать</Link> // Ссылка на редактирование
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={toggleTheme} className="theme-btn centered-btn"> // Кнопка переключения темы
                {darkMode ? "Светлая тема" : "Тёмная тема"} // Текст кнопки зависит от текущей темы
            </button>
        </div>
    );
};

export default MySubmits; // Экспорт компонента