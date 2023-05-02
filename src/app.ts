import express, { Request, Response, NextFunction } from "express";
import config from "./config";
import router from "./routes";

const app = express();
app.use(express.json());
app.use("/api", router);
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("SERVER CONNECTED");
});
app.listen(config.port, () => {
  console.log(`
    ###########################################
      ✨ SERVER LISTENING ON PORT: ${config.port} ✨
         NODE_ENV IS ${config.env}
    ###########################################
  `);
});
