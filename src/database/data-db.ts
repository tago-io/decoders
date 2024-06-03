import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("network"))) {
    await knex.schema.createTable("network", (table) => {
      table.text("id").primary();
      table.text("name").notNullable();
      table.text("version").notNullable();
      table.text("description").defaultTo(null);
      table.text("serial_number");  // JSON stringify
      table.text("documentation_url");
      table.text('device_parameters');  // JSON stringify
      table.text("middleware_endpoint");
      table.binary("logo");
      table.binary("icon");
      table.binary("banner");
      table.binary("payload_decoder");

      // creating indexes
      table.unique(["id"], {
        indexName: "device_network_pkey",
        storageEngineIndexType: "btree",
      });
    });
  }

  if (!(await knex.schema.hasTable("connector"))) {
    await knex.schema.createTable("connector", (table) => {
      table.text("id").primary();
      table.text("name").notNullable();
      table.text("version").notNullable();
      table.text("description").defaultTo(null);
      table.text('networks');  // JSON stringify
      table.text('device_parameters');  // JSON stringify
      table.text("install_text");
      table.text("install_end_text");
      table.text("device_annotation");
      table.binary("logo");
      table.binary("payload_decoder");

      // creating indexes
      table.unique(["id"], {
        indexName: "device_connector_pkey",
        storageEngineIndexType: "btree",
      });
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable("network")) {
    await knex.schema.dropTable("network");
  }

  if (await knex.schema.hasTable("connector")) {
    await knex.schema.dropTable("connector");
  }
}
