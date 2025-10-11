const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    let connection;

    try {
        // Connect without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        const databaseName = process.env.DB_NAME || 'stay_tuned';

        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
        console.log(`✅ Database '${databaseName}' created or already exists`);

        // Switch to the database
        await connection.execute(`USE \`${databaseName}\``);

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        // Split SQL commands and execute them
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }

        console.log('✅ Database schema initialized successfully');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('\n🎉 Database initialization complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Database initialization failed:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };