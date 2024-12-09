import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/login";
import AdminDashboard from "./components/AdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import Register from "./components/register";
import { UserProvider } from "./context/UserContext";
import Qrcode from "./components/qrcode";
import NotFoundPage from "./components/404Page"; 
import Status from "./components/status";
import Sales from "./components/sales";

const App = () => {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/qrcode" element={<Qrcode />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
        </UserProvider>
    );
};


export default App;
