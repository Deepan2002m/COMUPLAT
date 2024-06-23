require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const cors = require('cors');
const { ServerClient } = require('postmark');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  keys: [process.env.COOKIE_KEY]
}));
app.use(passport.initialize());
app.use(passport.session());

// Postmark client
const postmarkClient = new ServerClient(process.env.POSTMARK_API_KEY);

// Mock database
let users = [];
let emails = [];

// Passport config
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(user => user.id === id);
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  let user = users.find(user => user.id === profile.id);
  if (!user) {
    user = { id: profile.id, name: profile.displayName, email: profile.emails[0].value };
    users.push(user);
  }
  done(null, user);
}));

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
);

app.get('/api/current_user', (req, res) => {
  res.send(req.user);
});

app.get('/api/logout', (req, res) => {
  req.logout();
  res.redirect(process.env.FRONTEND_URL);
});

app.get('/api/emails', (req, res) => {
  if (!req.user) return res.status(401).send('Not authenticated');
  const userEmails = emails.filter(email => email.userId === req.user.id);
  res.json(userEmails);
});

app.post('/api/send-email', async (req, res) => {
  if (!req.user) return res.status(401).send('Not authenticated');
  const { to, subject, body } = req.body;
  try {
    const response = await postmarkClient.sendEmail({
      From: req.user.email,
      To: to,
      Subject: subject,
      TextBody: body,
    });
    emails.push({ userId: req.user.id, to, subject, body, date: new Date() });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));