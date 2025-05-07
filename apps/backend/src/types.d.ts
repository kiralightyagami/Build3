
declare namespace Express {
    interface Request {
        userId: string;
        role?: "user" | "system" | "assistant";
    }
}
