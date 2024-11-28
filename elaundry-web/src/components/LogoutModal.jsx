import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase"; 
import { UserContext } from "../context/UserContext";

const LogoutModal = ({ isVisible, onClose }) => {
    const navigate = useNavigate();
    const { setUserRole } = useContext(UserContext); 

    const handleLogout = async () => {
        try {
            await signOut(auth);

            setUserRole(null);

            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    if (!isVisible) return null; 

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-sm p-6 bg-white rounded shadow-md">
                <h2 className="mb-4 text-xl font-bold">Logout</h2>
                <p className="mb-4">Are you sure you want to log out?</p>
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-black bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
