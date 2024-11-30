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

    const setupAxiosDefaults = async () => {
        axios.defaults.withCredentials = true;
        await refreshCsrfToken();
    };

    useEffect(() => {
        setupAxiosDefaults();
    }, []);
    
    async function loginUser(email, password, navigate) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/user/login`, {email, password});
            
            toast.success(data.message);
            localStorage.setItem("token", data.token);

            // Get new CSRF token after login
            await setupAxiosDefaults();

            setUser(data.user);
            setIsAuth(true);

            if (data.user.role === "admin") {
                setIsAdmin(true);
            }

            navigate("/");
        } catch (error) {
            setBtnLoading(false);
            setIsAuth(false);
            toast.error(error.response.data.message);

        } finally {
            setBtnLoading(false);
        }   
    }

    async function registerUser(name, email, password, navigate) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/user/register`, {name, email, password});

            toast.success(data.message);
            localStorage.setItem("activationToken", data.activationToken);

            navigate("/verify");
        } catch (error) {
            setBtnLoading(false);
            toast.error(error.response.data.message);
        } finally {
            setBtnLoading(false);
        }

    }

    async function updateProfile(name, email, navigate) {
        setBtnLoading(true);
        try {
            const {data} = await axios.put(`${server}/api/user/update`, {name, email}, {
                headers: {
                    "token": localStorage.getItem("token"),
                },
            });

            if (data.activationToken) {
                localStorage.setItem("activationToken", data.activationToken);
                navigate("/verify");
            } else {
                toast.success(data.message);
                navigate("/account");
            }
        } catch (error) {
            setBtnLoading(false);
            toast.error(error.response.data.message);
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
            await setupAxiosDefaults();

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
                }
            })

            setUser(data.user);
            setIsAuth(true);

            if (data.user.role === "admin") {
                setIsAdmin(true);
            }
        } catch (error) {
            console.log(error);
            setIsAuth(false);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

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
) 
};

export const UserData = () => useContext(UserContext);

