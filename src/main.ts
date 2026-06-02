const fn = process.argv[2];
if (fn === "validator") {
  import("./functions/tagoio-validator.ts");
} else if (fn === "generate") {
  import("./functions/generate-database.ts");
} else {
  console.log("Invalid function");
}
