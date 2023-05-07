import express from "express";
import { defaultRuleNames, handler } from "./handler.js";
import z from "zod";
import httpErrors from "http-errors";

export const requestBodySchema = z.object({
  url: z.string(),
  rules: z.string().array().optional(),
  headers: z.record(z.string()).optional(),
});

export type RequestBody = z.infer<typeof requestBodySchema>;

function main() {
  const app = express();
  app.use(express.json());
  app.post("/", async (req, res, next) => {
    try {
      const body = requestBodySchema.safeParse(req.body);
      if (!body.success) {
        throw new httpErrors.BadRequest(JSON.stringify(body.error));
      }
      const result = await handler(
        body.data.url,
        body.data.rules ?? defaultRuleNames,
        body.data.headers ?? {}
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("Error handling request", {
        err:
          err instanceof Error
            ? Object.assign(
                {
                  name: err.name,
                  message: err.message,
                  stack: err.stack,
                },
                err
              )
            : err,
      });

      if (httpErrors.isHttpError(err)) {
        res.status(err.statusCode);
        res.send(err.message);
      } else {
        res.status(500); // internal server error
        res.send("something bad happened");
      }
    }
  );

  const hostname = process.env.LISTEN_HOST ?? "0.0.0.0";
  const port = parseInt(process.env.LISTEN_PORT ?? "3000");

  app.listen(port, hostname, () => {
    console.info(`🚀 Listening on port http://${hostname}:${port}`);
  });
}

main();
