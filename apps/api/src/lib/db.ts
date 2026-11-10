import { createDb } from "@mimelie/db";
import type { Env } from "../env";

export const getDb = (env: Env) => createDb(env.DB);
