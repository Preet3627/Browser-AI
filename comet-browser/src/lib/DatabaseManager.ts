/**
 * Automatic SQL Table Generator for Comet Browser
 * Creates database schema for bookmarks, history, passwords, and sync
 */

const mysql = require('mysql2/promise');

export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export class DatabaseManager {
    private config: DatabaseConfig;
    private connection: any = null;

    constructor(config: DatabaseConfig) {
        this.config = config;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: this.config.host,
                port: this.config.port,
                user: this.config.user,
                password: this.config.password,
            });

            // Create database if not exists
            await this.connection.query(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\``);
            await this.connection.query(`USE \`${this.config.database}\``);

            console.log('[DB] Connected successfully');
            return true;
        } catch (error) {
            console.error('[DB] Connection failed:', error);
            return false;
        }
    }

    async initializeTables() {
        if (!this.connection) {
            throw new Error('Database not connected');
        }

        const tables = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                display_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_sync TIMESTAMP NULL,
                device_id VARCHAR(255),
                INDEX idx_email (email),
                INDEX idx_device (device_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

            // Bookmarks table
            `CREATE TABLE IF NOT EXISTS bookmarks (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                url TEXT NOT NULL,
                title VARCHAR(500),
                icon_url TEXT,
                folder VARCHAR(255) DEFAULT 'default',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_folder (folder),
                INDEX idx_deleted (deleted)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

            // History table
            `CREATE TABLE IF NOT EXISTS history (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                url TEXT NOT NULL,
                title VARCHAR(500),
                visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                visit_count INT DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_visit_time (visit_time)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

            // Encrypted passwords table
            `CREATE TABLE IF NOT EXISTS passwords (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                site VARCHAR(255) NOT NULL,
                username VARCHAR(255),
                encrypted_password TEXT NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_site (site),
                INDEX idx_deleted (deleted)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

            // Tabs sync table
            `CREATE TABLE IF NOT EXISTS tabs (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                device_id VARCHAR(255) NOT NULL,
                url TEXT NOT NULL,
                title VARCHAR(500),
                position INT DEFAULT 0,
                active BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_device (user_id, device_id),
                INDEX idx_active (active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

            // Settings sync table
            `CREATE TABLE IF NOT EXISTS settings (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                setting_key VARCHAR(255) NOT NULL,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_setting (user_id, setting_key),
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

            // Sync log table
            `CREATE TABLE IF NOT EXISTS sync_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                device_id VARCHAR(255) NOT NULL,
                sync_type ENUM('bookmarks', 'history', 'passwords', 'tabs', 'settings') NOT NULL,
                sync_direction ENUM('push', 'pull') NOT NULL,
                items_count INT DEFAULT 0,
                sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('success', 'failed', 'partial') DEFAULT 'success',
                error_message TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_device (user_id, device_id),
                INDEX idx_sync_time (sync_time)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        ];

        try {
            for (const tableSQL of tables) {
                await this.connection.query(tableSQL);
            }
            console.log('[DB] All tables created/verified successfully');
            return true;
        } catch (error) {
            console.error('[DB] Table creation failed:', error);
            return false;
        }
    }

    async syncBookmarks(userId: string, bookmarks: any[], direction: 'push' | 'pull') {
        if (direction === 'push') {
            // Push local bookmarks to server
            for (const bookmark of bookmarks) {
                await this.connection.query(
                    `INSERT INTO bookmarks (id, user_id, url, title, icon_url, folder) 
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE 
                     url = VALUES(url), title = VALUES(title), icon_url = VALUES(icon_url), 
                     folder = VALUES(folder), updated_at = CURRENT_TIMESTAMP`,
                    [bookmark.id, userId, bookmark.url, bookmark.title, bookmark.icon, bookmark.folder || 'default']
                );
            }
        } else {
            // Pull bookmarks from server
            const [rows] = await this.connection.query(
                'SELECT * FROM bookmarks WHERE user_id = ? AND deleted = FALSE',
                [userId]
            );
            return rows;
        }
    }

    async syncHistory(userId: string, history: any[], direction: 'push' | 'pull') {
        if (direction === 'push') {
            for (const item of history) {
                await this.connection.query(
                    `INSERT INTO history (id, user_id, url, title, visit_time, visit_count) 
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE visit_count = visit_count + 1`,
                    [item.id || `hist-${Date.now()}-${Math.random()}`, userId, item.url, item.title, new Date(), 1]
                );
            }
        } else {
            const [rows] = await this.connection.query(
                'SELECT * FROM history WHERE user_id = ? ORDER BY visit_time DESC LIMIT 1000',
                [userId]
            );
            return rows;
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('[DB] Connection closed');
        }
    }
}

// Auto-initialize on import
export async function initializeDatabase(config: DatabaseConfig) {
    const db = new DatabaseManager(config);
    const connected = await db.connect();
    if (connected) {
        await db.initializeTables();
    }
    return db;
}
