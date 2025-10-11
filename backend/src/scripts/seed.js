const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stay_tuned',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Configuration
const CONFIG = {
    USERS_COUNT: 100,
    CHANNELS_COUNT: 50,
    POSTS_COUNT: 500,
    MIN_SUBSCRIPTIONS_PER_USER: 5,
    MAX_SUBSCRIPTIONS_PER_USER: 15,
    MAX_REACTIONS_PER_POST: 10,
    NOTIFICATIONS_COUNT: 200
};

// Categories from database
const CATEGORIES = [
    'Technology', 'Lifestyle', 'Business', 'Entertainment',
    'Sports', 'Food', 'Travel', 'Education', 'Health', 'Art'
];

const CHANNEL_TYPES = ['personal', 'professional', 'interest', 'event', 'business'];
const POST_TYPES = ['text', 'voice', 'image', 'location', 'status'];
const REACTION_TYPES = ['heart', 'clap', 'fire', 'hundred'];
const NOTIFICATION_TYPES = ['new_post', 'new_subscriber', 'reaction', 'mention', 'system'];
const STATUSES = ['online', 'away', 'busy', 'offline'];
const ACCOUNT_TYPES = ['free', 'plus', 'business'];

async function clearTables() {
    console.log('🧹 Clearing existing data...');
    const tables = [
        'user_sessions', 'notifications', 'reactions',
        'subscriptions', 'posts', 'channels', 'users'
    ];

    for (const table of tables) {
        await pool.execute(`DELETE FROM ${table}`);
        console.log(`   Cleared ${table}`);
    }
}

async function generateUsers() {
    console.log('👥 Generating users...');
    const users = [];

    for (let i = 0; i < CONFIG.USERS_COUNT; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const username = faker.internet.username({ firstName, lastName }).toLowerCase().replace(/[^a-z0-9_]/g, '');
        const email = faker.internet.email({ firstName, lastName });
        const password_hash = '$2a$10$fake.hash.for.demo.purposes.only'; // Fake hash
        const full_name = `${firstName} ${lastName}`;
        const bio = faker.lorem.sentences(2);
        const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        const is_verified = faker.datatype.boolean(0.2); // 20% verified
        const account_type = faker.helpers.arrayElement(ACCOUNT_TYPES);
        const status = faker.helpers.arrayElement(STATUSES);
        const last_seen = faker.date.recent({ days: 7 });
        const created_at = faker.date.past(2);

        users.push({
            username,
            email,
            password_hash,
            full_name,
            bio,
            avatar_url,
            is_verified,
            account_type,
            status,
            last_seen,
            created_at
        });
    }

    for (const user of users) {
        await pool.execute(`
            INSERT INTO users (username, email, password_hash, full_name, bio, avatar_url,
                              is_verified, account_type, status, last_seen, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user.username, user.email, user.password_hash, user.full_name, user.bio,
            user.avatar_url, user.is_verified, user.account_type, user.status,
            user.last_seen, user.created_at
        ]);
    }

    console.log(`   ✅ Created ${users.length} users`);

    // Get inserted users with IDs
    const [rows] = await pool.execute('SELECT id, username, full_name FROM users ORDER BY id');
    return rows;
}

async function generateChannels(users) {
    console.log('📢 Generating channels...');
    const channels = [];

    for (let i = 0; i < CONFIG.CHANNELS_COUNT; i++) {
        const user = faker.helpers.arrayElement(users);
        const channel_name = faker.company.name() + ' ' + faker.company.catchPhrase();
        const channel_handle = channel_name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
        const description = faker.lorem.sentences(3);
        const channel_type = faker.helpers.arrayElement(CHANNEL_TYPES);
        const category = faker.helpers.arrayElement(CATEGORIES);
        const is_private = faker.datatype.boolean(0.1); // 10% private
        const is_monetized = faker.datatype.boolean(0.3); // 30% monetized
        const subscription_price = is_monetized ? parseFloat((Math.random() * 50 + 1).toFixed(2)) : 0;
        const is_active = faker.datatype.boolean(0.95); // 95% active
        const cover_image_url = faker.image.url();
        const created_at = faker.date.past({ years: 1 });

        channels.push({
            user_id: user.id,
            channel_name,
            channel_handle,
            description,
            channel_type,
            category,
            is_private,
            is_monetized,
            subscription_price,
            is_active,
            cover_image_url,
            created_at,
            owner_username: user.username,
            owner_full_name: user.full_name
        });
    }

    for (const channel of channels) {
        await pool.execute(`
            INSERT INTO channels (user_id, channel_name, channel_handle, description,
                                channel_type, category, is_private, is_monetized,
                                subscription_price, is_active, cover_image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            channel.user_id, channel.channel_name, channel.channel_handle, channel.description,
            channel.channel_type, channel.category, channel.is_private, channel.is_monetized,
            channel.subscription_price, channel.is_active, channel.cover_image_url, channel.created_at
        ]);
    }

    console.log(`   ✅ Created ${channels.length} channels`);

    // Get inserted channels with IDs
    const [rows] = await pool.execute(`
        SELECT c.*, u.username, u.full_name
        FROM channels c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.id
    `);
    return rows;
}

