import React, { useState, useEffect } from "react"; // Импорт React и хуков для состояния и эффектов
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from "react-router-dom"; // Импорт компонентов маршрутизации и Navigate для редиректов
import MySubmits from "./pages/MySubmits"; // Импорт компонента страницы с перевалами пользователя
import AllPass from "./pages/AllPass"; // Импорт компонента страницы со всеми перевалами
import Submit from "./pages/Submit"; // Импорт компонента страницы добавления перевала
import EditPereval from "./pages/EditPereval"; // Импорт компонента страницы редактирования перевала
import UserRegister from "./pages/UserRegister"; // Импорт компонента страницы регистрации
import HomePage from "./pages/HomePage"; // Импорт компонента главной страницы
import Profile from "./pages/Profile"; // Импорт компонента страницы профиля
import MenuPage from "./pages/MenuPage"; // Импорт компонента страницы меню
import LoginPage from "./pages/LoginPage"; // Импорт компонента страницы логина
import UploadPhotos from "./pages/UploadPhotos"; // Импорт компонента страницы загрузки фото
import PerevalDetail from "./pages/PerevalDetail"; // Импорт компонента страницы деталей перевала
import EditPhotos from "./pages/EditPhotos"; // Импорт компонента страницы редактирования фото
import "./index.css"; // Импорт глобальных стилей

// Компонент MenuButton для отображения кнопки "Меню"
function MenuButton() {
    const location = useLocation(); // Хук для получения текущего маршрута
    if (location.pathname === "/" || location.pathname === "/menu") { // Если текущий путь "/" или "/menu"
        return null; // Не рендерим кнопку на главной странице или странице меню
    }
    return ( // Возвращаем кнопку "Меню"
        <Link to="/menu" className="menu-btn"> {/* Ссылка на страницу меню с классом для стилизации
            Меню // Текст кнопки */}
        </Link>
    );
}

// Главный компонент приложения
function App() {
    const userName = localStorage.getItem("user_name") || "Гость"; // Получаем имя пользователя из localStorage или "Гость", если нет
    const userEmail = localStorage.getItem("user_email") || "Нет email"; // Получаем email из localStorage или "Нет email", если нет
    const [darkMode, setDarkMode] = useState(false); // Состояние для тёмной темы, по умолчанию false (светлая)

    useEffect(() => { // Хук для выполнения кода при монтировании
        const savedTheme = localStorage.getItem("theme"); // Получаем сохранённую тему из localStorage
        if (savedTheme === "dark") { // Если тема тёмная
            setDarkMode(true); // Устанавливаем тёмную тему
        }
    }, []); // Пустой массив зависимостей — эффект срабатывает один раз при загрузке

    const toggleTheme = () => { // Функция переключения темы
        const newTheme = darkMode ? "light" : "dark"; // Новая тема: светлая, если была тёмная, и наоборот
        setDarkMode(!darkMode); // Переключаем состояние
        localStorage.setItem("theme", newTheme); // Сохраняем новую тему в localStorage
    };

    return ( // JSX структура приложения
        <Router> {/* Оборачиваем всё в Router для маршрутизации */}
            <div className={`App ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
                <header className="App-header"> {/* Заголовок приложения */}
                    <div className="user-info"> {/* Контейнер для информации о пользователе */}
                        <span>{userName}</span> {/* Отображаем имя пользователя */}
                        <span>{userEmail}</span> {/* Отображаем email пользователя */}
                    </div>
                    <MenuButton /> {/* Вставляем кнопку "Меню" */}
                </header>
                <Routes> {/* Определяем маршруты приложения */}
                    <Route path="/" element={<HomePage darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Главная страница */}
                    <Route path="/login" element={<LoginPage darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница логина */}
                    <Route path="/register" element={<UserRegister darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница регистрации */}
                    <Route path="/menu" element={<MenuPage darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница меню */}
                    <Route // Маршрут для MySubmits
                        path="/my-submits"
                        element={
                            userEmail !== "Нет email" ? ( // Если email есть (пользователь авторизован)
                                <MySubmits darkMode={darkMode} toggleTheme={toggleTheme} />
                            ) : (
                                <Navigate to="/" /> // Если нет email, редиректим на главную
                            )
                        }
                    />
                    <Route // Маршрут для Profile
                        path="/profile"
                        element={
                            userEmail !== "Нет email" ? ( // Если email есть (пользователь авторизован)
                                <Profile darkMode={darkMode} toggleTheme={toggleTheme} />
                            ) : (
                                <Navigate to="/" /> // Если нет email, редиректим на главную
                            )
                        }
                    />
                    <Route path="/all-passes" element={<AllPass darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница всех перевалов */}
                    <Route path="/submit" element={<Submit darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница добавления перевала */} 
                    <Route path="/edit/:id" element={<EditPereval darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница редактирования перевала */}
                    <Route path="/add-images/:perevalId" element={<UploadPhotos darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница загрузки фото */}
                    <Route path="/edit-photos/:id" element={<EditPhotos darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница редактирования фото */}
                    <Route path="/pereval/:id" element={<PerevalDetail darkMode={darkMode} toggleTheme={toggleTheme} />} /> {/* Страница деталей перевала */}
                </Routes>
            </div>
        </Router>
    );
}

export default App; // Экспортируем App как главный компонент