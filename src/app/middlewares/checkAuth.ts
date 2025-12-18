import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        throw new AppError(401, "Unauthorized");
      }
      //   const verifiedToken = jwt.verify(accessToken, "jwt_secret_key");
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET as string,
      );

      
      if (!verifiedToken || typeof verifiedToken === "string") {
        throw new AppError(401, "Unauthorized");
      }
      
      const existingUser = await User.findOne({ email: verifiedToken.email });

      if (!existingUser) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User with this email does not exist",
        );
      }
      if (
        existingUser.isActive === IsActive.BLOCKED ||
        existingUser.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `Your account is ${existingUser.isActive}. Please contact support.`,
        );
      }
      if (existingUser.isDeleted) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Your account has been deleted. Please contact support.",
        );
      }


      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          "Forbidden: You don't have enough permission to access this resource",
        );
      }

      req.user = verifiedToken as JwtPayload;
      next();
    } catch (error) {
      next(error);
    }
  };