async function generateSubscriptions(users, channels) {
    console.log('📋 Generating subscriptions...');
    const subscriptions = new Set(); // To avoid duplicates

    for (const user of users) {
        const numSubscriptions = faker.number.int({
            min: CONFIG.MIN_SUBSCRIPTIONS_PER_USER,
            max: CONFIG.MAX_SUBSCRIPTIONS_PER_USER
        });

        const shuffledChannels = faker.helpers.shuffle(channels);
        const userSubscriptions = shuffledChannels.slice(0, numSubscriptions);

        for (const channel of userSubscriptions) {
            // Skip if user owns the channel
            if (channel.user_id === user.id) continue;

            const key = `${user.id}-${channel.id}`;
            if (subscriptions.has(key)) continue;

            subscriptions.add(key);

            const notification_level = faker.helpers.arrayElement(['all', 'important', 'none']);
            const is_paid = channel.is_monetized && faker.datatype.boolean(0.7); // 70% pay if monetized
            const subscription_start_date = faker.date.past({ years: 1 });
            const subscription_end_date = is_paid ? faker.date.future({ years: 1 }) : null;

            await pool.execute(`
                INSERT INTO subscriptions (user_id, channel_id, notification_level,
                                         is_paid, subscription_start_date, subscription_end_date)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [user.id, channel.id, notification_level, is_paid, subscription_start_date, subscription_end_date]);
        }
    }

    // Update subscriber counts
    await pool.execute(`
        UPDATE channels c
        SET subscriber_count = (
            SELECT COUNT(*) FROM subscriptions s WHERE s.channel_id = c.id
        )
    `);

    console.log(`   ✅ Created ${subscriptions.size} subscriptions`);
}

async function generatePosts(users, channels) {
    console.log('📝 Generating posts...');
    const posts = [];

    for (let i = 0; i < CONFIG.POSTS_COUNT; i++) {
        const channel = faker.helpers.arrayElement(channels);
        const user = faker.helpers.arrayElement(users); // Could be any user, but let's make it channel owner for simplicity
        const content = faker.lorem.sentences(faker.number.int({ min: 1, max: 5 }));
        const post_type = faker.helpers.arrayElement(POST_TYPES);
        const media_url = (post_type === 'image' || post_type === 'voice') ? faker.image.url() : null;
        const is_pinned = faker.datatype.boolean(0.05); // 5% pinned
        const created_at = faker.date.past({ years: 1 });

        posts.push({
            channel_id: channel.id,
            user_id: user.id, // For demo, allow any user to post
            content,
            post_type,
            media_url,
            is_pinned,
            created_at
        });
    }

    for (const post of posts) {
        await pool.execute(`
            INSERT INTO posts (channel_id, user_id, content, post_type, media_url, is_pinned, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            post.channel_id, post.user_id, post.content, post.post_type,
            post.media_url, post.is_pinned, post.created_at
        ]);
    }

    // Update post counts
    await pool.execute(`
        UPDATE channels c
        SET post_count = (
            SELECT COUNT(*) FROM posts p WHERE p.channel_id = c.id
        )
    `);

    console.log(`   ✅ Created ${posts.length} posts`);

    // Get inserted posts with IDs
    const [rows] = await pool.execute('SELECT * FROM posts ORDER BY id');
    return rows;
}

async function generateReactions(users, posts) {
    console.log('❤️ Generating reactions...');
    const reactions = new Set(); // To avoid duplicates

    for (const post of posts) {
        const numReactions = faker.number.int({ min: 0, max: CONFIG.MAX_REACTIONS_PER_POST });
        const shuffledUsers = faker.helpers.shuffle(users);
        const postReactors = shuffledUsers.slice(0, numReactions);

        for (const user of postReactors) {
            const key = `${post.id}-${user.id}`;
            if (reactions.has(key)) continue;

            reactions.add(key);

            const reaction_type = faker.helpers.arrayElement(REACTION_TYPES);
            const created_at = faker.date.between({ from: post.created_at, to: new Date() });

            await pool.execute(`
                INSERT INTO reactions (post_id, user_id, reaction_type, created_at)
                VALUES (?, ?, ?, ?)
            `, [post.id, user.id, reaction_type, created_at]);
        }
    }

    // Update reaction counts
    await pool.execute(`
        UPDATE posts p
        SET reaction_count = (
            SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id
        )
    `);

    console.log(`   ✅ Created ${reactions.size} reactions`);
}

async function generateNotifications(users, channels, posts) {
    console.log('🔔 Generating notifications...');
    const notifications = [];

    for (let i = 0; i < CONFIG.NOTIFICATIONS_COUNT; i++) {
        const type = faker.helpers.arrayElement(NOTIFICATION_TYPES);
        let user_id, channel_id = null, post_id = null, title, message;

        const user = faker.helpers.arrayElement(users);

        switch (type) {
            case 'new_post':
                const post = faker.helpers.arrayElement(posts);
                const channel = channels.find(c => c.id === post.channel_id);
                user_id = faker.helpers.arrayElement(users.filter(u => u.id !== post.user_id)).id; // Not the poster
                channel_id = post.channel_id;
                post_id = post.id;
                title = `New post in ${channel.channel_name}`;
                message = post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '');
                break;

            case 'new_subscriber':
                const subChannel = faker.helpers.arrayElement(channels);
                user_id = subChannel.user_id; // Channel owner
                channel_id = subChannel.id;
                title = 'New subscriber!';
                message = `Someone subscribed to ${subChannel.channel_name}`;
                break;

            case 'reaction':
                const reactionPost = faker.helpers.arrayElement(posts);
                user_id = reactionPost.user_id; // Post author
                post_id = reactionPost.id;
                channel_id = reactionPost.channel_id;
                title = 'Someone reacted to your post';
                message = '❤️ Your post received a reaction!';
                break;

            case 'mention':
                user_id = user.id;
                title = 'You were mentioned';
                message = `${faker.helpers.arrayElement(users).username} mentioned you in a post`;
                break;

            case 'system':
                user_id = user.id;
                title = 'System notification';
                message = faker.lorem.sentence();
                break;
        }

        const is_read = faker.datatype.boolean(0.7); // 70% read
        const created_at = faker.date.recent({ days: 30 });

        notifications.push({
            user_id,
            channel_id,
            post_id,
            type,
            title,
            message,
            is_read,
            created_at
        });
    }

    for (const notif of notifications) {
        await pool.execute(`
            INSERT INTO notifications (user_id, channel_id, post_id, type, title, message, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            notif.user_id, notif.channel_id, notif.post_id, notif.type,
            notif.title, notif.message, notif.is_read, notif.created_at
        ]);
    }

    console.log(`   ✅ Created ${notifications.length} notifications`);
}

async function generateUserSessions(users) {
    console.log('🔗 Generating user sessions...');
    const sessions = [];

    // Make some users online
    const onlineUsers = faker.helpers.shuffle(users);
    const selectedOnline = onlineUsers.slice(0, faker.number.int({ min: 10, max: 30 }));

    for (const user of selectedOnline) {
        const socket_id = faker.string.uuid();
        const connected_at = faker.date.recent({ hours: 2 });
        const last_activity = faker.date.recent({ minutes: 30 });

        sessions.push({
            user_id: user.id,
            socket_id,
            connected_at,
            last_activity
        });
    }

    for (const session of sessions) {
        await pool.execute(`
            INSERT INTO user_sessions (user_id, socket_id, connected_at, last_activity)
            VALUES (?, ?, ?, ?)
        `, [
            session.user_id, session.socket_id, session.connected_at, session.last_activity
        ]);
    }

    console.log(`   ✅ Created ${sessions.length} user sessions`);
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        await clearTables();

        const users = await generateUsers();
        const channels = await generateChannels(users);
        await generateSubscriptions(users, channels);
        const posts = await generatePosts(users, channels);
        await generateReactions(users, posts);
        await generateNotifications(users, channels, posts);
        await generateUserSessions(users);

        console.log('\n✅ Database seeding completed successfully!');
        console.log(`   📊 Summary:`);
        console.log(`      👥 Users: ${users.length}`);
        console.log(`      📢 Channels: ${channels.length}`);
        console.log(`      📝 Posts: ${posts.length}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the seeder
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('\n🎉 Seeding complete! Your database is now populated with realistic fake data.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };