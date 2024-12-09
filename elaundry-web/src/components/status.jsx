import React, { useState, useEffect, useContext } from 'react';
import { database, ref, get, update } from '../config/firebase';
import { UserContext } from '../context/UserContext';
import Navbar from './ui/navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LaundryOrders = () => {
    const { laundryShopId, username } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const statusOptions = [
        { value: 'On Progress', label: 'On Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Waiting for Payment', label: 'Waiting for Payment' },
        { value: 'Being Delivered', label: 'Being Delivered' },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            if (!laundryShopId) {
                toast.error('Laundry Shop ID tidak ditemukan. Silakan login ulang.');
                return;
            }

            setLoading(true);
            try {
                console.log('Fetching orders for shopId:', laundryShopId);
                const ordersRef = ref(database, 'ordermaster');
                const snapshot = await get(ordersRef);

                if (snapshot.exists()) {
                    const allOrders = snapshot.val();
                    console.log('Fetched orders:', allOrders);

                    const filteredOrders = Object.entries(allOrders)
                        .filter(([key, value]) => value.shopId === laundryShopId && value.orderStatus !== 'Completed');

                    console.log('Filtered orders:', filteredOrders);
                    setOrders(filteredOrders);
                } else {
                    console.warn('No orders found in the database.');
                    setOrders([]);
                }
            } catch (error) {
                console.error('Gagal memuat data orders:', error);
                toast.error('Gagal memuat data orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [laundryShopId]);

    const handleOpenModal = (orderId, orderData) => {
        setSelectedOrder({ orderId, ...orderData });
        setIsModalOpen(true);
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const { orderId } = selectedOrder; 
            console.log(`Updating order ${orderId} status to ${newStatus}`);
    
            const orderRef = ref(database, `ordermaster/${orderId}`);
            await update(orderRef, { orderStatus: newStatus });
    
            toast.success('Status berhasil diperbarui.');
            setIsModalOpen(false); 
    
            window.location.reload();
        } catch (error) {
            console.error('Gagal mengubah status:', error);
            toast.error('Gagal mengubah status order.');
        }
    };
    

    return (
        <div className="flex flex-col h-screen bg-white">
            <Navbar />
            <div className="container p-6 mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-left text-blue-600">Pesanan Laundry</h2>
                    <span className="text-xl text-blue-600">{username}</span>
                </div>

                {loading ? (
                    <div className="text-xl text-center text-blue-600">Memuat data...</div>
                ) : orders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map(([orderId, orderData]) => (
                            <div key={orderId} className="p-6 bg-white border rounded-lg shadow-md hover:border-blue-500">
                                <h3 className="text-xl font-semibold text-blue-600">
                                    {orderData.categoryName || 'Kategori Tidak Diketahui'}
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    <strong>Tanggal Pesanan:</strong> {orderData.orderDate || 'Tidak Tersedia'}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Status:</strong> {orderData.orderStatus || 'On Progress'}
                                </p>
                                <p className="mb-4 text-gray-600">
                                    <strong>Total:</strong> Rp{orderData.price || '0'}
                                </p>
                                <button
                                    onClick={() => handleOpenModal(orderId, orderData)}
                                    className="w-full px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
                                >
                                    Change Status
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-600">Tidak ada pesanan ditemukan.</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="mb-4 text-2xl font-bold text-blue-600">Change Status</h3>
                        <p className="mb-2 text-gray-600">
                            <strong>Pesanan:</strong> {selectedOrder.categoryName || 'Tidak Diketahui'}
                        </p>
                        <p className="mb-6 text-gray-600">
                            <strong>Status Saat Ini:</strong> {selectedOrder.orderStatus || 'On Progress'}
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`p-4 text-left rounded-lg transition 
                            ${selectedOrder.orderStatus === option.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                                        }`}
                                >
                                    <h4 className="text-lg font-semibold">{option.label}</h4>
                                    {selectedOrder.orderStatus === option.value && (
                                        <p className="text-sm italic">Status Terpilih</p>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default LaundryOrders;
