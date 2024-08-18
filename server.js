const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());
const calendarificRouter = require("./routes/calendarificRoutes.js");
const port = process.env.PORT || 3000;

app.use('/', calendarificRouter);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});