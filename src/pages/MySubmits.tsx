import React, { useEffect, useState } from "react"; // Импорт React и хуков для состояния и эффектов
import { Link } from "react-router-dom"; // Импорт Link для навигации
import "../index.css"; // Импорт глобальных стилей

// Интерфейс пропсов для компонента MySubmits
interface MySubmitsProps {
    darkMode: boolean; // Пропс для тёмной темы
    toggleTheme: () => void; // Пропс для переключения темы
}

// Интерфейс данных перевала
interface Pereval {
    id: number; // ID перевала
    beautyTitle: string; // Красивое название перевала
    title: string; // Основное название перевала
    other_titles: string; // Другие названия
    connect: boolean; // Связан ли перевал
    add_time: string; // Время добавления
    route_description: string | null; // Описание маршрута (может быть null)
    user: number; // ID пользователя
    coord: number; // ID координат
    status: number; // Статус (1 - new, иначе обработан)
}

// Компонент MySubmits
const MySubmits: React.FC<MySubmitsProps> = ({ darkMode, toggleTheme }) => {
    const [perevals, setPerevals] = useState<Pereval[]>([]); // Состояние для списка перевалов
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Состояние для ошибки
    const userEmail = localStorage.getItem("user_email"); // Получаем email из localStorage
    const API_URL = process.env.REACT_APP_API_URL || "https://rostislav62.pythonanywhere.com"; // Базовый URL API

    useEffect(() => { // Хук для загрузки данных при монтировании или смене email
        if (!userEmail) { // Если email нет (пользователь не авторизован)
            setErrorMessage("Ошибка: Email не найден. Авторизуйтесь заново."); // Сообщение об ошибке
            console.log("No user logged in, skipping submits fetch"); // Лог для отладки
            return; // Прерываем эффект
        }

        const url = `${API_URL}/api/auth/users/${userEmail}/submits/?nocache=${new Date().getTime()}`; // Формируем правильный URL с nocache
        console.log("Fetching submits from:", url); // Логируем URL для проверки

        fetch(url) // Отправляем GET-запрос
            .then(async response => { // Обрабатываем ответ
                const data = await response.json(); // Парсим JSON
                console.log("📥 API Response:", data); // Логируем полный ответ

                if (!response.ok) { // Если ответ не 200
                    throw new Error(data.message || `HTTP error! Status: ${response.status}`); // Бросаем ошибку
                }

                if (!data || !Array.isArray(data.data)) { // Проверяем, что данные валидны
                    throw new Error("Некорректный формат данных от сервера"); // Ошибка формата
                }

                setPerevals(data.data); // Устанавливаем перевалы в состояние
            })
            .catch(error => { // Обрабатываем ошибки запроса
                console.error("Ошибка загрузки перевалов:", error); // Лог ошибки
                setErrorMessage("Ошибка сети или сервера. Проверьте подключение."); // Сообщение для UI
            });
    }, [userEmail, API_URL]); // Добавили API_URL в зависимости

    return ( // JSX для рендеринга
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
            <h1 className="submit-title centered-title">Мои перевалы (обновлено)</h1> {/* Заголовок с тестом */}
            {errorMessage && ( // Если есть ошибка
                <p className="error-message">{errorMessage}</p> // Показываем её
            )}
            <div className="table-wrapper"> {/* Обёртка таблицы */}
                <table className="mysubmits-table"> {/* Таблица */}
                    <thead> {/* Заголовки таблицы */}
                        <tr>
                            <th className="mysubmits-th">Название</th> {/* Столбец "Название" */}
                            <th className="mysubmits-th">Статус</th> {/* Столбец "Статус" */}
                            <th className="mysubmits-th">Дата добавления</th> {/* Новый столбец "Дата добавления" */}
                            <th className="mysubmits-th">Действия</th> {/* Столбец "Действия" */}
                        </tr>
                    </thead> {/* Закрывающий тег для заголовков */}
                    <tbody> {/* Тело таблицы */}
                        {perevals.map((p) => ( // Перебираем перевалы
                            <tr key={p.id} className="mysubmits-row"> {/* Строка для каждого перевала */}
                                <td className="mysubmits-td">{p.title}</td> {/* Название перевала */}
                                <td className="mysubmits-td">{p.status === 1 ? "new" : "Обработан"}</td> {/* Статус */}
                                <td className="mysubmits-td">{p.add_time}</td> {/* Дата добавления */}
                                <td className="mysubmits-td"> {/* Действия */}
                                    {p.status === 1 && ( // Если статус "new"
                                        <Link to={`/edit/${p.id}`} className="edit-link">Редактировать</Link> // Ссылка на редактирование
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