import express from "express";
import signup from "./routes/signup";
import auth from "./routes/auth";
import healthcheck from "./routes/healthcheck";
import booking from "./routes/booking";
import agenda from "./routes/agenda";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const app = express();
app.use(express.json());
app.use(signup);
app.use(auth);
app.use(healthcheck);
app.use(booking);
app.use(agenda);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
