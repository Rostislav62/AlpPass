import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/submitData/";

function Submit() {
    const [formData, setFormData] = useState({
        beautyTitle: "",
        title: "",
        other_titles: "",
        connect: true,
        user: {
            family_name: "",
            first_name: "",
            father_name: "",
            phone: "",
            email: ""
        },
        coord: {
            latitude: "",
            longitude: "",
            height: ""
        },
        status: 1,
        difficulties: [{ season: 1, difficulty: 1 }],
        images: []
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
    
        // Если поле принадлежит "user"
        if (["family_name", "first_name", "father_name", "phone", "email"].includes(name)) {
            setFormData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    [name]: value
                }
            }));
        }
        // Если поле принадлежит "coord"
        else if (["latitude", "longitude", "height"].includes(name)) {
            setFormData(prev => ({
                ...prev,
                coord: {
                    ...prev.coord,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    

    const handleSubmit = async (e: any) => {
        e.preventDefault();
    
        // Проверяем, что все обязательные поля заполнены
        if (
            !formData.beautyTitle ||
            !formData.title ||
            !formData.user.family_name ||
            !formData.user.first_name ||
            !formData.user.phone ||
            !formData.user.email ||
            !formData.coord.latitude ||
            !formData.coord.longitude ||
            !formData.coord.height
        ) {
            console.error("❌ Ошибка: Все обязательные поля должны быть заполнены!");
            alert("Ошибка: Все обязательные поля должны быть заполнены!");
            return;
        }
    
        console.log("📤 Отправка данных на сервер:", formData);
    
        try {
            const response = await fetch("http://127.0.0.1:8000/api/submitData/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
    
            const data = await response.json();
            console.log("✅ Ответ от сервера:", data);

            // Сохраняем ответ сервера в localStorage
            localStorage.setItem("last_server_response", JSON.stringify(data));
    
            if (response.ok) {
                localStorage.setItem("user_email", formData.user.email);
                localStorage.setItem("user_phone", formData.user.phone);
                localStorage.setItem("last_pereval_id", data.id);
                alert("✅ Перевал успешно добавлен!");
            } else {
                alert(`Ошибка: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error("❌ Ошибка отправки данных:", error);
            alert("Ошибка при отправке данных на сервер!");
        }
    };
    
    

    return (
        <div>
            <h1>Добавить новый перевал</h1>
            <form onSubmit={handleSubmit}>
                <h2>Данные перевала</h2>
    
                <label>Красивое название:</label>
                <input type="text" name="beautyTitle" value={formData.beautyTitle} onChange={handleChange} required />
    
                <label>Название перевала:</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
    
                <h2>Координаты</h2>
                <label>Широта:</label>
                <input type="number" name="latitude" value={formData.coord.latitude || ""} onChange={handleChange} required />
    
                <label>Долгота:</label>
                <input type="number" name="longitude" value={formData.coord.longitude || ""} onChange={handleChange} required />
    
                <label>Высота:</label>
                <input type="number" name="height" value={formData.coord.height || ""} onChange={handleChange} required />
    
                <h2>Информация о пользователе</h2>
                <label>Фамилия:</label>
                <input type="text" name="family_name" value={formData.user.family_name} onChange={handleChange} required />
    
                <label>Имя:</label>
                <input type="text" name="first_name" value={formData.user.first_name} onChange={handleChange} required />
    
                <label>Отчество:</label>
                <input type="text" name="father_name" value={formData.user.father_name} onChange={handleChange} />
    
                <label>Телефон:</label>
                <input type="tel" name="phone" value={formData.user.phone} onChange={handleChange} required />
    
                <label>Email:</label>
                <input type="email" name="email" value={formData.user.email} onChange={handleChange} required />
    
                <button type="submit">Отправить</button>
            </form>
        </div>
    );
    
}

export default Submit;
export {};
