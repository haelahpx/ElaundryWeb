import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { auth, database } from "../config/firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toastify

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
            toast.error("An error occurred while fetching location details."); // Replace alert with toast.error
        }
    };

    const geocodeAddress = async () => {
        if (!address || !city || !country) {
            toast.error("Please fill in the address, city, and country fields."); // Replace alert with toast.error
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
                toast.error("Address not found. Please refine your input."); // Replace alert with toast.error
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

            toast.success("Location found and updated on the map."); // Replace alert with toast.success
        } catch (error) {
            console.error("Error fetching geocoding data:", error);
            toast.error("An error occurred while trying to locate the address."); // Replace alert with toast.error
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        
        try {
            // Step 1: Create user with email and password using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
        
            // Step 2: Prepare user data to insert into 'users' table with the required structure
            const userData = {
                user_id: userId,  // User ID from Firebase Authentication
                name,
                email,
                phone,
                role: "admin", // Default role as 'admin'
                created_at: new Date().toLocaleString(), // Format the date as per the example
            };
    
            // Step 3: Generate unique shop_id for laundry shop
            const shopId = `${Math.random().toString(36).substr(2, 9)}${Date.now()}`;
    
            // Step 4: Prepare laundry shop data to insert into 'laundry_shops' table
            const shopData = {
                shop_id: shopId,  // Unique shop ID
                name: name || "Default Shop Name", // Default if no name is provided
                address: `${address}, ${city}, ${country}`, // Full address
                phone,
                admin_id: userId, // Link shop to the admin (user) via userId
                latitude,
                longitude,
                status: "active", // Default shop status
                created_at: new Date().toLocaleString(), // Format the date as per the example
                updated_at: new Date().toLocaleString(), // Format the date as per the example
            };
    
            // Step 5: Save laundry shop data to Firebase's 'laundry_shops' table
            await set(ref(database, `laundry_shops/${shopId}`), shopData);
    
            // Step 6: Update the user's record to include their laundry_shop_id
            await set(ref(database, `users/${userId}`), {
                ...userData,
                laundry_shop_id: shopId,  // Save the shop ID in the user's data
            });
    
            // Step 7: Show success toast
            toast.success("Registration successful! User and shop data saved to Firebase.");
        } catch (error) {
            // Error handling for registration and Firebase saving
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
        <div className="bg-gray-100 min-h-screen flex">
            <div className="w-full md:w-1/2 bg-white flex justify-center items-center p-8">
                <div className="w-full max-w-lg space-y-8">
                    <h2 className="text-4xl font-bold text-gray-800 text-center">Register</h2>

                    {message && (
                        <div className={`text-center text-sm font-medium ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                                    Name
                                </label>
                                <input
                                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500"
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
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 mt-4"
                        >
                            Find Address on Map
                        </button>

                        <div id="map" ref={mapContainerRef} className="rounded-lg mt-4 border border-gray-300" style={{ height: "250px" }}></div>

                        {isLoading ? (
                            <div className="text-center text-blue-500 font-medium mt-4">Processing your request...</div>
                        ) : (
                            <button
                                type="submit"
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg mt-6 focus:outline-none focus:ring-2 focus:ring-green-200"
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

            <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{ backgroundImage: `url('https://via.placeholder.com/800x1000')` }}></div>

            <ToastContainer /> {/* Add ToastContainer to render notifications */}
        </div>
    );
};

export default RegisterWithMap;
