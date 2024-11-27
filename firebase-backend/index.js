const express = require("express");
const admin = require("./firebase-admin"); // Import Firebase Admin SDK
const app = express();

app.use(express.json()); // Parse incoming JSON requests

// Delete User API
app.post("/delete-user", async (req, res) => {
    const { userId, shopId } = req.body;

    if (!userId || !shopId) {
        return res.status(400).json({ error: "Missing userId or shopId" });
    }

    try {
        // Step 1: Delete user from Firebase Authentication
        await admin.auth().deleteUser(userId);

        // Step 2: Delete user data from Firebase Realtime Database
        const db = admin.database();
        await db.ref(`users/${userId}`).remove();
        await db.ref(`laundry_shops/${shopId}`).remove();

        res.status(200).json({ message: "User and associated data deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    