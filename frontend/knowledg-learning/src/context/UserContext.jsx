import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { server } from "../main";
import toast, { Toaster } from "react-hot-toast";
import { refreshCsrfToken } from "../utils/csrf";

const UserContext = createContext();

export const UserContextProvider = ({children}) => {
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Initial CSRF token setup
        refreshCsrfToken();
        // Refresh token every 30 minutes
        const refreshInterval = setInterval(refreshCsrfToken, 30 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, []);
    
    async function loginUser(email, password, navigate) {
        setBtnLoading(true);
        try {
            // Ensure we have a fresh CSRF token before login
            await refreshCsrfToken();
            
            const {data} = await axios.post(`${server}/api/user/login`, 
                {email, password},
                {withCredentials: true}
            );
            
            toast.success(data.message);
            localStorage.setItem("token", data.token);
            setUser(data.user);
            setIsAuth(true);

            if (data.user.role === "admin") {
                setIsAdmin(true);
            }

            navigate("/");
        } catch (error) {
            console.error('Login error:', error);
            setBtnLoading(false);
            setIsAuth(false);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setBtnLoading(false);
        }   
    }

    async function registerUser(name, email, password, navigate) {
        setBtnLoading(true);
        try {
            // Ensure fresh CSRF token
            await refreshCsrfToken();
            
            const {data} = await axios.post(`${server}/api/user/register`, 
                {name, email, password},
                {withCredentials: true}
            );

            toast.success(data.message);
            localStorage.setItem("activationToken", data.activationToken);
            navigate("/verify");
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setBtnLoading(false);
        }
    }

    async function updateProfile(name, email, navigate) {
        setBtnLoading(true);
        try {
            // Ensure fresh CSRF token
            await refreshCsrfToken();
            
            const {data} = await axios.put(
                `${server}/api/user/update`, 
                {name, email}, 
                {
                    headers: {
                        "token": localStorage.getItem("token"),
                    },
                    withCredentials: true
                }
            );

            if (data.activationToken) {
                localStorage.setItem("activationToken", data.activationToken);
                navigate("/verify");
            } else {
                toast.success(data.message);
                navigate("/account");
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setBtnLoading(false);
        }
    }

    async function changePassword(password, navigate) {
        setBtnLoading(true);
        try {
            const {data} = await axios.put(`${server}/api/user/change-password`, {password}, {
                headers: {
                    token: localStorage.getItem("token"),
                },
            });

            toast.success(data.message);
            navigate("/account");
        } catch (error) {
            setBtnLoading(false);
            toast.error(error.response.data.message);
        } finally {
            setBtnLoading(false);
        }
    }  

    async function verifyUser(activationToken, otp, navigate) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/user/verify`, {activationToken, otp});
            toast.success(data.message);

            localStorage.removeItem("activationToken");
            localStorage.setItem("token", data.token);

            // Get new CSRF token after login
            await refreshCsrfToken();

            setUser(data.user);
            setIsAuth(true);

            if (data.user.role === "admin") {
                setIsAdmin(true);
            }

            navigate("/account");

        } catch (error) {
            setBtnLoading(false);
            setIsAuth(false);
            toast.error(error.response.data.message);
        } finally {
            setBtnLoading(false);
        }
    }

    async function fetchUserPayments(userId) {
        try {
            const {data} = await axios.get(`${server}/api/user/${userId}/payments`, {
                headers: {
                    token: localStorage.getItem("token")
                }
            })

            setPayments(data.payments);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchUser() {
        setLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/user/me`, {
                headers: {
                    token: localStorage.getItem("token")
                },
                withCredentials: true
            });

            setUser(data.user);
            setIsAuth(true);

            if (data.user.role === "admin") {
                setIsAdmin(true);
            }
        } catch (error) {
            console.error('Fetch user error:', error);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <UserContext.Provider value={{
            loginUser, 
            user, setUser, 
            isAuth, setIsAuth, 
            btnLoading,
            loading,
            fetchUser,
            registerUser,
            verifyUser,
            updateProfile,
            changePassword,
            fetchUserPayments,
            payments,
            isAdmin, setIsAdmin
        }}>
            {children}
            <Toaster/>
        </UserContext.Provider>
    );
};

export const UserData = () => useContext(UserContext);

