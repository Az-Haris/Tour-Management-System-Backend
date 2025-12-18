import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          return done(null, false, {
            message: "User with this email does not exist",
          });
        }

        const isGoogleAuthenticated = existingUser.auths?.some(providerObjects => providerObjects.provider === "google");
        if (isGoogleAuthenticated && !existingUser.password) {
          return done(null, false, {
            message: "Please login using Google OAuth. To proceed, click on 'Login with Google' button. Then you can set a password in your profile settings if you wish to use email and password login in the future.",
          });
        }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          existingUser.password as string,
        );

        if (!isPasswordMatched) {
          return done(null, false, {
            message: "Password is incorrect",
          })
        }

        return done(null, existingUser, { message: "Login successful" });

      } catch (error) {
        console.log(error);
        return done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, {
            message: "No email found in Google profile",
          });
        }

        // Check if user exists in DB
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, user, {
          message: "Google authentication successful",
        });
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error as Error, false);
      }
    },
  ),
);

// frontend localhost:5173 -> backend localhost:5000/api/v1/auth/google -> passport -> google OAuth consent screen -> gmail login -> successful -> callback url: localhost:5000/api/v1/auth/google/callback -> db store -> token -> redirect to frontend

// Bridge == google -> user db sore -> token
// Custom  -> email, pass, name, role, ... -> registration -> DB -> user created
// Google -> req -> google sign in -> successful -> jwt token: role, email -> DB Store -> token -> api access

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (id: string, done: any) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  },
);
