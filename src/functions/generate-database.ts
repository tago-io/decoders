import path from "node:path";
import fs from "node:fs";
import knex, { type Knex } from "knex";
import { createNetworks } from "../helpers/create-networks";
import { createConnectors } from "../helpers/create-connectors";

let knexClient: Knex;

const migrationConfig: Knex.MigratorConfig = {
  tableName: "migrations",
  directory: path.join("src/database"),
  // Fixes the error: The migration directory is corrupt, the following files are missing
  disableMigrationsListValidation: true,
};

async function digestDecoders(knexClient: Knex): Promise<void> {
  try {
    await createNetworks(knexClient, "decoders/network");

    await createConnectors(knexClient, "decoders/connector");

    console.info("Database is ready! 🚀🔥");
  } catch (error) {
    console.error("Error on generating database:", error);
    process.exit(1);
  }
}

async function generateDatabase(data: { file: string; directory: string }): Promise<void> {
  fs.mkdirSync(data.directory, { recursive: true });

  const dbPath = path.join(data.directory, data.file);

  // Delete the .db file if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`Deleted existing database file at ${dbPath}`);
  }

  knexClient = knex({
    client: "better-sqlite3",
    connection: { filename: dbPath },
    useNullAsDefault: true,
  });

  knexClient.schema.createSchemaIfNotExists("decoders");

  await knexClient.migrate.latest(migrationConfig);

  await digestDecoders(knexClient);

  await knexClient.destroy();
}

generateDatabase({ directory: "data", file: "decoders.db" }).catch((error) => console.error(error));
