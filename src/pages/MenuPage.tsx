import React from "react"; /* Импорт React для создания компонента */
import { Link } from "react-router-dom"; /* Импорт компонента Link из react-router-dom для навигации */
import "../index.css"; /* Импорт глобальных стилей из файла index.css */

/* Определение интерфейса пропсов для компонента MenuPage */
interface MenuPageProps {
    darkMode: boolean; /* Пропс darkMode для указания текущей темы (true - тёмная, false - светлая) */
    toggleTheme: () => void; /* Пропс toggleTheme для переключения темы, функция без аргументов и возвращаемого значения */
}

/* Определение компонента MenuPage как функционального компонента с использованием интерфейса пропсов */
const MenuPage: React.FC<MenuPageProps> = ({ darkMode, toggleTheme }) => {
    return ( /* Возврат JSX структуры компонента */
        <div className={`menu-container ${darkMode ? "dark-mode" : "light-mode"}`}> {/* Главный контейнер с динамическим классом темы */}
            <h1 className="menu-title">Меню</h1> {/* Заголовок страницы с классом для стилизации */}
            <ul className="menu-list"> {/* Список пунктов меню с классом для стилизации */}
                <li><Link to="/submit" className="menu-link">Новый перевал</Link></li> {/* Ссылка на страницу добавления перевала */}
                <li><Link to="/my-submits" className="menu-link">Мои перевалы</Link></li> {/* Ссылка на страницу перевалов пользователя */}
                <li><Link to="/all-passes" className="menu-link">Список всех перевалов</Link></li> {/* Ссылка на страницу всех перевалов */}
                <li><Link to="/profile" className="menu-link">Личный кабинет</Link></li> {/* Ссылка на страницу личного кабинета */}
            </ul> {/* Закрывающий тег списка */}
            <button onClick={toggleTheme} className="theme-btn"> {/* Кнопка переключения темы с обработчиком onClick */}
                {darkMode ? "Светлая тема" : "Тёмная тема"} {/* Условный текст кнопки в зависимости от darkMode */}
            </button> {/* Закрывающий тег кнопки переключения темы */}
        </div> /* Закрывающий тег главного контейнера */
    ); /* Конец возвращаемого JSX */
};

export default MenuPage; /* Экспорт компонента MenuPage как основного */