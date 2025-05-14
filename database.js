// database.js
import sql from 'mssql';

let database = null;

export default class Database {
  // (keep all methods here unchanged: connect, disconnect, create, read, etc.)
}

// ✅ Use this config in your existing class-based connection logic
const config = {
  server: 'abddatabase.database.windows.net',
  database: 'abddb',
  authentication: {
    type: 'azure-active-directory-msi-app' // for system-assigned managed identity
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// ✅ Do NOT switch to old function-based style
export const createDatabaseConnection = async () => {
  database = new Database(config);
  await database.connect();
  await database.createTable(); // optional
  return database;
};
