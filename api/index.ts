import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/app";

const handler = serverless(app, {
  basePath: "",
});

export default async function vercelHandler(
  req: VercelRequest,
  res: VercelResponse
): Promise<unknown> {
  return handler(req, res);
}
