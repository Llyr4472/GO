const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

// Function to initialize Passport
const initializePassport = (passport) => {
  // Get admin credentials from environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  // Configure Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (username !== ADMIN_USERNAME) {
          return done(null, false, { message: "Incorrect username." });
        }
        const isMatch = await bcrypt.compare(password, await bcrypt.hash(ADMIN_PASSWORD, 10));
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, { id: 1, username: ADMIN_USERNAME }); // Simulate a user object
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    if (id === 1) {
      done(null, { id: 1, username: ADMIN_USERNAME }); // Simulate a user object
    } else {
      done(new Error("User not found"));
    }
  });
};

module.exports = initializePassport; // Export the function