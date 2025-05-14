import sql from 'mssql';

const config = {
  server: 'abddatabase.database.windows.net',
  database: 'abddb',
  authentication: {
    type: 'azure-active-directory-msi-app' // Ensure MSI is properly enabled
  },
  options: {
    encrypt: true, // Use encryption for connection
    trustServerCertificate: false // Set this to false if the server uses a valid certificate
  }
};

export async function createDatabaseConnection() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to Azure SQL');
    
    return {
      readAll: async () => (await pool.request().query('SELECT * FROM Persons')).recordset,
      read: async (id) => (await pool.request().input('id', sql.Int, id).query('SELECT * FROM Persons WHERE id = @id')).recordset[0],
      create: async (person) => (await pool.request()
          .input('firstName', sql.NVarChar, person.firstName)
          .input('lastName', sql.NVarChar, person.lastName)
          .query('INSERT INTO Persons (firstName, lastName) VALUES (@firstName, @lastName)')).rowsAffected,
      update: async (id, person) => (await pool.request()
          .input('id', sql.Int, id)
          .input('firstName', sql.NVarChar, person.firstName)
          .input('lastName', sql.NVarChar, person.lastName)
          .query('UPDATE Persons SET firstName = @firstName, lastName = @lastName WHERE id = @id')).rowsAffected,
      delete: async (id) => (await pool.request()
          .input('id', sql.Int, id)
          .query('DELETE FROM Persons WHERE id = @id')).rowsAffected
    };
  } catch (err) {
    console.error('Database connection failed', err);
    throw err;
  }
}
