const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
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
                        thumbnail: profile._json.picture
                    }).save();
                    done(null, user);
                }
            } catch (err) {
                console.error(err);
                done(err, null);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id).then((user) => {
            done(null, user);
        });
    });
};