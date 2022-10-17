require('dotenv').config()

// Get ENV VARS and compute uri
const DB_URI = <string>process.env.DB_URI
const DB_PASSWORD = <string>process.env.DB_PASSWORD
const PORT = <number | string>process.env.PORT || 5000;
const db_uri = DB_URI.replace(/\<password\>/ig, encodeURIComponent(DB_PASSWORD))

// Starting server with database
import { app } from './app';
import DBSetup from './config/db';

new DBSetup().connectDB(db_uri, () => {
    app.listen(PORT, () => { console.log(`Server running on port http://localhost:${PORT}`) })
})
