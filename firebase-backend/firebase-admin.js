const admin = require("firebase-admin");

// Load service account credentials
const serviceAccount = require("./elaundryproject-firebase-adminsdk-f84it-5d3b6adbe2.json"); // Update this path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://elaundryproject-default-rtdb.asia-southeast1.firebasedatabase.app", // Replace with your database URL
});

module.exports = admin;
