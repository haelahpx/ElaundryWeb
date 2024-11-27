import React, { useState, useContext, useEffect } from "react";
import LogoutModal from "../LogoutModal";
import { UserContext } from "../../context/UserContext";

const Navbar = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const { userRole, setUserRole } = useContext(UserContext);

    useEffect(() => {
        // Fallback to localStorage if `userRole` is missing
        if (!userRole) {
            const storedRole = localStorage.getItem("userRole");
            if (storedRole) setUserRole(storedRole);
        }
    }, [userRole, setUserRole]);

    const handleOpenModal = () => setModalVisible(true);
    const handleCloseModal = () => setModalVisible(false);

    return (
        <nav style={{ backgroundColor: "#467CC2", border: "none" }}>
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="#" className="flex items-center">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                        E-Laundry
                    </span>
                </a>
                <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-transparent md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent">
                        {userRole === "admin" && (
                            <>
                                <li>
                                    <a href="/admin-dashboard" className="block py-2 px-3 text-white">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="/status" className="block py-2 px-3 text-white">
                                        Status
                                    </a>
                                </li>
                                <li>
                                    <a href="/sales" className="block py-2 px-3 text-white">
                                        Sales
                                    </a>
                                </li>
                                <li>
                                    <a href="/qrcode" className="block py-2 px-3 text-white">
                                        QRCode
                                    </a>
                                </li>
                            </>
                        )}
                        {userRole === "superadmin" && (
                            <li>
                                <a href="/superadmin-dashboard" className="block py-2 px-3 text-white">
                                    SuperAdmin Home
                                </a>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={handleOpenModal}
                                className="block py-2 px-3 text-white"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <LogoutModal isVisible={isModalVisible} onClose={handleCloseModal} />
        </nav>
    );
};

export default Navbar;
