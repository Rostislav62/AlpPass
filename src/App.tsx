// AlpPass/src/pages/App.tsx

import React, { useState, useEffect } from "react"; // Импорт React и хуков
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from "react-router-dom"; // Импорт маршрутизации
import MySubmits from "./pages/MySubmits"; // Импорт MySubmits
import AllPass from "./pages/AllPass"; // Импорт AllPass
import NewPereval from "./pages/NewPereval"; // Импорт новой формы NewPereval
import EditPereval from "./pages/EditPereval"; // Импорт EditPereval
import UserRegister from "./pages/UserRegister"; // Импорт UserRegister
import HomePage from "./pages/HomePage"; // Импорт HomePage
import Profile from "./pages/Profile"; // Импорт Profile
import MenuPage from "./pages/MenuPage"; // Импорт MenuPage
import LoginPage from "./pages/LoginPage"; // Импорт LoginPage
import PerevalDetail from "./pages/PerevalDetail"; // Импорт PerevalDetail
import "./index.css"; // Импорт стилей

// Компонент MenuButton
function MenuButton() {
    const location = useLocation(); // Хук для текущего маршрута
    if (location.pathname === "/" || location.pathname === "/menu") { // Если на главной или меню
        return null; // Скрываем кнопку
    }
    return (
        <Link to="/menu" className="menu-btn"> {/* Ссылка на меню */}
            Меню
        </Link>
    );
}

// Главный компонент App
function App() {
    const [darkMode, setDarkMode] = useState(false); // Состояние для тёмной темы
    const [userName, setUserName] = useState(localStorage.getItem("user_name") || "Гость"); // Состояние для имени
    const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "Нет email"); // Состояние для email

    useEffect(() => { // Хук для инициализации и очистки
        const savedTheme = localStorage.getItem("theme"); // Читаем сохранённую тему
        if (savedTheme === "dark") { // Если тёмная
            setDarkMode(true); // Устанавливаем тёмную тему
        }

        // Функция очистки localStorage при закрытии страницы
        const handleBeforeUnload = () => {
            localStorage.clear(); // Очищаем весь localStorage
            setUserName("Гость"); // Сбрасываем имя
            setUserEmail("Нет email"); // Сбрасываем email
        };

        window.addEventListener("beforeunload", handleBeforeUnload); // Добавляем слушатель на закрытие страницы
        return () => window.removeEventListener("beforeunload", handleBeforeUnload); // Убираем слушатель при размонтировании
    }, []); // Пустой массив — эффект только при монтировании

    const toggleTheme = () => { // Функция переключения темы
        const newTheme = darkMode ? "light" : "dark"; // Новая тема
        setDarkMode(!darkMode); // Переключаем состояние
        localStorage.setItem("theme", newTheme); // Сохраняем в localStorage
    };

    const handleLogin = (email: string, name: string) => { // Функция обновления пользователя после логина
        setUserEmail(email); // Обновляем email
        setUserName(name); // Обновляем имя
    };

    return ( // JSX структура приложения
        <Router> {/* Обёртка маршрутизации */}
            <div className={`App ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Контейнер с темой */}
                <header className="App-header"> {/* Заголовок */}
                    <div className="user-info"> {/* Информация о пользователе */}
                        <span>{userName}</span> {/* Отображаем имя */}
                        <span>{userEmail}</span> {/* Отображаем email */}
                    </div>
                    <MenuButton /> {/* Кнопка меню */}
                </header>
                <Routes> {/* Маршруты */}
                    <Route path="/" element={<HomePage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/login" element={<LoginPage darkMode={darkMode} toggleTheme={toggleTheme} onLogin={handleLogin} />} />
                    <Route path="/register" element={<UserRegister darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/menu" element={<MenuPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/my-submits" element={userEmail !== "Нет email" ? <MySubmits darkMode={darkMode} toggleTheme={toggleTheme} /> : <Navigate to="/" />} />
                    <Route path="/all-passes" element={<AllPass darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/edit/:id" element={<EditPereval darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/profile" element={userEmail !== "Нет email" ? <Profile darkMode={darkMode} toggleTheme={toggleTheme} /> : <Navigate to="/" />} />
                    <Route path="/pereval/:id" element={<PerevalDetail darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/pereval/new" element={<NewPereval darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/pereval/edit/:id" element={<NewPereval darkMode={darkMode} toggleTheme={toggleTheme} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App; // Экспорт компонента