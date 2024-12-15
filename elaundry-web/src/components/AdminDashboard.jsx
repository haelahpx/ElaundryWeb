import React, { useState, useEffect, useContext } from "react";
import { database, ref, get, set, remove, update } from "../config/firebase";
import { UserContext } from "../context/UserContext";
import Navbar from "./ui/navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const predefinedCategories = ["Dry cleaning", "Wash and iron", "Ironing", "Premium wash"];

const AdminDashboard = () => {
    const { userId, laundryShopId, username } = useContext(UserContext);
    const [categories, setCategories] = useState([]);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState({ category_name: "", price: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const getCurrentMonthAndYear = () => {
        const now = new Date();
        return { month: now.getMonth() + 1, year: now.getFullYear() };
    };

    useEffect(() => {
        const init = async () => {
            if (userId && laundryShopId) {
                const fetchCategories = async () => {
                    setLoading(true);
                    try {
                        const categoriesRef = ref(database, `laundry_shops/${laundryShopId}/categories`);
                        const snapshot = await get(categoriesRef);
                        if (snapshot.exists()) {
                            setCategories(Object.entries(snapshot.val()));
                        } else {
                            setCategories([]);
                        }
                    } catch (error) {
                        console.error("Error fetching categories:", error);
                        toast.error("Failed to load categories.");
                    } finally {
                        setLoading(false);
                    }
                };

                const fetchOrders = async () => {
                    try {
                        const ordersRef = ref(database, 'ordermaster');
                        const snapshot = await get(ordersRef);
                        if (snapshot.exists()) {
                            const allOrders = snapshot.val();
                            const { month, year } = getCurrentMonthAndYear();
                            const filteredOrders = Object.entries(allOrders)
                                .filter(([key, value]) =>
                                    value.shopId === laundryShopId &&
                                    value.orderStatus === 'Completed' &&
                                    new Date(value.orderDate).getMonth() + 1 === month &&
                                    new Date(value.orderDate).getFullYear() === year
                                );
                            setOrders(filteredOrders);

                            const revenue = filteredOrders.reduce((sum, [id, order]) => sum + (order.price || 0), 0);
                            setTotalRevenue(revenue);
                        }
                    } catch (error) {
                        console.error("Error fetching orders:", error);
                        toast.error("Failed to load orders.");
                    }
                };

                fetchCategories();
                fetchOrders();
            } else {
                toast.error("User not logged in or Laundry Shop ID not available.");
            }
        };

        init();
    }, [userId, laundryShopId]);

    const handleAddCategory = async (categoryName) => {
        if (!laundryShopId) {
            toast.error("Laundry Shop ID is not available. Please log in again.");
            return;
        }

        setLoading(true);
        try {
            const categoryRef = ref(database, `laundry_shops/${laundryShopId}/categories/${categoryName}`);
            await set(categoryRef, { category_name: categoryName, price: 0, description: "" });

            setCategories((prev) => [
                ...prev,
                [categoryName, { category_name: categoryName, price: 0, description: "" }],
            ]);

            setModalType("");
            toast.success(`Category "${categoryName}" added successfully!`);
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Failed to add category. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        setLoading(true);
        try {
            const categoryRef = ref(database, `laundry_shops/${laundryShopId}/categories/${categoryName}`);
            await remove(categoryRef);
            setCategories((prev) => prev.filter(([key]) => key !== categoryName));
            toast.success(`Category "${categoryName}" deleted successfully!`);
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Failed to delete category. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { category_name, price, description } = formData;
            const categoryRef = ref(database, `laundry_shops/${laundryShopId}/categories/${category_name}`);
            await update(categoryRef, { price: Number(price), description });

            setCategories((prev) =>
                prev.map(([key, value]) =>
                    key === category_name ? [key, { ...value, price: Number(price), description }] : [key, value]
                )
            );

            setModalType("");
            toast.success("Category updated successfully!");
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Failed to update category. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const salesChartData = {
        labels: orders.map(([id, order]) => new Date(order.orderDate).toLocaleDateString()), 
        datasets: [
            {
                label: "Sales (in Rp)",
                data: orders.map(([id, order]) => order.price || 0),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
                borderColor: "#4A5568",
                borderWidth: 2,
                hoverBackgroundColor: "#2D3748",
                hoverBorderColor: "#CBD5E0",
            },
        ],
    };

    const salesChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#4A5568',
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                backgroundColor: '#2D3748',
                titleColor: '#EDF2F7',
                bodyColor: '#E2E8F0',
                borderWidth: 1,
                borderColor: '#CBD5E0',
            },
        },
        scales: {
            x: {
                grid: {
                    color: '#E2E8F0',
                },
                ticks: {
                    color: '#4A5568',
                },
            },
            y: {
                grid: {
                    color: '#E2E8F0',
                },
                ticks: {
                    color: '#4A5568',
                },
            },
        },
        animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
        },
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <Navbar />
            <div className="container p-6 mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-left text-blue-600">Admin Dashboard</h2>
                    <span className="text-xl text-blue-600">{username}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h3 className="mb-4 text-xl font-semibold text-blue-600">Total Revenue</h3>
                        <p className="text-2xl font-bold text-blue-600">Rp{totalRevenue}</p>
                    </div>

                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h3 className="mb-4 text-xl font-semibold text-blue-600">Sales Chart</h3>
                        <Bar data={salesChartData} options={salesChartOptions} />
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                    {loading ? (
                        <div className="text-xl text-center text-blue-600">Loading...</div>
                    ) : categories.length > 0 ? (
                        categories.map(([categoryName, data]) => (
                            <div key={categoryName} className="p-6 transition duration-300 bg-white border border-gray-300 rounded-lg hover:border-blue-500">
                                <h3 className="text-xl font-semibold text-blue-600">{categoryName}</h3>
                                <p className="mb-4 text-gray-600">{data.description || "No description available."}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-blue-600">Price: Rp.{data.price}</span>
                                    <div>
                                        <button
                                            onClick={() => handleDeleteCategory(categoryName)}
                                            className="px-4 py-2 mr-2 text-white bg-red-500 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => {
                                                setModalType("edit");
                                                setFormData({ category_name: categoryName, price: data.price, description: data.description });
                                            }}
                                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-xl text-center text-blue-600">No categories found.</div>
                    )}
                </div>

                {/* Modal for adding/editing categories */}
                {modalType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold">{modalType === "edit" ? "Edit Category" : "Add Category"}</h2>
                            <form onSubmit={modalType === "edit" ? handleEditCategory : (e) => { e.preventDefault(); handleAddCategory(formData.category_name); }}>
                                <input
                                    type="text"
                                    placeholder="Category Name"
                                    className="w-full p-2 border border-gray-300 rounded mt-4"
                                    value={formData.category_name}
                                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="w-full p-2 border border-gray-300 rounded mt-4"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                                <textarea
                                    placeholder="Description"
                                    className="w-full p-2 border border-gray-300 rounded mt-4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <button type="submit" className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                                    {modalType === "edit" ? "Update Category" : "Add Category"}
                                </button>
                                <button
                                    onClick={() => setModalType("")}
                                    className="mt-2 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default AdminDashboard;
