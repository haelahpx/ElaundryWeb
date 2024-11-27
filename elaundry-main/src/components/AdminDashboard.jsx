import React, { useState, useEffect, useContext } from "react";
import { database, ref, get, set, remove, update } from "../config/firebase"; 
import { UserContext } from "../context/UserContext";
import Navbar from "./ui/navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const predefinedCategories = ["Dry cleaning", "Wash and iron", "Ironing", "Premium wash"];

const AdminDashboard = () => {
    const { userId, laundryShopId, username } = useContext(UserContext); 
    const [categories, setCategories] = useState([]);
    const [modalType, setModalType] = useState(""); 
    const [formData, setFormData] = useState({ category_name: "", price: "", description: "" });
    const [loading, setLoading] = useState(false); 

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

                fetchCategories();
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

    return (
        <div className="flex flex-col h-screen bg-white">
            <Navbar />
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-left text-blue-600">Admin Dashboard</h2>
                    <span className="text-xl text-blue-600">{username}</span> {/* Display username */}
                </div>
                
                {/* Categories Cards */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center text-blue-600 text-xl">Loading...</div>
                    ) : categories.length > 0 ? (
                        categories.map(([categoryName, data]) => (
                            <div key={categoryName} className="bg-white p-6 rounded-lg border border-gray-300 hover:border-blue-500 transition duration-300">
                                <h3 className="text-xl font-semibold text-blue-600">{categoryName}</h3>
                                <p className="text-gray-600 mb-4">{data.description || "No description available."}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-blue-600">Price: ${data.price}</span>
                                    <div>
                                        <button
                                            onClick={() => handleDeleteCategory(categoryName)}
                                            className="px-4 py-2 bg-red-600 text-white rounded mr-2 hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => { setFormData(data); setModalType("edit"); }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No categories found.</div>
                    )}
                </div>

                <button
                    onClick={() => setModalType("add")}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Add Category
                </button>
            </div>

            {/* Modal for Adding Category */}
            {modalType === "add" && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-semibold text-center mb-6 text-blue-600">Choose a Category</h3>

                        {/* Category buttons (Predefined categories) */}
                        <div className="space-y-4">
                            {predefinedCategories.map((category) => {
                                const isSelected = categories.some(([key]) => key === category); // Check if category already exists
                                return (
                                    <button
                                        key={category}
                                        onClick={() => !isSelected && handleAddCategory(category)}
                                        className={`w-full py-3 text-lg font-semibold text-center rounded-lg ${isSelected ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'}`}
                                        disabled={isSelected}
                                    >
                                        {category} {isSelected && "(Already added)"}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setModalType("")}
                                className="px-6 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Editing Category */}
            {modalType === "edit" && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-semibold text-center mb-6 text-[#6C98D2]">Edit Category</h3>

                        <form onSubmit={handleEditCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2 text-[#6C98D2]">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.category_name}
                                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                    className="w-full p-3 border rounded"
                                    disabled
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2 text-[#6C98D2]">Price</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full p-3 border rounded"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2 text-[#6C98D2]">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border rounded"
                                />
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#6C98D2] text-white rounded hover:bg-blue-700 transition"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalType("")}
                                    className="px-6 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default AdminDashboard;
