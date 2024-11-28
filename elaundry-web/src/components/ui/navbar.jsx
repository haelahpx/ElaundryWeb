import React, { useState, useContext, useEffect } from "react";
import LogoutModal from "../LogoutModal";
import { UserContext } from "../../context/UserContext";

const Navbar = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const { userRole, setUserRole } = useContext(UserContext);

    useEffect(() => {
        if (!userRole) {
            const storedRole = localStorage.getItem("userRole");
            if (storedRole) setUserRole(storedRole);
        }
    }, [userRole, setUserRole]);

    const handleOpenModal = () => setModalVisible(true);
    const handleCloseModal = () => setModalVisible(false);

    return (
        <nav style={{ backgroundColor: "#467CC2", border: "none" }}>
            <div className="flex flex-wrap items-center justify-between max-w-screen-xl p-4 mx-auto">
                <a href="#" className="flex items-center">
                    <span className="self-center text-2xl font-semibold text-white whitespace-nowrap">
                        E-Laundry
                    </span>
                </a>
                <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul className="flex flex-col p-4 mt-4 font-medium bg-transparent border border-gray-100 rounded-lg md:p-0 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent">
                        {userRole === "admin" && (
                            <>
                                <li>
                                    <a href="/admin-dashboard" className="block px-3 py-2 text-white">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="/status" className="block px-3 py-2 text-white">
                                        Status
                                    </a>
                                </li>
                                <li>
                                    <a href="/sales" className="block px-3 py-2 text-white">
                                        Sales
                                    </a>
                                </li>
                                <li>
                                    <a href="/qrcode" className="block px-3 py-2 text-white">
                                        QRCode
                                    </a>
                                </li>
                            </>
                        )}
                        {userRole === "superadmin" && (
                            <li>
                                <a href="/superadmin-dashboard" className="block px-3 py-2 text-white">
                                    SuperAdmin Home
                                </a>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={handleOpenModal}
                                className="block px-3 py-2 text-white"
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
