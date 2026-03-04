const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const routesPath = path.join(__dirname, "routes");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const loadRoutes = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            loadRoutes(fullPath);
        } else if (file.endsWith(".js")) {
            const route = require(fullPath);
            const folderName = path.basename(path.dirname(fullPath)).toLowerCase();

            app.use(`/api/${folderName}`, route);
        }
    });
};

loadRoutes(routesPath);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log(err);
});