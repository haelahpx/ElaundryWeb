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
                        .filter(([key, value]) => 
                            value.shopId === laundryShopId && value.orderStatus === 'Completed'
                        );

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


    return (
        <div className="flex flex-col h-screen bg-white">
            <Navbar />
            <div className="container p-6 mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-left text-blue-600">History</h2>
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
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-600">Tidak ada pesanan ditemukan.</div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default LaundryOrders;   
