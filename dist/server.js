"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
// Get ENV VARS and compute uri
const DB_URI = process.env.DB_URI;
const DB_PASSWORD = process.env.DB_PASSWORD;
const PORT = process.env.PORT || 5000;
const db_uri = DB_URI.replace(/\<password\>/ig, encodeURIComponent(DB_PASSWORD));
// Starting server with database
const app_1 = require("./app");
const db_1 = __importDefault(require("./config/db"));
new db_1.default().connectDB(db_uri, () => {
    app_1.app.listen(PORT, () => { console.log(`Server running on port http://localhost:${PORT}`); });
});
