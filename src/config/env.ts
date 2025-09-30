import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    PORT: string | number;
    DB_URL: string;
    NODE_ENV: string;
}

const loadEnvironmentVariables = (): EnvConfig => {
    const requiredEnvironmentVariables = ["PORT", "DB_URL", "NODE_ENV"];
    requiredEnvironmentVariables.forEach(key=>{
        if(!process.env[key]){
            throw new Error(`Environment variable ${key} is not set`);
        }
    })
    return {
        PORT: process.env.PORT || 5000,
        DB_URL: process.env.DB_URL || "",
        NODE_ENV: process.env.NODE_ENV || "development",
    }
}

export const envVars = loadEnvironmentVariables();