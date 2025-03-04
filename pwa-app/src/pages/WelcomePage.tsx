import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/auth/users/";

function WelcomePage() {
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleContinue = async () => {
        setErrorMessage(null);
        if (!email.trim()) {
            setErrorMessage("Введите email");
            return;
        }
        
        setIsChecking(true);
        try {
            const response = await fetch(`${API_URL}${email}/`);
            const data = await response.json();

            if (!response.ok) {
                setIsRegistered(false);
                return;
            }
            
            // Сохранение данных пользователя локально
            localStorage.setItem("user_id", data.id);
            localStorage.setItem("user_email", data.email);
            localStorage.setItem("user_name", `${data.first_name} ${data.family_name}`);
            
            navigate("/menu"); // Перейти в меню
        } catch (error) {
            console.error("Ошибка при проверке пользователя:", error);
            setErrorMessage("Ошибка сети. Попробуйте позже.");
        } finally {
            setIsChecking(false);
        }
    };

    const handleRegister = () => {
        navigate("/register"); // Переход к регистрации
    };

    return (
        <div>
            <h1>Добро пожаловать в AlpPass</h1>
            <p>Введите email, чтобы продолжить, или зарегистрируйтесь</p>
            
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            
            <input type="email" placeholder="Введите email" value={email} onChange={handleChange} required />
            
            {isRegistered === false ? (
                <button onClick={handleRegister}>Зарегистрироваться</button>
            ) : (
                <button onClick={handleContinue} disabled={isChecking}>
                    {isChecking ? "Проверка..." : "Продолжить"}
                </button>
            )}
        </div>
    );
}

export default WelcomePage;