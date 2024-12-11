import { fastifySwaggerBootstrap } from "@aiofc/fastify-server";
import { AppModule } from "./app.module";

fastifySwaggerBootstrap(AppModule);