import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: '5.161.52.206',
  port: 3566,
  user: 'convite',
  password: 'a247d38c3ef256d11e77',
  database: 'convite'
};

export async function getConnection() {
  return await mysql.createConnection(DB_CONFIG);
}

export async function initializeDatabase() {
  const connection = await getConnection();
  
  try {
    // Create events table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_time DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        full_address TEXT,
        phone VARCHAR(20),
        maps_link TEXT,
        message TEXT,
        link_code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create confirmations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS confirmations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}
