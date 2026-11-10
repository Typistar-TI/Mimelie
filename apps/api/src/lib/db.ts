import { createDb } from "@mimelie/db";
import type { Env } from "../env.js";

export const getDb = (env: Env) => createDb(env.DB);
