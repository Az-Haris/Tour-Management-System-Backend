import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import {
  createNewAccessTokenWithRefreshToken,
} from "../../utils/userTokens";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";

// This function is now handled by Passport.js in auth.controller.ts
// const credentialsLogin = async (payload: Partial<IUser>) => {
//   // Business logic for user login
//   const { email, password } = payload;

//   const existingUser = await User.findOne({ email });

//   if (!existingUser) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "User with this email does not exist",
//     );
//   }

//   const isPasswordMatched = await bcryptjs.compare(
//     password as string,
//     existingUser.password as string,
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect");
//   }

//   const userTokens = createUserTokens(existingUser);
//   const { accessToken, refreshToken } = userTokens;

//   const userData = () => {
//     const userObj = existingUser.toObject();
//     delete userObj.password;
//     return userObj;
//   };

//   return { accessToken, refreshToken, user: userData() };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken,
  );

  return { accessToken: newAccessToken };
};

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

  const userId = decodedToken._id;
  const user = await User.findById(userId);


  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User with this id does not exist",
    );
  }

  const isPasswordMatched = await bcryptjs.compare(
    oldPassword,
    user.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password is incorrect");
  }

  const newHashedPassword = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUNDS));


  user.password = newHashedPassword;
  await user.save();
};

export const AuthServices = {
  // credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
