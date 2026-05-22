import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { registerUser } from "../services/authService";
import { sendSuccess } from "../utils/response";

export async function signup(req: Request, res: Response): Promise<void> {
  const user = await registerUser(req.body);

  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: "User registered successfully",
    data: user,
  });
}
