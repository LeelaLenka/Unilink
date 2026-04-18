const dotenv = require("dotenv");
dotenv.config();

const { createServer } = require("./server");

async function main() {
  const { app, connectDb } = createServer();
  await connectDb();

  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`UniLink API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

