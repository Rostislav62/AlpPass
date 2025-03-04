import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/auth/register/";

function UserRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        family_name: "",
        first_name: "",
        father_name: "",
        phone: "",
        email: ""
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const userEmail = localStorage.getItem("user_email");
        if (userEmail) {
            navigate("/menu"); // Если пользователь уже авторизован, перенаправляем в меню
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!formData.family_name.trim() || !formData.first_name.trim() ||
            !formData.phone.trim() || !formData.email.trim()) {
            setErrorMessage("❌ Все обязательные поля должны быть заполнены!");
            return;
        }

        setIsSubmitting(true);
        const userData: any = {
            family_name: formData.family_name.trim(),
            first_name: formData.first_name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim()
        };

        if (formData.father_name.trim()) {
            userData.father_name = formData.father_name.trim();
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                setErrorMessage(`❌ Ошибка: ${data.message || "Неизвестная ошибка"}`);
                return;
            }

            setSuccessMessage("✅ Пользователь успешно зарегистрирован!");
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("user_email", formData.email);
            localStorage.setItem("user_name", `${formData.first_name} ${formData.family_name}`);
            navigate("/menu");
        } catch (error) {
            setErrorMessage("Ошибка сети. Проверьте подключение.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1>Регистрация пользователя</h1>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <label>Фамилия:</label>
                <input type="text" name="family_name" value={formData.family_name} onChange={handleChange} required />
                <label>Имя:</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                <label>Отчество:</label>
                <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} />
                <label>Телефон:</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Сохранение..." : "Сохранить"}</button>
            </form>
        </div>
    );
}

export default UserRegister;
