import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ error: "Name must be a string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),
  email: z.email(),
  password: z
    .string()
    .min(6)
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least one special character",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least one number",
    }),
  phone: z
    .string({ error: "Phone must be a string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone must be a valid Bangladeshi phone number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ error: "Address must be a string" })
    .max(200, { message: "Address must be at most 200 characters long" })
    .optional(),
});


export const updateUserZodSchema = z.object({
  name: z
    .string({ error: "Name must be a string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" })
    .optional(),
  password: z
    .string()
    .min(6)
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least one special character",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least one number",
    })
    .optional(),
  phone: z
    .string({ error: "Phone must be a string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone must be a valid Bangladeshi phone number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ error: "Address must be a string" })
    .max(200, { message: "Address must be at most 200 characters long" })
    .optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isDeleted: z.boolean({ error: "isDeleted must ba true or false" }).optional(),
  isVerified: z
    .boolean({ error: "isVerified must ba true or false" })
    .optional(),
});
