import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

interface EditPhotosProps {
    darkMode: boolean;
    toggleTheme: () => void;
}

interface ImageData {
    file: File;
    preview: string;
    title: string;
    uploaded: boolean;
}

interface Photo {
    id: number;
    file_name: string;
    title: string;
}

// const BASE_URL = "http://127.0.0.1:8000";
const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const IMAGE_API_URL = `${BASE_URL}/api/uploadImage/`;
const PHOTOS_API_URL = `${BASE_URL}/api/uploadImage/photos/`;
const DELETE_API_URL = `${BASE_URL}/api/uploadImage/delete/`;
const MEDIA_URL = `${BASE_URL}/media/`;

const EditPhotos: React.FC<EditPhotosProps> = ({ darkMode, toggleTheme }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [currentPhotos, setCurrentPhotos] = useState<Photo[]>([]);
    const [newImages, setNewImages] = useState<ImageData[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);

    useEffect(() => {
        if (!id) return;
        fetch(`${PHOTOS_API_URL}${id}/`)
            .then(async response => {
                const data = await response.json();
                console.log("📥 Ответ от сервера (фото):", data);
                if (!response.ok) throw new Error(data.message || "Ошибка загрузки фото");
                if (data.state === 1 && Array.isArray(data.photos)) {
                    setCurrentPhotos(data.photos);
                } else {
                    setCurrentPhotos([]);
                }
            })
            .catch(error => {
                console.error("Ошибка загрузки фотографий:", error);
                setErrorMessage("Ошибка загрузки текущих фотографий.");
                setCurrentPhotos([]);
            });
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            const remainingSlots = 3 - (currentPhotos.length + newImages.length);
            if (newFiles.length > remainingSlots) {
                setErrorMessage(`❌ Нельзя загрузить больше ${remainingSlots} фото!`);
                return;
            }

            const newImagesData = newFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                title: "",
                uploaded: false
            }));
            setNewImages(prev => [...prev, ...newImagesData]);
            setErrorMessage(null);
        }
    };

    const handleTitleChange = (index: number, value: string) => {
        if (value.length > 255) {
            setErrorMessage("❌ Описание не может превышать 255 символов!");
            return;
        }
        setNewImages(prev => {
            const updated = [...prev];
            updated[index].title = value;
            return updated;
        });
        setErrorMessage(null);
    };

    const handleDeleteNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setErrorMessage(null);
    };

    const handleDeleteCurrentPhoto = async (photoId: number) => {
        if (showConfirmDelete === null) {
            setShowConfirmDelete(photoId);
            return;
        }

        if (showConfirmDelete === photoId) {
            const email = localStorage.getItem("user_email");
            if (!email) {
                setErrorMessage("❌ Email пользователя не найден. Пожалуйста, войдите.");
                setShowConfirmDelete(null);
                return;
            }

            try {
                const response = await fetch(`${DELETE_API_URL}${photoId}/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (response.status === 200 && data.state === 1) {
                    setCurrentPhotos(prev => prev.filter(photo => photo.id !== photoId));
                    setErrorMessage(null);
                } else if (response.status === 400) {
                    setErrorMessage(`❌ ${data.message || "Удаление запрещено: статус не new"}`);
                } else if (response.status === 403) {
                    setErrorMessage(`❌ ${data.message || "У вас нет прав на удаление этой фотографии"}`);
                } else if (response.status === 404) {
                    setErrorMessage(`❌ ${data.message || "Фотография не найдена"}`);
                } else {
                    throw new Error("Неизвестная ошибка при удалении");
                }
            } catch (error) {
                console.error("Ошибка удаления фотографии:", error);
                setErrorMessage("❌ Ошибка при удалении фотографии");
            } finally {
                setShowConfirmDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setShowConfirmDelete(null);
    };

    const handleUpload = async (index: number) => {
        const image = newImages[index];
        if (image.uploaded) {
            setErrorMessage("❌ Это фото уже отправлено!");
            return;
        }

        const formData = new FormData();
        formData.append("pereval_id", id!);
        formData.append("image", image.file);
        formData.append("title", image.title || image.file.name);

        try {
            const response = await fetch(IMAGE_API_URL, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Ошибка загрузки");

            setNewImages(prev => {
                const updated = [...prev];
                updated[index].uploaded = true;
                return updated;
            });

            const allUploaded = newImages.every(img => img.uploaded);
            if (allUploaded && newImages.length > 0) {
                setTimeout(() => navigate("/menu"), 1000);
            }
        } catch (error) {
            console.error("❌ Ошибка отправки изображения:", error);
            setErrorMessage(`❌ Ошибка: ${(error as Error).message}`);
        }
    };

    const handleImageClick = (preview: string) => {
        setSelectedImage(preview);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className={`upload-photos-container ${darkMode ? "dark-mode" : "light-mode"}`}>
            <h1 className="upload-photos-title">Редактирование фотографий для перевала #{id}</h1>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <fieldset className="submit-section">
                <legend>Текущие фотографии</legend>
                <div className="current-photos-list">
                    {currentPhotos.length > 0 ? (
                        currentPhotos.map(photo => (
                            <div key={photo.id} className="photo-item">
                                <img
                                    src={`${MEDIA_URL}${photo.file_name.replace("\\", "/")}`}
                                    alt={photo.title || photo.file_name}
                                    className="photo-preview"
                                    onClick={() => handleImageClick(`${MEDIA_URL}${photo.file_name.replace("\\", "/")}`)}
                                />
                                <span>{photo.title || photo.file_name}</span>
                                <button
                                    onClick={() => handleDeleteCurrentPhoto(photo.id)}
                                    className="delete-btn"
                                >
                                    Удалить
                                </button>
                                {showConfirmDelete === photo.id && (
                                    <div className="confirm-modal">
                                        <p>Вы уверены? Фото будет удалено с сервера без возможности восстановления.</p>
                                        <button onClick={() => handleDeleteCurrentPhoto(photo.id)} className="submit-btn">
                                            Да
                                        </button>
                                        <button onClick={cancelDelete} className="delete-btn">
                                            Нет
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Фотографии отсутствуют. Добавьте новые ниже.</p>
                    )}
                </div>
            </fieldset>

            <fieldset className="submit-section">
                <legend>Добавить новые фотографии</legend>
                <div className="form-group">
                    <label htmlFor="images">Выберите фотографии (до 3):</label>
                    <input
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="upload-photos-input"
                        disabled={currentPhotos.length + newImages.length >= 3}
                    />
                </div>
                <div className="image-list">
                    {newImages.map((img, index) => (
                        <div key={index} className="image-item">
                            <img
                                src={img.preview}
                                alt={`Фото ${index + 1}`}
                                className="image-preview"
                                onClick={() => handleImageClick(img.preview)}
                            />
                            <div className="form-group">
                                <label htmlFor={`title-${index}`}>Описание (до 255 символов):</label>
                                <input
                                    type="text"
                                    id={`title-${index}`}
                                    value={img.title}
                                    onChange={(e) => handleTitleChange(index, e.target.value)}
                                    className="upload-photos-input"
                                    maxLength={255}
                                    disabled={img.uploaded}
                                />
                            </div>
                            <div className="image-actions">
                                <button
                                    onClick={() => handleUpload(index)}
                                    className="upload-btn"
                                    disabled={img.uploaded}
                                >
                                    {img.uploaded ? "Отправлено" : "Отправить"}
                                </button>
                                <button
                                    onClick={() => handleDeleteNewImage(index)}
                                    className="delete-btn"
                                    disabled={img.uploaded}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
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

export default EditPhotos;