import React, { useState, useEffect } from "react"; /* Импорт React и хуков useState, useEffect для управления состоянием и эффектами */
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom"; /* Импорт компонентов маршрутизации из react-router-dom */
import MySubmits from "./pages/MySubmits"; /* Импорт компонента страницы с перевалами пользователя */
import AllPass from "./pages/AllPass"; /* Импорт компонента страницы со всеми перевалами */
import Submit from "./pages/Submit"; /* Импорт компонента страницы добавления перевала */
import EditPereval from "./pages/EditPereval"; /* Импорт компонента страницы редактирования перевала */
import UserRegister from "./pages/UserRegister"; /* Импорт компонента страницы регистрации */
import HomePage from "./pages/HomePage"; /* Импорт компонента главной страницы */
import Profile from "./pages/Profile"; /* Импорт компонента страницы личного кабинета */
import MenuPage from "./pages/MenuPage"; /* Импорт компонента страницы меню */
import LoginPage from "./pages/LoginPage"; /* Импорт компонента страницы логина */
import UploadPhotos from "./pages/UploadPhotos"; /* Импорт компонента страницы с фотографиями */
import PerevalDetail from "./pages/PerevalDetail"; /* Импорт компонента страницы с информацией о перевали */
import EditPhotos from "./pages/EditPhotos"; /* Импорт компонента страницы с фотографиями. Замена фотографий или добавление.*/
import "./index.css"; /* Импорт глобальных стилей из файла index.css */

// /* Определение интерфейса пропсов для всех страниц */
// interface PageProps {
//     darkMode: boolean; /* Пропс darkMode для указания текущей темы */
//     toggleTheme: () => void; /* Пропс toggleTheme для переключения темы */
// }

/* Определение компонента MenuButton для отображения кнопки "Меню" */
function MenuButton() {
    const location = useLocation(); /* Использование хука useLocation для получения текущего маршрута */
    if (location.pathname === "/" || location.pathname === "/menu") { /* Проверка, находится ли пользователь на главной странице или странице меню */
        return null; /* Возврат null, чтобы не рендерить кнопку на главной странице и странице меню */
    }
    return ( /* Возврат JSX для кнопки "Меню" */
        <Link to="/menu" className="menu-btn"> {/* Ссылка на страницу меню с классом menu-btn для стилизации */}
            Меню {/* Текст кнопки "Меню" */}
        </Link> /* Закрывающий тег Link */
    ); /* Конец возвращаемого JSX */
}

/* Определение главного компонента приложения App */
function App() {
    const userName = localStorage.getItem("user_name") || "Гость"; /* Получение имени пользователя из localStorage, если нет — "Гость" */
    const userEmail = localStorage.getItem("user_email") || "Нет email"; /* Получение email пользователя из localStorage, если нет — "Нет email" */
    const [darkMode, setDarkMode] = useState(false); /* Объявление состояния darkMode с начальным значением false (светлая тема) */

    useEffect(() => { /* Использование хука useEffect для выполнения кода при монтировании компонента */
        const savedTheme = localStorage.getItem("theme"); /* Получение сохранённой темы из localStorage */
        if (savedTheme === "dark") { /* Проверка, является ли сохранённая тема тёмной */
            setDarkMode(true); /* Установка darkMode в true, если тема тёмная */
        }
    }, []); /* Пустой массив зависимостей, чтобы эффект сработал только один раз при монтировании */

    const toggleTheme = () => { /* Определение функции переключения темы */
        const newTheme = darkMode ? "light" : "dark"; /* Определение новой темы: если darkMode true, то "light", иначе "dark" */
        setDarkMode(!darkMode); /* Переключение состояния darkMode на противоположное */
        localStorage.setItem("theme", newTheme); /* Сохранение новой темы в localStorage */
    };

    return ( /* Возврат JSX структуры приложения */
        <Router> {/* Обёртка приложения в BrowserRouter для маршрутизации */}
            <div className={`App ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с классом App и динамическим классом темы */}
                <header className="App-header"> {/* Заголовок приложения с классом App-header */}
                    <div className="user-info"> {/* Контейнер для информации о пользователе с классом user-info */}
                        <span>{userName}</span> {/* Отображение имени пользователя в элементе span */}
                        <span>{userEmail}</span> {/* Отображение email пользователя в элементе span */}
                    </div> {/* Закрывающий тег контейнера user-info */}
                    <MenuButton /> {/* Вставка компонента MenuButton внутри header для позиционирования */}
                </header> {/* Закрывающий тег заголовка */}
                <Routes>
                    <Route path="/" element={<HomePage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/login" element={<LoginPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/register" element={<UserRegister darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/menu" element={<MenuPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/my-submits" element={<MySubmits darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/all-passes" element={<AllPass darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/submit" element={<Submit darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/edit/:id" element={<EditPereval darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/profile" element={<Profile darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/add-images/:perevalId" element={<UploadPhotos darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/edit-photos/:id" element={<EditPhotos darkMode={darkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/pereval/:id" element={<PerevalDetail darkMode={darkMode} toggleTheme={toggleTheme} />} />
                </Routes>
            </div> {/* Закрывающий тег главного контейнера */}
        </Router> /* Закрывающий тег Router */
    ); /* Конец возвращаемого JSX */
}

export default App; /* Экспорт компонента App как основного */