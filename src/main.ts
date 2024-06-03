const fn = process.argv[2];
if (fn === "validator") {
  import("./functions/tagoio-validator");
} else if (fn === "generate") {
  import("./functions/generate-database");
} else {
  console.log('Invalid function');
}
