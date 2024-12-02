/**
 * @fileoverview UserContext provides authentication and user management functionality
 */

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { server } from "../main";
import toast, { Toaster } from "react-hot-toast";
import { refreshCsrfToken } from "../utils/csrf";

/**
 * @typedef {Object} User
 * @property {string} _id - User's unique identifier
 * @property {string} name - User's name
 * @property {string} email - User's email
 * @property {string} role - User's role (admin/user)
 * @property {Array} courses - Courses the user is enrolled in
 */

/**
 * @typedef {Object} UserContextType
 * @property {Function} loginUser - Authenticates a user
 * @property {User} user - Current user data
 * @property {Function} setUser - Updates user data
 * @property {boolean} isAuth - Authentication status
 * @property {Function} setIsAuth - Updates authentication status
 * @property {boolean} btnLoading - Loading state for buttons
 * @property {boolean} loading - General loading state
 * @property {Function} fetchUser - Fetches current user data
 * @property {Function} registerUser - Registers a new user
 * @property {Function} verifyUser - Verifies user email
 * @property {Function} updateProfile - Updates user profile
 * @property {Function} changePassword - Changes user password
 * @property {Function} fetchUserPayments - Fetches user payments
 * @property {Array} payments - User payment history
 * @property {boolean} isAdmin - Admin status
 * @property {Function} setIsAdmin - Updates admin status
 */

/** @type {React.Context<UserContextType>} */
const UserContext = createContext();

/**
 * @component
 * @description Provider component that wraps the application to provide user authentication and management
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserContextProvider = ({children}) => {
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    /**
     * Sets up axios defaults and CSRF token
     * @async
     * @function setupAxiosDefaults
     */
    const setupAxiosDefaults = async () => {
        axios.defaults.withCredentials = true;
        await refreshCsrfToken();
    };

    /**
     * Authenticates a user
     * @async
     * @function loginUser
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @param {Function} navigate - Navigation function
     */
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

    /**
     * Registers a new user
     * @async
     * @function registerUser
     * @param {string} name - User's name
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @param {Function} navigate - Navigation function
     */
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

    /**
     * Updates user profile
     * @async
     * @function updateProfile
     * @param {string} name - New name
     * @param {string} email - New email
     * @param {Function} navigate - Navigation function
     */
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

    /**
     * Changes user password
     * @async
     * @function changePassword
     * @param {string} password - New password
     * @param {Function} navigate - Navigation function
     */
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

    /**
     * Verifies user email with OTP
     * @async
     * @function verifyUser
     * @param {string} activationToken - Email activation token
     * @param {string} otp - One-time password
     * @param {Function} navigate - Navigation function
     */
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

    /**
     * Fetches user payment history
     * @async
     * @function fetchUserPayments
     * @param {string} userId - User's ID
     */
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

    /**
     * Fetches current user data
     * @async
     * @function fetchUser
     */
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
        setupAxiosDefaults();
    }, []);

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
    );
};

/**
 * Custom hook to use the UserContext
 * @function UserData
 * @returns {UserContextType} User context values and functions
 * @throws {Error} If used outside of UserContextProvider
 */
export const UserData = () => useContext(UserContext);

