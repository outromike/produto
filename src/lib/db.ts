import mysql from 'mysql2/promise';

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

let connection: mysql.Connection | null = null;

// Função para obter a conexão com o banco de dados
export async function getDbConnection() {
  // Se as credenciais do banco de dados não estiverem configuradas, não tente conectar.
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    return null;
  }
  
  if (connection === null || connection.connection.stream.destroyed) {
    try {
      connection = await mysql.createConnection(dbConfig);
    } catch (error) {
      console.error('Error connecting to the database:', error);
      // Retorna null em vez de lançar um erro para não quebrar a aplicação.
      return null;
    }
  }
  return connection;
}

// Função para criar as tabelas se elas não existirem
export async function setupDatabase() {
  const db = await getDbConnection();
  if (!db) return; // Não faz nada se a conexão não foi estabelecida

  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProductsTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      sku VARCHAR(255) NOT NULL,
      item VARCHAR(255),
      description TEXT,
      category VARCHAR(255),
      netWeight DECIMAL(10, 3),
      grossWeight DECIMAL(10, 3),
      volume DECIMAL(10, 6),
      dimensions VARCHAR(255),
      palletizationHeight INT,
      palletizationBase INT,
      barcode VARCHAR(255),
      packaging VARCHAR(255),
      measurementUnit VARCHAR(50),
      quantity INT,
      classification VARCHAR(10),
      unit ENUM('ITJ', 'JVL') NOT NULL,
      PRIMARY KEY (sku, unit)
    );
  `;
  
  const insertAdminUserQuery = `
    INSERT IGNORE INTO users (username, password) VALUES ('admin', 'password123');
  `;
   const insertDefaultUserQuery = `
    INSERT IGNORE INTO users (username, password) VALUES ('user', 'password');
  `;

  try {
    await db.execute(createUsersTableQuery);
    console.log('Users table created or already exists.');
    await db.execute(createProductsTableQuery);
    console.log('Products table created or already exists.');
    await db.execute(insertAdminUserQuery);
    await db.execute(insertDefaultUserQuery);
    console.log('Default users inserted or already exist.');
  } catch (error) {
    console.error('Error setting up the database:', error);
    throw error;
  }
}
