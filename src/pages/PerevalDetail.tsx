import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

interface PerevalData {
    id: number;
    beautyTitle: string;
    title: string;
    other_titles: string;
    connect: string;
    user: { email: string; phone: string; family_name: string; first_name: string; father_name: string };
    coord: { latitude: number; longitude: number; height: number };
    status: number;
    difficulties: { season: string; difficulty: string }[];
    images: { data: string; title: string }[];
}

interface PerevalDetailProps {
    darkMode: boolean;
    toggleTheme: () => void;
}

const BASE_URL = "https://rostislav62.pythonanywhere.com"; //"http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/api/submitData/`;

const PerevalDetail: React.FC<PerevalDetailProps> = ({ darkMode, toggleTheme }) => {
    const { id } = useParams<{ id: string }>();
    const [pereval, setPereval] = useState<PerevalData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        console.log("ID из useParams:", id);
        if (!id) {
            setErrorMessage("ID перевала не указан");
            return;
        }

        fetch(`${API_URL}${id}/info/`)
            .then(async response => {
                const text = await response.text();
                console.log(`📥 Ответ от сервера для ID ${id}:`, text);
                console.log("Статус ответа:", response.status);
                if (!response.ok) {
                    throw new Error(`Сервер вернул ошибку: ${response.status} - ${text}`);
                }
                try {
                    return JSON.parse(text);
                } catch (error) {
                    throw new Error(`Сервер вернул не JSON-ответ: ${text}`);
                }
            })
            .then((data: PerevalData) => {
                setPereval(data);
            })
            .catch(error => {
                console.error("Ошибка загрузки перевала:", error);
                setErrorMessage(`Ошибка загрузки данных перевала: ${error.message}`);
            });
    }, [id]);

    const handleImageClick = (imagePath: string) => {
        setSelectedImage(`${BASE_URL}/media/${imagePath.replace("\\", "/")}`);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    if (!pereval) return <p className="loading-text">Загрузка...</p>;

    return (
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>
            <h1 className="submit-title">{`${pereval.title} (${pereval.beautyTitle})`}</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <fieldset className="submit-section">
                <legend>Данные перевала</legend>
                <p><strong>Горный массив:</strong> {pereval.beautyTitle}</p>
                <p><strong>Название:</strong> {pereval.title}</p>
                <p><strong>Другие названия:</strong> {pereval.other_titles || "Нет"}</p>
                <p><strong>Связь:</strong> {pereval.connect || "Нет"}</p>
                <p><strong>Статус:</strong> {pereval.status === 1 ? "New" : "Processed"}</p>
            </fieldset>
            <fieldset className="submit-section">
                <legend>Пользователь</legend>
                <p><strong>ФИО:</strong> {pereval.user.family_name} {pereval.user.first_name} {pereval.user.father_name}</p>
                <p><strong>Email:</strong> {pereval.user.email}</p>
                <p><strong>Телефон:</strong> {pereval.user.phone}</p>
            </fieldset>
            <fieldset className="submit-section">
                <legend>Координаты</legend>
                <p><strong>Широта:</strong> {pereval.coord.latitude}</p>
                <p><strong>Долгота:</strong> {pereval.coord.longitude}</p>
                <p><strong>Высота:</strong> {pereval.coord.height}</p>
            </fieldset>
            <fieldset className="submit-section">
                <legend>Сложности</legend>
                {pereval.difficulties.length > 0 ? (
                    pereval.difficulties.map((diff, index) => (
                        <div key={index}>
                            <p><strong>Сезон:</strong> {diff.season}</p>
                            <p><strong>Сложность:</strong> {diff.difficulty}</p>
                        </div>
                    ))
                ) : (
                    <p>Данные о сложностях отсутствуют</p>
                )}
            </fieldset>
            <fieldset className="submit-section">
                <legend>Фотографии</legend>
                <div className="photos-list">
                    {pereval.images.length > 0 ? (
                        pereval.images.map((img, index) => (
                            <div key={index} className="photo-item">
                                <img
                                    src={`${BASE_URL}/media/${img.data.replace("\\", "/")}`}
                                    alt={img.title || "Фото перевала"}
                                    className="photo-preview"
                                    onClick={() => handleImageClick(img.data)}
                                />
                                <span>{img.title || "Без названия"}</span>
                            </div>
                        ))
                    ) : (
                        <p>Фотографии отсутствуют</p>
                    )}
                </div>
            </fieldset>
            {selectedImage && (
                <div className="modal" onClick={closeModal}>
                    <img src={selectedImage} alt="Увеличенное фото" className="modal-image" />
                </div>
            )}
            <button onClick={toggleTheme} className="theme-btn">
                {darkMode ? "Светлая тема" : "Тёмная тема"}
            </button>
        </div>
    );
};

export default PerevalDetail;