import { Application, send } from "https://deno.land/x/oak/mod.ts";

const env = Deno.env.toObject();
const app = new Application();

app.use(async (context) => {
  const path = context.request.url.pathname;
  
  if (path.startsWith("/")) {
    await send(context, path, {
      root: `${Deno.cwd()}/../build`,
      index: "index.html",
    });
  } else {
    await send(context, '/index.html', {
      root: `${Deno.cwd()}/../build`,
    });
  }
});

const port = env.PORT || 3000;

console.log(`Serving on http://localhost:${port}/`);
await app.listen({ port });

import connection from './connection.js';
connection(port);
