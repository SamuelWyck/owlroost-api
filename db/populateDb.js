const {Client} = require("pg");
const {readFileSync} = require("node:fs");
const path = require("node:path");



async function main() {
    console.log("seeding...");
    const schemaPath = "/schema.sql";
    const fullSchemaPath = path.join(__dirname, schemaPath);
    const schema = readFileSync(fullSchemaPath, {encoding: "utf8"});
    
    const client = new Client({
        connectionString: process.argv[2]
    });
    await client.connect();
    await client.query(schema);
    await client.end();
    console.log("done");
};


main();