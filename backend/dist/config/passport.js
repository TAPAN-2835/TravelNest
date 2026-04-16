"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const database_1 = require("./database");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email)
            return done(new Error('No email from Google'), undefined);
        let user = await database_1.prisma.user.findFirst({
            where: { OR: [{ googleId: profile.id }, { email }] },
        });
        if (!user) {
            user = await database_1.prisma.user.create({
                data: {
                    googleId: profile.id,
                    email,
                    name: profile.displayName,
                    avatar: profile.photos?.[0]?.value,
                },
            });
        }
        else if (!user.googleId) {
            user = await database_1.prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map