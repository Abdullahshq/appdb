// database.js
import sql from 'mssql';

let database = null;

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
  }

  async connect() {
    try {
      this.poolconnection = await sql.connect(this.config);
      this.connected = true;
      console.log('Database connected successfully.');
      return this.poolconnection;
    } catch (error) {
      console.error('Error connecting to the database:', error);
      this.connected = false;
    }
  }

  async disconnect() {
    try {
      if (this.connected) {
        await this.poolconnection.close();
        this.connected = false;
        console.log('Database disconnected successfully.');
      }
    } catch (error) {
      console.error('Error disconnecting from the database:', error);
    }
  }

  async executeQuery(query) {
    const request = this.poolconnection.request();
    const result = await request.query(query);
    return result.rowsAffected[0];
  }

  async create(data) {
    const request = this.poolconnection.request();
    request.input('firstName', sql.NVarChar(255), data.firstName);
    request.input('lastName', sql.NVarChar(255), data.lastName);

    const result = await request.query(
      `INSERT INTO Person (firstName, lastName) VALUES (@firstName, @lastName)`
    );

    return result.rowsAffected[0];
  }

  async readAll() {
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Person`);
    return result.recordsets[0];
  }

  async read(id) {
    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, +id)
      .query(`SELECT * FROM Person WHERE id = @id`);

    return result.recordset[0];
  }

  async update(id, data) {
    const request = this.poolconnection.request();
    request.input('id', sql.Int, +id);
    request.input('firstName', sql.NVarChar(255), data.firstName);
    request.input('lastName', sql.NVarChar(255), data.lastName);

    const result = await request.query(
      `UPDATE Person SET firstName=@firstName, lastName=@lastName WHERE id = @id`
    );

    return result.rowsAffected[0];
  }

  async delete(id) {
    const request = this.poolconnection.request();
    const result = await request
      .input('id', sql.Int, +id)
      .query(`DELETE FROM Person WHERE id = @id`);

    return result.rowsAffected[0];
  }

  async createTable() {
    if (!this.connected) {
      console.error('Cannot create table: No database connection.');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      this.executeQuery(
        `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Person')
         BEGIN
           CREATE TABLE Person (
             id int NOT NULL IDENTITY, 
             firstName varchar(255), 
             lastName varchar(255)
           );
         END`
      )
        .then(() => {
          console.log('Table created');
        })
        .catch((err) => {
          console.error(`Error creating table: ${err}`);
        });
    }
  }
}

// ✅ MSI-based Azure SQL connection config
const config = {
  server: 'abddatabase.database.windows.net',
  database: 'abddb',
  authentication: {
    type: 'azure-active-directory-msi-app' // System-assigned identity
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// ✅ Connection initializer
export const createDatabaseConnection = async () => {
  database = new Database(config);
  await database.connect();
  await database.createTable(); // Optional
  return database;
};
