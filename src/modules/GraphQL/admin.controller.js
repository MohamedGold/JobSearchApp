import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./app.graph.js";
import { Router } from "express";

const adminGraphController = Router();

adminGraphController.use("/", createHandler({ schema }));

export default adminGraphController;
