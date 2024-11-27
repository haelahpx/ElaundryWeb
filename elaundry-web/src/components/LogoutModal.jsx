import React, { useContext } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase"; // Adjust the path
import { UserContext } from "../context/UserContext"; // Adjust the path

const LogoutModal = ({ isVisible, onClose }) => {
    const navigate = useNavigate();
    const { setUserRole } = useContext(UserContext); // Access `setUserRole` from context

    const handleLogout = async () => {
        try {
            // Firebase sign out
            await signOut(auth);

            // Clear user role from context
            setUserRole(null);

            // Redirect to the login page
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    if (!isVisible) return null; // Don't render if the modal is not visible

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="p-6 max-w-sm bg-white rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Logout</h2>
                <p className="mb-4">Are you sure you want to log out?</p>
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg-gray-300 text-black rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogout}
                        className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
