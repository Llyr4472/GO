require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const path = require("path");
const connectDB = require("./db");
const Shortlink = require("./models/Shortlink");
const initializePassport = require("./passport");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Set the views directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use an environment variable for the secret key
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages setup
app.use(flash());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Connect to MongoDB
connectDB();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

// Login routes
app.get("/login", (req, res) => {
  res.render("login", { messages: req.flash() });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// Homepage (Admin Panel) - Protected route
app.get("/", isAuthenticated, async (req, res) => {
  const shortlinks = await Shortlink.find();
  res.render("admin", { shortlinks });
});

// Add a new shortlink - Protected route
app.post("/add", isAuthenticated, async (req, res) => {
  const { slug, destination } = req.body;
  await Shortlink.create({ slug, destination });
  res.redirect("/");
});

// Delete a shortlink - Protected route
app.post("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  await Shortlink.findByIdAndDelete(id);
  res.redirect("/");
});

// Redirect logic (for shortlinks)
app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const shortlink = await Shortlink.findOne({ slug });

  if (shortlink) {
    res.redirect(301, shortlink.destination);
  } else {
    res.status(404).send("Shortlink not found. <a href='/'>Go to admin panel</a>.");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});