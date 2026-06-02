const fn = process.argv[2];
if (fn === "validator") {
  await import("./functions/tagoio-validator.ts");
} else if (fn === "generate") {
  await import("./functions/generate-database.ts");
} else {
  console.log("Invalid function");
}
