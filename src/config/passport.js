const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
                proxy: true,
            }, async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in our db
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    done(null, user);
                } else {
                    // If not, create new user in our db
                    user = await new User({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
                        thumbnail: profile._json.picture || '',
                        tipo_usuario: 'cliente',
                    }).save();
                    done(null, user);
                }
            } catch (err) {
                console.error(err);
                done(err, null);
            }
        })
        );
    }

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then((user) => {
            done(null, user);
        });
    });
};