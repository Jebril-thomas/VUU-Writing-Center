const express = require("express");
const app = express();

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Hello");
});

// MORE routes here...

// ✅ THIS GOES AT THE VERY END
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
