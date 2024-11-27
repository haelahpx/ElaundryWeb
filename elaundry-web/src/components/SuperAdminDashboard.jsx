import React, { useState, useEffect, useContext } from "react";
import { database, ref, get, remove } from "../config/firebase";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { getAuth, deleteUser } from "firebase/auth";
import Navbar from "@/components/ui/navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SuperAdminDashboard = () => {
    const [laundryShops, setLaundryShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userId, userRole } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("User ID:", userId);
        console.log("User Role:", userRole);
        if (!userId || userRole !== "superadmin") {
            navigate("/login");
        }
    }, [userId, userRole, navigate]);

    useEffect(() => {
        const fetchLaundryShops = async () => {
            setLoading(true);
            try {
                const snapshot = await get(ref(database, "laundry_shops"));
                if (snapshot.exists()) {
                    const fetchedShops = Object.entries(snapshot.val()).map(([id, shop]) => ({
                        shop_id: id, // Firebase key as shop_id
                        admin_id: shop.admin_id, // Corresponds to user_id
                        ...shop,
                    }));
                    setLaundryShops(fetchedShops);
                } else {
                    setLaundryShops([]);
                }
            } catch (error) {
                console.error("Error fetching laundry shops:", error);
                toast.error(`Error fetching laundry shops: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchLaundryShops();
    }, []);

    const handleDeleteUser = async (adminId, shopId) => {
        console.log("Deleting User Auth and Database Entry:", adminId, shopId);
    
        if (!adminId || !shopId) {
            console.error("Missing required IDs for deletion. Aborting.");
            toast.error("Missing required IDs. Please check the data and try again.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:5000/delete-user", { // Update URL to match your backend server
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: adminId, shopId }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete user");
            }
    
            // Update local state to reflect deletion
            setLaundryShops((prevShops) => prevShops.filter((shop) => shop.shop_id !== shopId));
    
            toast.success("User and associated data have been deleted successfully.");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(`Error deleting user: ${error.message}`);
        }
    };
    
    return (
        <div className="superadmin-dashboard bg-gray-100 min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Super Admin Dashboard</h2>
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <div className="space-y-4">
                        {laundryShops.map((shop) => (
                            <div
                                key={shop.shop_id}
                                className="bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center"
                            >
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">{shop.name}</h4>
                                    <p className="text-sm text-gray-500 mb-1">Address: {shop.address}</p>
                                    <p className="text-sm text-gray-500 mb-1">Phone: {shop.phone}</p>
                                    <p className="text-sm text-gray-500 mb-1">Status: {shop.status}</p>
                                    <p className="text-sm text-gray-500">Created At: {shop.created_at}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteUser(shop.admin_id, shop.shop_id)}
                                    className="mt-4 md:mt-0 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default SuperAdminDashboard;
