import React, { useState } from "react"; /* Импорт React и хука useState для управления состоянием */
import { useNavigate } from "react-router-dom"; /* Импорт хука для навигации */
import "../index.css"; /* Импорт глобальных стилей из файла index.css */

/* Определение интерфейса пропсов для компонента Submit */
interface SubmitProps {
    darkMode: boolean; /* Пропс darkMode для указания текущей темы (true - тёмная, false - светлая) */
    toggleTheme: () => void; /* Пропс toggleTheme для переключения темы */
}

/* Определение интерфейса данных формы перевала */
interface FormData {
    beautyTitle: string; /* Название горного массива */
    title: string; /* Название перевала */
    other_titles: string; /* Другие названия перевала */
    connect: boolean; /* Флаг соединения (true/false) */
    user: { /* Данные пользователя */
        email: string; /* Email */
        family_name: string; /* Фамилия */
        first_name: string; /* Имя */
        phone: string; /* Телефон */
    };
    coord: { /* Координаты перевала */
        latitude: string; /* Широта */
        longitude: string; /* Долгота */
        height: string; /* Высота */
    };
    status: number; /* Статус перевала (1 - новый) */
    difficulties: { season: number; difficulty: number }[]; /* Сложности по сезонам */
    route_description: string; /* Описание маршрута (необязательное) */
    images: any[]; /* Поле для изображений (пустой массив) */
}

/* Константа с URL API для отправки данных перевала */
const API_URL = "http://127.0.0.1:8000/api/submitData/";

/* Определение компонента Submit как функционального компонента с использованием интерфейса пропсов */
const Submit: React.FC<SubmitProps> = ({ darkMode, toggleTheme }) => {
    const navigate = useNavigate(); /* Хук для программной навигации */
    const [formData, setFormData] = useState<FormData>({ /* Состояние для хранения данных формы */
        beautyTitle: "", /* Изначально пустое название горного массива */
        title: "", /* Изначально пустое название перевала */
        other_titles: "", /* Изначально пустые другие названия */
        connect: true, /* Изначально включён флаг соединения */
        user: { /* Данные пользователя из localStorage */
            email: localStorage.getItem("user_email") || "", /* Email из localStorage */
            family_name: localStorage.getItem("user_family_name") || "", /* Фамилия из localStorage */
            first_name: localStorage.getItem("user_first_name") || "", /* Имя из localStorage */
            phone: localStorage.getItem("user_phone") || "" /* Телефон из localStorage */
        },
        coord: { /* Изначальные координаты */
            latitude: "", /* Пустая широта */
            longitude: "", /* Пустая долгота */
            height: "" /* Пустая высота */
        },
        status: 1, /* Изначальный статус - новый */
        difficulties: [{ season: 1, difficulty: 1 }], /* Изначальная сложность */
        route_description: "", /* Изначально пустое описание маршрута */
        images: [] /* Пустой массив для изображений */
    });
    const [submitStatus, setSubmitStatus] = useState<string | null>(null); /* Состояние для статуса отправки */
    const [errorMessage, setErrorMessage] = useState<string | null>(null); /* Состояние для сообщения об ошибке */
    const [loadingGPS, setLoadingGPS] = useState(false); /* Состояние для индикатора загрузки GPS */

    /* Обработчик изменения полей формы */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target; /* Извлечение имени и значения из события */

        // Если поле принадлежит "coord"
        if (["latitude", "longitude", "height"].includes(name)) {
            setFormData(prev => ({
                ...prev,
                coord: {
                    ...prev.coord,
                    [name]: value /* Обновление соответствующего поля координат */
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value /* Обновление основного поля формы */
            }));
        }
    };

    /* Обработчик получения координат с GPS */
    const handleGetGPS = () => {
        if ("geolocation" in navigator) { /* Проверка поддержки геолокации */
            setLoadingGPS(true); /* Начало загрузки координат */
            setErrorMessage(null); /* Сброс ошибки */
            navigator.geolocation.getCurrentPosition(
                (position) => { /* Успешное получение координат */
                    setFormData(prev => ({
                        ...prev,
                        coord: {
                            latitude: position.coords.latitude.toFixed(6), /* Широта с точностью до 6 знаков */
                            longitude: position.coords.longitude.toFixed(6), /* Долгота с точностью до 6 знаков */
                            height: position.coords.altitude ? position.coords.altitude.toFixed(0) : prev.coord.height /* Высота, если доступна */
                        }
                    }));
                    setLoadingGPS(false); /* Завершение загрузки */
                    if (!position.coords.altitude) {
                        setErrorMessage("⚠️ Высота недоступна на этом устройстве, введите вручную"); /* Предупреждение о высоте */
                    }
                },
                (error) => { /* Ошибка получения координат */
                    setErrorMessage(`❌ Ошибка GPS: ${error.message}`); /* Уведомление об ошибке */
                    setLoadingGPS(false); /* Завершение загрузки */
                },
                { enableHighAccuracy: true } /* Запрос максимальной точности */
            );
        } else {
            setErrorMessage("❌ Геолокация не поддерживается вашим устройством"); /* Ошибка поддержки */
        }
    };

    /* Обработчик отправки формы */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); /* Предотвращение стандартной отправки формы */

        // Проверка обязательных полей
        if (
            !formData.beautyTitle ||
            !formData.title ||
            !formData.user.email ||
            !formData.user.family_name ||
            !formData.user.first_name ||
            !formData.user.phone ||
            !formData.coord.latitude ||
            !formData.coord.longitude ||
            !formData.coord.height
        ) {
            console.error("❌ Ошибка: Все обязательные поля должны быть заполнены!"); /* Логирование ошибки */
            setErrorMessage("❌ Все обязательные поля должны быть заполнены! Проверьте данные в localStorage."); /* Уведомление пользователя */
            return; /* Прерывание выполнения */
        }

        setSubmitStatus("Сохранение перевала..."); /* Установка статуса отправки */
        setErrorMessage(null); /* Сброс ошибки */

        try {
            console.log("📤 Отправка данных перевала на сервер:", formData); /* Логирование отправляемых данных */
            const perevalResponse = await fetch(API_URL, { /* Отправка POST-запроса к API */
                method: "POST",
                headers: {
                    "Content-Type": "application/json" /* Указание типа данных */
                },
                body: JSON.stringify(formData) /* Преобразование данных в JSON */
            });

            const perevalData = await perevalResponse.json(); /* Получение ответа сервера */
            console.log("✅ Ответ от сервера (перевал):", perevalData); /* Логирование ответа */

            if (!perevalResponse.ok) {
                throw new Error(`Ошибка сервера: ${perevalData.message || JSON.stringify(perevalData)}`);
            }

            const perevalId = perevalData.id; /* Извлечение ID перевала из ответа */
            localStorage.setItem("last_pereval_id", perevalId); /* Сохранение ID перевала */
            setSubmitStatus("✅ Перевал успешно добавлен! Перенаправление..."); /* Успешное завершение */

            // Перенаправление на страницу загрузки фото
            setTimeout(() => navigate(`/add-images/${perevalId}`), 1000); /* Задержка для видимости статуса */
        } catch (error) {
            console.error("❌ Ошибка отправки данных:", error); /* Логирование ошибки сети */
            setErrorMessage(`❌ Ошибка: ${(error as Error).message}`); /* Уведомление пользователя */
            setSubmitStatus(null); /* Сброс статуса */
        }
    };

    return ( /* Возврат JSX структуры компонента */
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
            <h1 className="submit-title">Добавить новый перевал</h1> {/* Заголовок страницы с классом для стилизации */}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Сообщение об ошибке, если есть */}
            {submitStatus && <p className="submit-status">{submitStatus}</p>} {/* Статус отправки */}
            <form onSubmit={handleSubmit} className="submit-form"> {/* Форма с обработчиком отправки и классом для стилизации */}
                <fieldset className="submit-section"> {/* Секция данных перевала */}
                    <legend>Данные перевала</legend> {/* Заголовок секции */}
                    <div className="form-group"> {/* Группа поля ввода */}
                        <label htmlFor="beautyTitle">Название горного массива:</label> {/* Метка для поля */}
                        <input
                            type="text"
                            id="beautyTitle"
                            name="beautyTitle"
                            value={formData.beautyTitle}
                            onChange={handleChange}
                            className="submit-input"
                            required /* Обязательное поле */
                        /> {/* Поле ввода названия горного массива */}
                    </div>
                    <div className="form-group"> {/* Группа поля ввода */}
                        <label htmlFor="title">Название перевала:</label> {/* Метка для поля */}
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="submit-input"
                            required /* Обязательное поле */
                        /> {/* Поле ввода названия перевала */}
                    </div>
                    <div className="form-group"> {/* Группа поля ввода */}
                        <label htmlFor="route_description">Описание маршрута:</label> {/* Метка для поля */}
                        <textarea
                            id="route_description"
                            name="route_description"
                            value={formData.route_description}
                            onChange={handleChange}
                            className="submit-input"
                            rows={3} /* 3 строки для удобства */
                        /> {/* Поле ввода описания маршрута (необязательное) */}
                    </div>
                </fieldset>

                <fieldset className="submit-section"> {/* Секция координат */}
                    <legend>Координаты</legend> {/* Заголовок секции */}
                    <div className="form-group"> {/* Группа поля ввода */}
                        <label htmlFor="latitude">Широта:</label> {/* Метка для поля */}
                        <input
                            type="text" /* Изменено на text для гибкости ввода */
                            id="latitude"
                            name="latitude"
                            value={formData.coord.latitude}
                            onChange={handleChange}
                            className="submit-input"
                            required /* Обязательное поле */
                        /> {/* Поле ввода широты */}
                    </div>
                    <div className="form-group"> {/* Группа поля ввода */}
                        <label htmlFor="longitude">Долгота:</label> {/* Метка для поля */}
                        <input
                            type="text" /* Изменено на text для гибкости ввода */
                            id="longitude"
                            name="longitude"
                            value={formData.coord.longitude}
                            onChange={handleChange}
                            className="submit-input"
                            required /* Обязательное поле */
                        /> {/* Поле ввода долготы */}
                    </div>
                    <div className="form-group"> {/* Группа поля ввода */}
                        <label htmlFor="height">Высота:</label> {/* Метка для поля */}
                        <input
                            type="text" /* Изменено на text для гибкости ввода */
                            id="height"
                            name="height"
                            value={formData.coord.height}
                            onChange={handleChange}
                            className="submit-input"
                            required /* Обязательное поле */
                        /> {/* Поле ввода высоты */}
                    </div>
                    <button
                        type="button"
                        onClick={handleGetGPS}
                        disabled={loadingGPS}
                        className="gps-btn"
                    > {/* Кнопка получения координат с GPS */}
                        {loadingGPS ? "Загрузка..." : "Получить с GPS"}{/* Условный текст кнопки */}
                    </button>
                </fieldset>

                <button type="submit" className="submit-btn">Отправить</button> {/* Кнопка отправки формы */}
            </form> {/* Закрывающий тег формы */}
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка переключения темы */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Условный текст кнопки */}
            </button> {/* Закрывающий тег кнопки переключения темы */}
        </div> /* Закрывающий тег главного контейнера */
    ); /* Конец возвращаемого JSX */
};

export default Submit; /* Экспорт компонента Submit как основного */