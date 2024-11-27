import React, { useState, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebase.js";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext.jsx";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { setUserRole, setUserId, setLaundryShopId } = useContext(UserContext); // Access context functions

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            const userRef = ref(database, `users/${userId}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setUserRole(userData.role); // Set role in context
                setUserId(userId); // Set userId in context

                // Ensure that the laundryShopId is set correctly
                if (userData.laundry_shop_id) {
                    setLaundryShopId(userData.laundry_shop_id); // Set shopId in context
                } else {
                    toast.error("Laundry Shop ID not found for this user.");
                }

                // Save to localStorage
                localStorage.setItem('userId', userId);
                localStorage.setItem('laundryShopId', userData.laundry_shop_id || '');
                localStorage.setItem('userRole', userData.role);

                // Navigate to appropriate dashboard based on role
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
        <div className="bg-white flex h-screen">
            <div className="flex items-center justify-center w-1/2 p-10">
                <div className="px-12 py-12 w-full max-w-lg">
                    <form onSubmit={handleLogin} className="login-form">
                        <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700"
                                id="email"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700"
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded w-full" type="submit">
                            Login
                        </button>
                        <p className="mt-6 text-center text-gray-600 text-sm">
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
