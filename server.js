require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

const app = express();

app.disable("x-powered-by");

app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(compression());

app.use(express.json());

app.use(express.static(path.join(__dirname, "public"), {
    etag: false,
    lastModified: false,
    cacheControl: false
}));

const TARGET_DATE = new Date(process.env.TARGET);

const DESTINATION = process.env.DESTINATION;

if (isNaN(TARGET_DATE.getTime()))
{
    throw new Error("TARGET inválido no .env");
}

if (!DESTINATION)
{
    throw new Error("DESTINATION não definido.");
}

//========================================
// API - HORÁRIO
//========================================

app.get("/api/time", (req, res) =>
{

    res.set({
        "Cache-Control": "no-store"
    });

    res.json({

        now: new Date().toISOString(),

        target: TARGET_DATE.toISOString()

    });

});

//========================================
// CONTINUE
//========================================

app.post("/continue", (req, res) =>
{

    const now = Date.now();

    if (now < TARGET_DATE.getTime())
    {

        return res.status(403).json({

            error: "Countdown not finished."

        });

    }

    res.redirect(302, DESTINATION);

});

//========================================
// 404
//========================================

app.use((req, res) =>
{

    res.status(404).send("404");

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
{

    console.log("");

    console.log("=======================================");

    console.log("NOEMA TIMER ONLINE");

    console.log("http://localhost:" + PORT);

    console.log("Target:");

    console.log(TARGET_DATE.toISOString());

    console.log("=======================================");

});