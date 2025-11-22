const RekLogStorage = require('./src/index');

async function example() {
  try {
    // Initialize storage with API key (auto-validates in background)
    console.log('Initializing RekLog Storage...');

    // Using development environment (default)
    const storage = new RekLogStorage('x', {
      apiUrl: 'http://localhost:3000/api',
      environment: 'development'  // Can be 'production', 'staging', etc.
    });

    console.log('Storage initialized. API key validation started...');
    console.log('Environment: development\n');

    // --- INSERT EXAMPLES ---
    console.log('=== INSERT EXAMPLES ===\n');

    // Insert 30 random users
    console.log('Inserting 30 random users...');
    const users = [];
    for (let i = 1; i <= 300; i++) {
      users.push({
        username: `user_${i}`,
        email: `user${i}@example.com`,
        age: Math.floor(Math.random() * 50) + 18,
        status: i % 3 === 0 ? 'inactive' : 'active',
        createdAt: new Date()
      });
    }

    const insertResult = await storage.insert('users', users);
    console.log(`✓ Inserted ${insertResult.insertedCount} users`);
    console.log('Storage ID:', storage.storageId);
    console.log('Database:', storage.databaseName);

    // Insert a single user
    console.log('\nInserting a single user...');
    const singleUser = await storage.insert('users', {
      username: 'john_doe',
      email: 'john@example.com',
      age: 30,
      status: 'active',
      createdAt: new Date()
    });
    console.log('✓ Inserted user with ID:', singleUser.insertedId);

    // --- GET EXAMPLES ---
    console.log('\n=== GET EXAMPLES ===\n');

    // Get all users
    console.log('Getting all users...');
    const allUsers = await storage.getAll('users');
    console.log(`✓ Found ${allUsers.length} total users`);

    // Get active users
    console.log('\nGetting active users...');
    const activeUsers = await storage.get('users', {
      status: 'active'
    });
    console.log(`✓ Found ${activeUsers.length} active users`);

    // Get users with options (limit, sort)
    console.log('\nGetting first 5 users sorted by username...');
    const firstUsers = await storage.get('users', {}, {
      limit: 5,
      sort: { username: 1 },
      projection: { username: 1, email: 1, status: 1 }
    });
    console.log('✓ First 5 users:', firstUsers);

    // Get users older than 30
    console.log('\nGetting users older than 30...');
    const olderUsers = await storage.get('users', {
      age: { $gt: 30 }
    });
    console.log(`✓ Found ${olderUsers.length} users older than 30`);

    // --- UPDATE EXAMPLES ---
    console.log('\n=== UPDATE EXAMPLES ===\n');

    // Update all inactive users to active
    console.log('Updating all inactive users to active...');
    const updateResult = await storage.update('users',
      { status: 'inactive' },
      { $set: { status: 'active', updatedAt: new Date() } }
    );
    console.log(`✓ Updated ${updateResult.modifiedCount} users (matched: ${updateResult.matchedCount})`);

    // Update specific users' age
    console.log('\nUpdating age for users older than 60...');
    const updateAge = await storage.update('users',
      { age: { $gt: 60 } },
      { $set: { age: 60, senior: true } }
    );
    console.log(`✓ Updated ${updateAge.modifiedCount} users to age 60`);

    // Increment age for all users
    console.log('\nIncrementing age for all users by 1...');
    const incrementAge = await storage.update('users',
      {},
      { $inc: { age: 1 } }
    );
    console.log(`✓ Incremented age for ${incrementAge.modifiedCount} users`);

    // --- DELETE EXAMPLES ---
    console.log('\n=== DELETE EXAMPLES ===\n');

    // Delete inactive users
    console.log('Deleting inactive users...');
    const deleteResult = await storage.delete('users', {
      status: 'inactive'
    });
    console.log(`✓ Deleted ${deleteResult.deletedCount} inactive users`);

    // Delete specific users
    console.log('\nDeleting users with username user_1 and user_2...');
    const deleteSpecific = await storage.delete('users', {
      username: { $in: ['user_1', 'user_2'] }
    });
    console.log(`✓ Deleted ${deleteSpecific.deletedCount} specific users`);

    // Get final count
    console.log('\n=== FINAL RESULTS ===\n');
    const remainingUsers = await storage.getAll('users');
    console.log(`✓ Remaining users: ${remainingUsers.length}`);

    const activeCount = await storage.get('users', { status: 'active' });
    console.log(`✓ Active users: ${activeCount.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Environment examples
async function environmentExample() {
  try {
    // Development environment
    const devStorage = new RekLogStorage('your-api-key-here', {
      environment: 'development'
    });

    // Production environment
    const prodStorage = new RekLogStorage('your-api-key-here', {
      environment: 'production'
    });

    console.log('\n=== ENVIRONMENT EXAMPLES ===\n');

    // Insert to development
    await devStorage.insert('users', {
      username: 'dev_user',
      email: 'dev@example.com',
      environment: 'development'
    });
    console.log('✓ Inserted to development environment');

    // Insert to production
    await prodStorage.insert('users', {
      username: 'prod_user',
      email: 'prod@example.com',
      environment: 'production'
    });
    console.log('✓ Inserted to production environment');

    // Get from development
    const devUsers = await devStorage.getAll('users');
    console.log(`✓ Development has ${devUsers.length} users`);

    // Get from production
    const prodUsers = await prodStorage.getAll('users');
    console.log(`✓ Production has ${prodUsers.length} users`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Initialize with custom API URL
async function customUrlExample() {
  try {
    const storage = new RekLogStorage('your-api-key-here', {
      apiUrl: 'https://api.reklog.com/api',
      environment: 'production'
    });

    console.log('Storage initialized with custom API URL and production environment!');

    // Insert example
    const result = await storage.insert('products', {
      name: 'Laptop',
      price: 999,
      stock: 50
    });
    console.log('Inserted product:', result.insertedId);

    // Get example
    const products = await storage.get('products', { price: { $lt: 1000 } });
    console.log('Products under $1000:', products);

    // Update example
    const updated = await storage.update('products',
      { price: { $lt: 1000 } },
      { $set: { onSale: true, discount: 10 } }
    );
    console.log('Updated products on sale:', updated.modifiedCount);

    // Delete example
    const deleted = await storage.delete('products', { stock: 0 });
    console.log('Deleted out-of-stock products:', deleted.deletedCount);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run examples
console.log('=== RekLog Storage Examples ===\n');
example();

// Uncomment to test environments
// environmentExample();

// Uncomment to test custom URL
// customUrlExample();
