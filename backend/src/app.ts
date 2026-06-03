import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import preferenceRoutes from "./routes/preferenceRoutes";
import songRoutes from "./routes/songRoutes";
import lessonsRouter from "./routes/lessons";
import playlistRoutes from "./routes/playlistRoutes";

const app = express();

/*
=================================
Global Middlewares
=================================
*/

// CORS
app.use(cors());

// Parse JSON body
app.use(express.json());

// Parse URL encoded data
app.use(express.urlencoded({ extended: true }));

/*
=================================
Routes
=================================
*/

import userRoutes from "./routes/userRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/admin", songRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/lessons", lessonsRouter);
app.use("/api/playlists", playlistRoutes);


/*
=================================
Health Check Route
=================================
*/

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Lingofy API running"
  });
});

export default app;
