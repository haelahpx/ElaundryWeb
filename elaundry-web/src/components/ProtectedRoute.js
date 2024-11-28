import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
    const { userId } = useContext(UserContext);

    if (!userId) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
    