import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { loginFields } from "../constants/formFields";
import FormAction from "./FormAction";
import FormExtra from "./FormExtra";
import Input from "./Input";

const fields = loginFields;
let fieldsState = {};
fields.forEach(field => (fieldsState[field.id] = ''));

export default function Login() {
    const [loginState, setLoginState] = useState(fieldsState);
    const [errorMessage, setErrorMessage] = useState(''); // State to store error message
    const navigate = useNavigate();

    const handleChange = (e) => {
        setLoginState({ ...loginState, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = loginState;
    
        try {
            const response = await fetch('http://localhost:8081/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password: password }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
    
            if (data.success) {
                // Store the iduser in localStorage or any other state management tool you're using
                localStorage.setItem('iduser', data.iduser);
                // Redirect on successful login
                navigate('/upload-resume');
            } else {
                setErrorMessage('Email or password incorrect'); // Set specific error message
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage('Your Email or password incorrect. Please try again.');
        }
    };
    
    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px">
                {fields.map((field) => (
                    <Input
                        key={field.id}
                        handleChange={handleChange}
                        value={loginState[field.id]}
                        labelText={field.labelText}
                        labelFor={field.labelFor}
                        id={field.id}
                        name={field.name}
                        type={field.type}
                        isRequired={field.isRequired}
                        placeholder={field.placeholder}
                    />
                ))}
            </div>

            <FormExtra />
            <FormAction handleSubmit={handleSubmit} text="Login" />
            
            {errorMessage && (
                <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
            )}
        </form>
    );
}
