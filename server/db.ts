import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: '5.161.52.206',
  port: 3566,
  user: 'convite',
  password: 'a247d38c3ef256d11e77',
  database: 'convite',
  timezone: '-03:00'
};

export async function getConnection() {
  return await mysql.createConnection(DB_CONFIG);
}

export async function initializeDatabase() {
  const connection = await getConnection();

  try {
    // Create events table with basic structure first
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date_time DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        message TEXT,
        link_code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns if they don't exist
    try {
      await connection.execute(`ALTER TABLE events ADD COLUMN full_address TEXT`);
      console.log('Added full_address column');
    } catch (error: any) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding full_address column:', error);
      }
    }

    try {
      await connection.execute(`ALTER TABLE events ADD COLUMN phone VARCHAR(20)`);
      console.log('Added phone column');
    } catch (error: any) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding phone column:', error);
      }
    }

    try {
      await connection.execute(`ALTER TABLE events ADD COLUMN maps_link TEXT`);
      console.log('Added maps_link column');
    } catch (error: any) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding maps_link column:', error);
      }
    }

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
