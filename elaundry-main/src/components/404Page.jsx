import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="text-center p-8">
                <h1 className="text-9xl font-extrabold tracking-widest text-red-600">
                    404
                </h1>
                <div className="bg-red-600 px-2 text-sm rounded rotate-12 absolute">
                    Page Not Found
                </div>
                <p className="mt-6 text-lg">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <div className="mt-10">
                    <Link
                        to="/"
                        className="relative inline-block text-sm font-medium text-red-600 group focus:outline-none focus:ring"
                    >
                        <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-red-600 group-hover:translate-y-0 group-hover:translate-x-0"></span>
                        <span className="relative block px-8 py-3 bg-gray-900 border border-current">
                            Go Back Home
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
