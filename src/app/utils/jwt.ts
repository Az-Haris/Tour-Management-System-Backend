import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export const generateToken = (payload: JwtPayload, secret: string, expiredIn: string) => {
    const token = jwt.sign(payload, secret, { expiresIn: expiredIn } as SignOptions);
    return token;
}

export const verifyToken = (token: string, secret: string): string | JwtPayload => {
    return jwt.verify(token, secret);
}