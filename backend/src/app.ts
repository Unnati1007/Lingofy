import express, { Request, Response } from "express";

const app = express();

/*
=================================
Global Middlewares
=================================
*/

// Parse JSON body
app.use(express.json());

// Parse URL encoded data
app.use(express.urlencoded({ extended: true }));

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