import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [laundryShopId, setLaundryShopId] = useState(localStorage.getItem('laundryShopId') || null);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

    useEffect(() => {
        if (userId && laundryShopId) {
            // Save these values to localStorage so that they persist across page reloads
            localStorage.setItem('userId', userId);
            localStorage.setItem('laundryShopId', laundryShopId);
            localStorage.setItem('userRole', userRole);
        }
    }, [userId, laundryShopId, userRole]);

    return (
        <UserContext.Provider value={{ userId, setUserId, laundryShopId, setLaundryShopId, userRole, setUserRole }}>
            {children}
        </UserContext.Provider>
    );
};
