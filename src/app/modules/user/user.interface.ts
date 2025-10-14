import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    GUIDE = "GUIDE",
}

export interface IAuthProvider {
    provider: string; //e.g. google, credentials, facebook
    providerId: string; //e.g. google id, facebook id
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}

export interface IUser {
    name: string;
    email: string;
    password ?: string;
    phone ?: string;
    picture ?: string;
    address ?: string;
    isActive ?: IsActive;
    isDeleted ?: string;
    isVerified ?: string;
    role : Role;
    auths: IAuthProvider[];
    bookings ?: Types.ObjectId[];
    guides ?: Types.ObjectId[];
}