const RekLogStorage = require('./src/index');

async function example() {
  // Initialize storage
  const storage = new RekLogStorage('mongodb://localhost:27017/testdb');

  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await storage.connect();
    console.log('Connected!');

    // Insert a document
    console.log('\n--- Insert Example ---');
    const user = await storage.insert('users', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      status: 'active'
    });
    console.log('Inserted user:', user);

    // Insert multiple documents
    console.log('\n--- Insert Many Example ---');
    const users = await storage.insertMany('users', [
      { name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'active' },
      { name: 'Bob Johnson', email: 'bob@example.com', age: 35, status: 'inactive' }
    ]);
    console.log('Inserted users:', users.length);

    // Find all users
    console.log('\n--- Find Example ---');
    const allUsers = await storage.find('users', {});
    console.log('All users:', allUsers);

    // Find with filter
    console.log('\n--- Find with Filter Example ---');
    const activeUsers = await storage.find('users', { status: 'active' });
    console.log('Active users:', activeUsers);

    // Find one
    console.log('\n--- Find One Example ---');
    const oneUser = await storage.findOne('users', { email: 'john@example.com' });
    console.log('Found user:', oneUser);

    // Update
    console.log('\n--- Update Example ---');
    await storage.updateOne(
      'users',
      { email: 'john@example.com' },
      { $set: { age: 31 } }
    );
    console.log('Updated user');

    // Count
    console.log('\n--- Count Example ---');
    const count = await storage.count('users', { status: 'active' });
    console.log('Active users count:', count);

    // Aggregate
    console.log('\n--- Aggregate Example ---');
    const stats = await storage.aggregate('users', [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      }
    ]);
    console.log('User stats:', stats);

    // Delete
    console.log('\n--- Delete Example ---');
    const deletedCount = await storage.delete('users', { status: 'inactive' });
    console.log('Deleted users:', deletedCount);

    // List collections
    console.log('\n--- List Collections Example ---');
    const collections = await storage.listCollections();
    console.log('Collections:', collections);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect
    await storage.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run example
example();
