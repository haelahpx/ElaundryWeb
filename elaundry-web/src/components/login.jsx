import React, { useState, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebase.js";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext.jsx";
import { ToastContainer, toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css'; 

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { setUserRole, setUserId, setLaundryShopId } = useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            const userRef = ref(database, `users/${userId}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setUserRole(userData.role); 
                setUserId(userId);

                if (userData.laundry_shop_id) {
                    setLaundryShopId(userData.laundry_shop_id);
                } else {
                    toast.error("Laundry Shop ID not found for this user.");
                }

                localStorage.setItem('userId', userId);
                localStorage.setItem('laundryShopId', userData.laundry_shop_id || '');
                localStorage.setItem('userRole', userData.role);

                if (userData.role === "admin") {
                    navigate("/admin-dashboard");
                    toast.success("Welcome Admin!");
                } else if (userData.role === "superadmin") {
                    navigate("/superadmin-dashboard");
                    toast.success("Welcome Superadmin!");
                } else {
                    navigate("/");
                    toast.success("Login successful!");
                }
            } else {
                toast.error("User not found in the database.");
            }
        } catch (err) {
            toast.error("Invalid email or password.");
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <div className="flex items-center justify-center w-1/2 p-10">
                <div className="w-full max-w-lg px-12 py-12">
                    <form onSubmit={handleLogin} className="login-form">
                        <h2 className="mb-8 text-3xl font-bold text-center">Login</h2>
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 py-3 text-gray-700 border rounded shadow appearance-none"
                                id="email"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="w-full px-4 py-3 text-gray-700 border rounded shadow appearance-none"
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="w-full px-4 py-3 font-bold text-white bg-blue-500 rounded hover:bg-blue-700" type="submit">
                            Login
                        </button>
                        <p className="mt-6 text-sm text-center text-gray-600">
                            Don’t have an account?{" "}
                            <a href="/register" className="text-blue-500 hover:underline">Register</a>
                        </p>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;
