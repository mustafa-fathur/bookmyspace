require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { sequelize } = require("./models");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;
const shouldBypassDb = ["1", "true", "yes"].includes(
    String(process.env.BYPASS_DB_CONNECTION || 1).toLowerCase(),
);

// ─── View Engine ─────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─── Static Files ────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ─── Body Parsers ────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Session ─────────────────────────────────────────────
const sessionConfig = {
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
};

let sessionStore = null;
if (!shouldBypassDb) {
    sessionStore = new SequelizeStore({
        db: sequelize,
    });
    sessionConfig.store = sessionStore;
} else {
    console.warn(
        "BYPASS_DB_CONNECTION aktif. Server berjalan tanpa koneksi database.",
    );
}

app.use(session(sessionConfig));

// Create the session table if it doesn't exist
if (sessionStore) {
    sessionStore.sync().catch((error) => {
        console.error("Gagal sinkronisasi session table:", error.message);
    });
}

// ─── Global Template Variables ───────────────────────────
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// ─── Routes ──────────────────────────────────────────────
app.use("/", routes);

// ─── Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────
const startServer = async () => {
    if (shouldBypassDb) {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
        return;
    }

    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

startServer();
