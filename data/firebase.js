if(process.env.NODE_ENV != 'production'){
    require("dotenv").config();
}
// Initialise database (firebase)
const firebase = require("firebase/app");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const admin = require("firebase-admin");

const firebaseAccount = JSON.parse(process.env.FIREBASE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(firebaseAccount),
});

module.exports = admin.firestore();
