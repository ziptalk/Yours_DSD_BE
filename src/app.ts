import express, { Request, Response, NextFunction } from "express";
import config from "./config";

const app = express();
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("SERVER CONNECTED");
});
app.listen(config.port, () => {
  console.log(`
    ###########################################
      ✨ SERVER LISTENING ON PORT: ${config.port} ✨
    ###########################################
  `);
});
