-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    account_type ENUM('free', 'plus', 'business') DEFAULT 'free',
    status ENUM('online', 'away', 'busy', 'offline') DEFAULT 'offline',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Channels Table
CREATE TABLE IF NOT EXISTS channels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    channel_name VARCHAR(100) NOT NULL,
    channel_handle VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    channel_type ENUM('personal', 'professional', 'interest', 'event', 'business') DEFAULT 'personal',
    category VARCHAR(50),
    is_private BOOLEAN DEFAULT FALSE,
    is_monetized BOOLEAN DEFAULT FALSE,
    subscription_price DECIMAL(10, 2) DEFAULT 0.00,
    subscriber_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_channel_handle (channel_handle),
    INDEX idx_channel_type (channel_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    channel_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    post_type ENUM('text', 'voice', 'image', 'location', 'status') DEFAULT 'text',
    media_url VARCHAR(500),
    is_pinned BOOLEAN DEFAULT FALSE,
    reaction_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_channel_id (channel_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    channel_id INT NOT NULL,
    notification_level ENUM('all', 'important', 'none') DEFAULT 'all',
    is_paid BOOLEAN DEFAULT FALSE,
    subscription_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subscription (user_id, channel_id),
    INDEX idx_user_id (user_id),
    INDEX idx_channel_id (channel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactions Table
CREATE TABLE IF NOT EXISTS reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type ENUM('heart', 'clap', 'fire', 'hundred') DEFAULT 'heart',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    channel_id INT,
    post_id INT,
    type ENUM('new_post', 'new_subscriber', 'reaction', 'mention', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Channel Categories Table
CREATE TABLE IF NOT EXISTS channel_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Categories
INSERT INTO channel_categories (name, description, icon) VALUES
('Technology', 'Tech news, programming, gadgets', 'laptop'),
('Lifestyle', 'Daily life, personal moments', 'person'),
('Business', 'Entrepreneurship, startups, corporate', 'briefcase'),
('Entertainment', 'Movies, music, games', 'film'),
('Sports', 'Fitness, athletics, sports news', 'football'),
('Food', 'Cooking, recipes, restaurants', 'restaurant'),
('Travel', 'Adventures, destinations, tips', 'airplane'),
('Education', 'Learning, tutorials, courses', 'school'),
('Health', 'Wellness, fitness, mental health', 'fitness'),
('Art', 'Creative work, design, photography', 'color-palette');

-- User Sessions Table (for active connections)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    socket_id VARCHAR(255) NOT NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_socket_id (socket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;