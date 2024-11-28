import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { auth, database } from "../config/firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css'; 

const RegisterWithMap = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null); 
    const markerRef = useRef(null); 
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState(-2.5);
    const [longitude, setLongitude] = useState(118.0);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current).setView([latitude, longitude], 5);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);

            const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

            marker.on("dragend", async () => {
                const latLng = marker.getLatLng();
                setLatitude(latLng.lat);
                setLongitude(latLng.lng);
                await fetchAddressDetails(latLng.lat, latLng.lng);
            });

            mapRef.current = map;
            markerRef.current = marker;
        }
    }, []); 

    const fetchAddressDetails = async (lat, lng) => {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setAddress(data.address?.road || "");
            setCity(data.address?.city || data.address?.town || data.address?.village || "");
            setCountry(data.address?.country || "");
        } catch (error) {
            console.error("Error fetching reverse geocoding data:", error);
            toast.error("An error occurred while fetching location details."); 
        }
    };

    const geocodeAddress = async () => {
        if (!address || !city || !country) {
            toast.error("Please fill in the address, city, and country fields."); 
            return;
        }

        const query = `${address}, ${city}, ${country}`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.length === 0) {
                toast.error("Address not found. Please refine your input."); 
                return;
            }

            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            setLatitude(lat);
            setLongitude(lon);

            if (mapRef.current && markerRef.current) {
                mapRef.current.setView([lat, lon], 13);
                markerRef.current.setLatLng([lat, lon]);
            }

            toast.success("Location found and updated on the map.");
        } catch (error) {
            console.error("Error fetching geocoding data:", error);
            toast.error("An error occurred while trying to locate the address.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
        
            const userData = {
                user_id: userId,  
                name,
                email,
                phone,
                role: "admin", 
                created_at: new Date().toLocaleString(), 
            };
    
            const shopId = `${Math.random().toString(36).substr(2, 9)}${Date.now()}`;
    
            const shopData = {
                shop_id: shopId, 
                name: name || "Default Shop Name", 
                address: `${address}, ${city}, ${country}`, 
                phone,
                admin_id: userId,
                latitude,
                longitude,
                status: "active", 
                created_at: new Date().toLocaleString(), 
                updated_at: new Date().toLocaleString(), 
            };
    
            await set(ref(database, `laundry_shops/${shopId}`), shopData);
    
            await set(ref(database, `users/${userId}`), {
                ...userData,
                laundry_shop_id: shopId, 
            });
    
            toast.success("Registration successful! User and shop data saved to Firebase.");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("This email is already in use. Please try another one.");
            } else {
                console.error("Error during registration:", error.message || error);
                toast.error("Error during registration: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    
    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex items-center justify-center w-full p-8 bg-white md:w-1/2">
                <div className="w-full max-w-lg space-y-8">
                    <h2 className="text-4xl font-bold text-center text-gray-800">Register</h2>

                    {message && (
                        <div className={`text-center text-sm font-medium ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                                    Name
                                </label>
                                <input
                                    className="block w-full p-3 mt-2 border border-gray-300 rounded-lg focus:border-blue-500"
                                    id="name"
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="block w-full p-3 mt-2 border border-gray-300 rounded-lg focus:border-blue-500"
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="phone">
                                    Phone
                                </label>
                                <input
                                    className="block w-full p-3 mt-2 border border-gray-300 rounded-lg focus:border-blue-500"
                                    id="phone"
                                    type="text"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="block w-full p-3 mt-2 border border-gray-300 rounded-lg focus:border-blue-500"
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="country">
                                    Country
                                </label>
                                <input
                                    className="block w-full p-3 mt-2 border border-gray-300 rounded-lg focus:border-blue-500"
                                    id="country"
                                    type="text"
                                    placeholder="Country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="city">
                                    City
                                </label>
                                <input
                                    className="block w-full p-3 mt-2 border border-gray-300 rounded-lg focus:border-blue-500"
                                    id="city"
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="address">
                                    Address
                                </label>
                                <input
                                    className="block w-full p-3 mt-2 border border-gray-300 rounded-lg focus:border-blue-500"
                                    id="address"
                                    type="text"
                                    placeholder="Address (e.g., street name)"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={geocodeAddress}
                            className="w-full py-3 mt-4 font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            Find Address on Map
                        </button>

                        <div id="map" ref={mapContainerRef} className="mt-4 border border-gray-300 rounded-lg" style={{ height: "250px" }}></div>

                        {isLoading ? (
                            <div className="mt-4 font-medium text-center text-blue-500">Processing your request...</div>
                        ) : (
                            <button
                                type="submit"
                                className="w-full py-3 mt-6 font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                            >
                                Register
                            </button>
                        )}
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{" "}
                        <a href="/" className="text-blue-500 hover:underline">
                            Go to Login
                        </a>
                    </p>
                </div>
            </div>

            <div className="hidden bg-center bg-cover md:block md:w-1/2" style={{ backgroundImage: `url('https://via.placeholder.com/800x1000')` }}></div>

            <ToastContainer />
        </div>
    );
};

export default RegisterWithMap;
