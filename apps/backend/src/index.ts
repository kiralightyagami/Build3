require("dotenv").config();
import cors from "cors";
import express from "express";
import { geminiRouter } from "./routes/geminiRouter";
import { claudeRouter } from "./routes/claudeRouter";
//import { authMiddleware } from "../middleware/middleware";
const app = express();

app.use(express.json());
app.use(cors());

//app.use(authMiddleware);

app.use("/api/v1/gemini", geminiRouter);
app.use("/api/v1/claude", claudeRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
