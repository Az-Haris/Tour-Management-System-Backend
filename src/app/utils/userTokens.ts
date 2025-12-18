import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IsActive, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";

export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  // const accessToken = jwt.sign(jwtPayload, "jwt_secret_key", {
  //   expiresIn: "1d",
  // });
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET as string,
    envVars.JWT_ACCESS_EXPIRES_IN as string,
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET as string,
    envVars.JWT_REFRESH_EXPIRES_IN as string,
  );

  return { accessToken, refreshToken };
};



export const createNewAccessTokenWithRefreshToken = async(refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

  const existingUser = await User.findOne({ email: verifiedRefreshToken.email });

  if (!existingUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User with this email does not exist",
    );
  }
  if(existingUser.isActive === IsActive.BLOCKED || existingUser.isActive === IsActive.INACTIVE){
    throw new AppError(httpStatus.FORBIDDEN, `Your account is ${existingUser.isActive}. Please contact support.`);
  }
  if(existingUser.isDeleted){
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been deleted. Please contact support.");
  }

  const jwtPayload = {
    userId: existingUser._id,
    email: existingUser.email,
    role: existingUser.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET as string,
    envVars.JWT_ACCESS_EXPIRES_IN as string,
  );

  return accessToken;
}
