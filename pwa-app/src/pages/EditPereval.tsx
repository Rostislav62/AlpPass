import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

interface EditPerevalProps {
    darkMode: boolean;
    toggleTheme: () => void;
}

interface PerevalData {
    beautyTitle: string;
    title: string;
    other_titles: string;
    coord: { latitude: number; longitude: number; height: number };
    user: { email: string; phone: string };
    status: number;
}

interface Photo {
    id: number;
    file_name: string;
    title: string;
}

const BASE_URL = "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/api/submitData/`;
const PHOTOS_API_URL = `${BASE_URL}/api/uploadImage/photos/`;
const MEDIA_URL = `${BASE_URL}/media/`;

const EditPereval: React.FC<EditPerevalProps> = ({ darkMode, toggleTheme }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<PerevalData | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const userEmail = localStorage.getItem("user_email") || "";
    const userPhone = localStorage.getItem("user_phone") || "";

    useEffect(() => {
        if (!id) {
            console.error("❌ Ошибка: ID перевала отсутствует!");
            alert("Ошибка: невозможно загрузить перевал без ID.");
            return;
        }

        // Загрузка данных перевала
        fetch(`${API_URL}${id}/info/`)
            .then(async response => {
                const text = await response.text();
                console.log("📥 Ответ от сервера (перевал):", text);
                try {
                    return JSON.parse(text);
                } catch (error) {
                    console.error("❌ Ошибка парсинга JSON:", text);
                    throw new Error("Сервер вернул не JSON-ответ");
                }
            })
            .then((data: PerevalData) => {
                if (
                    data.status === 1 &&
                    data.user.email.trim().toLowerCase() === userEmail.trim().toLowerCase() &&
                    data.user.phone.replace(/\s+/g, '') === userPhone.replace(/\s+/g, '')
                ) {
                    setFormData({ ...data });
                } else {
                    alert("Редактирование запрещено! Либо статус не new, либо данные пользователя не совпадают.");
                }
            })
            .catch(error => console.error("Ошибка загрузки перевала:", error));

        // Загрузка фотографий
        fetch(`${PHOTOS_API_URL}${id}/`)
            .then(async response => {
                const data = await response.json();
                console.log("📥 Ответ от сервера (фото):", data);
                if (!response.ok) throw new Error(data.message || "Ошибка загрузки фото");
                if (data.state === 1 && Array.isArray(data.photos)) {
                    setPhotos(data.photos);
                } else {
                    setPhotos([]);
                }
            })
            .catch(error => {
                console.error("Ошибка загрузки фотографий:", error);
                setPhotos([]);
            });
    }, [id, userEmail, userPhone]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData(prev => ({
            ...(prev as PerevalData),
            [name]: value
        }));
    };

    const handleCoordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                coord: {
                    ...prev.coord,
                    [name]: Number(value)
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        const email = localStorage.getItem("user_email");
        if (!email) {
            setErrorMessage("❌ Email пользователя не найден. Пожалуйста, войдите.");
            return;
        }

        const updatedData = {
            email,
            beautyTitle: formData.beautyTitle,
            title: formData.title,
            other_titles: formData.other_titles,
            coord: formData.coord
        };

        try {
            const response = await fetch(`${API_URL}${id}/update/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();
            if (response.status === 200 && data.state === 1) {
                alert("✅ Перевал успешно обновлён!");
                setErrorMessage(null);
            } else if (response.status === 400) {
                setErrorMessage(`❌ ${data.message || "Обновление запрещено: статус не new"}`);
            } else if (response.status === 403) {
                setErrorMessage(`❌ ${data.message || "У вас нет прав на редактирование этого перевала"}`);
            } else if (response.status === 404) {
                setErrorMessage(`❌ ${data.message || "Перевал не найден"}`);
            } else {
                throw new Error("Неизвестная ошибка при обновлении");
            }
        } catch (error) {
            console.error("❌ Ошибка при редактировании:", error);
            setErrorMessage("❌ Ошибка при редактировании перевала");
        }
    };

    const handleImageClick = (preview: string) => {
        setSelectedImage(preview);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    if (!formData) return <p className="loading-text">Загрузка...</p>;

    return (
        <div className={`submit-container ${darkMode ? "dark-mode" : "light-mode"}`}>
            <h1 className="submit-title">Редактировать перевал</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit} className="submit-form">
                <fieldset className="submit-section">
                    <legend>Данные перевала</legend>
                    <div className="form-group">
                        <label htmlFor="title">Название перевала:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="submit-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="beautyTitle">Название горного массива:</label>
                        <input
                            type="text"
                            id="beautyTitle"
                            name="beautyTitle"
                            value={formData.beautyTitle}
                            onChange={handleChange}
                            className="submit-input"
                            required
                        />
                    </div>
                </fieldset>

                <fieldset className="submit-section">
                    <legend>Координаты</legend>
                    <div className="form-group">
                        <label htmlFor="latitude">Широта:</label>
                        <input
                            type="number"
                            id="latitude"
                            name="latitude"
                            value={formData.coord.latitude}
                            onChange={handleCoordChange}
                            className="submit-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="longitude">Долгота:</label>
                        <input
                            type="number"
                            id="longitude"
                            name="longitude"
                            value={formData.coord.longitude}
                            onChange={handleCoordChange}
                            className="submit-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="height">Высота:</label>
                        <input
                            type="number"
                            id="height"
                            name="height"
                            value={formData.coord.height}
                            onChange={handleCoordChange}
                            className="submit-input"
                            required
                        />
                    </div>
                </fieldset>

                <fieldset className="submit-section">
                    <legend>Фотографии перевала</legend>
                    <div className="photos-list">
                        {photos.length > 0 ? (
                            photos.map(photo => (
                                <div key={photo.id} className="photo-item">
                                    <img
                                        src={`${MEDIA_URL}${photo.file_name.replace("\\", "/")}`}
                                        alt={photo.title || photo.file_name}
                                        className="photo-preview"
                                        onClick={() => handleImageClick(`${MEDIA_URL}${photo.file_name.replace("\\", "/")}`)}
                                    />
                                    <span>{photo.title || photo.file_name}</span>
                                </div>
                            ))
                        ) : (
                            <p>Фотографии отсутствуют</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(`/edit-photos/${id}`)}
                        className="submit-btn"
                    >
                        Заменить фотографии
                    </button>
                </fieldset>

                <button type="submit" className="submit-btn">Сохранить изменения</button>
            </form>
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

export default EditPereval;