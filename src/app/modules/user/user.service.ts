import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";

// Create a new user
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUNDS),
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

// Update user details
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  /**
   * email - cannot be updated
   * name, phone, password, address - can be updated
   * password - should be hashed before updating
   * role - can be updated only by admin and super-admin
   * promoting to super-admin - only super-admin can do that
   */

  const existingUser = await User.findById(userId);
  if(!existingUser){
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found",
    );
  }

  if(payload.role) {
    if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to update role",
      );
    }

    if(payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN){
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to promote to super-admin",
      );
    }
  }

  if(payload.isActive || payload.isVerified || payload.isDeleted) {
    if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to update user status",
      );
    }
  }

  if(payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUNDS),
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(
    userId,
    payload,
    { new: true, runValidators: true },
  );

  return newUpdatedUser;
};

// Get all users
const getAllUsers = async () => {
  const users = await User.find({});

  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
};
