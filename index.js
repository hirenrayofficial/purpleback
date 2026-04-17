const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const loginRouter = require("./router/loginRouter");
const accessRouter = require("./router/accesRouter");
const cors = require("cors")
const connectDb = require("./services/mongoDb/db");
const port = "0.0.0.0"


app.use(cors({
  origin: "https://purple.hirenray.rest",
  methods: [ "GET","POST", "PUT", "DELETE"],
  credentials:true,
}))







require("dotenv").config();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", loginRouter);
app.use("/api/v2", accessRouter);









connectDb();

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
