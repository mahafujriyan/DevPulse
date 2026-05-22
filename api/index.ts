import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  return new Promise((resolve, reject) => {
    app(req, res, (err: unknown) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export const config = {
  maxDuration: 30,
};
