import React, { useState } from "react";
import Navbar from "./ui/navbar";

const QRCodeGenerator = () => {
    const [userInput, setUserInput] = useState("");
    const [qrCodeURL, setQRCodeURL] = useState("");
    const [isGenerated, setIsGenerated] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userInput.trim()) {
            const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                userInput
            )}`;
            setQRCodeURL(qrURL);
            setIsGenerated(true);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
                    <h1 className="mb-6 text-3xl font-extrabold text-center text-gray-800">
                        QR Price Generator
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="userInput"
                                className="block text-lg font-medium text-gray-600"
                            >
                                Enter The Price
                            </label>
                            <input
                                type="text"
                                id="userInput"
                                className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg"
                                placeholder="put the price"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-md"
                        >
                            Generate QR Code
                        </button>
                    </form>
                    {isGenerated && (
                        <div id="qrResult" className="mt-8 text-center">
                            <h2 className="mb-4 text-xl font-semibold text-gray-700">
                                Your QR Code
                            </h2>
                            <img
                                id="qrImage"
                                className="mx-auto border-2 border-gray-300 rounded-lg shadow-md"
                                src={qrCodeURL}
                                alt="Generated QR Code"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default QRCodeGenerator;
