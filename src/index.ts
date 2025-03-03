import express from "express";
import signup from "./routes/signup";
import auth from "./routes/auth";
import me from "./routes/me";
import booking from "./routes/booking";

const app = express();
app.use(express.json());
app.use(signup);
app.use(auth);
app.use(me);
app.use(booking);
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
