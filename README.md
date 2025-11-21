# RekLog Storage

Simple MongoDB wrapper for RekLog Storage - Connect to dedicated MongoDB instances with ease.

## Installation

```bash
npm install reklog-storage
```

or

```bash
yarn add reklog-storage
```

## Quick Start

```javascript
const RekLogStorage = require('reklog-storage');

// Initialize with your connection string
const storage = new RekLogStorage('mongodb://username:password@host:port/database?authSource=admin');

// Connect
await storage.connect();

// Insert a document
await storage.insert('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Find documents
const users = await storage.find('users', {});

// Disconnect when done
await storage.disconnect();
```

## API Reference

### Constructor

```javascript
new RekLogStorage(connectionString, options)
```

- `connectionString` (string, required): MongoDB connection string
- `options` (object, optional): MongoDB client options

### Connection Methods

#### `connect()`

Connect to MongoDB database.

```javascript
await storage.connect();
```

#### `disconnect()`

Disconnect from MongoDB database.

```javascript
await storage.disconnect();
```

### Insert Operations

#### `insert(collectionName, document)`

Insert a single document.

```javascript
const user = await storage.insert('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});
// Returns: { _id: ObjectId('...'), name: 'John Doe', ... }
```

#### `insertMany(collectionName, documents)`

Insert multiple documents.

```javascript
const users = await storage.insertMany('users', [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' }
]);
```

### Find Operations

#### `find(collectionName, query, options)`

Find documents matching query.

```javascript
// Find all users
const allUsers = await storage.find('users', {});

// Find with filter
const activeUsers = await storage.find('users', { status: 'active' });

// Find with options
const users = await storage.find('users', {}, {
  sort: { createdAt: -1 },
  limit: 10,
  skip: 0,
  projection: { name: 1, email: 1 }
});
```

**Options:**
- `sort`: Sort order (e.g., `{ createdAt: -1 }`)
- `limit`: Maximum number of documents
- `skip`: Number of documents to skip
- `projection`: Fields to include/exclude

#### `findOne(collectionName, query, options)`

Find a single document.

```javascript
const user = await storage.findOne('users', { email: 'john@example.com' });
```

#### `findById(collectionName, id)`

Find document by ID.

```javascript
const user = await storage.findById('users', '507f1f77bcf86cd799439011');
```

### Update Operations

#### `update(collectionName, query, update, options)`

Update multiple documents.

```javascript
const result = await storage.update(
  'users',
  { status: 'inactive' },
  { $set: { status: 'active' } }
);
// Returns: { matchedCount: 5, modifiedCount: 5 }
```

#### `updateOne(collectionName, query, update, options)`

Update a single document.

```javascript
await storage.updateOne(
  'users',
  { email: 'john@example.com' },
  { $set: { name: 'John Smith' } }
);
```

#### `updateById(collectionName, id, update)`

Update document by ID.

```javascript
await storage.updateById(
  'users',
  '507f1f77bcf86cd799439011',
  { $set: { age: 31 } }
);
```

### Delete Operations

#### `delete(collectionName, query)`

Delete multiple documents.

```javascript
const deletedCount = await storage.delete('users', { status: 'inactive' });
// Returns: 3 (number of deleted documents)
```

#### `deleteOne(collectionName, query)`

Delete a single document.

```javascript
const deletedCount = await storage.deleteOne('users', { email: 'john@example.com' });
```

#### `deleteById(collectionName, id)`

Delete document by ID.

```javascript
await storage.deleteById('users', '507f1f77bcf86cd799439011');
```

### Aggregation & Advanced

#### `count(collectionName, query)`

Count documents.

```javascript
const userCount = await storage.count('users', { status: 'active' });
```

#### `aggregate(collectionName, pipeline)`

Run aggregation pipeline.

```javascript
const stats = await storage.aggregate('orders', [
  { $match: { status: 'completed' } },
  {
    $group: {
      _id: '$userId',
      total: { $sum: '$amount' }
    }
  },
  { $sort: { total: -1 } }
]);
```

#### `createIndex(collectionName, keys, options)`

Create an index.

```javascript
await storage.createIndex('users', { email: 1 }, { unique: true });
```

### Collection Management

#### `listCollections()`

List all collections.

```javascript
const collections = await storage.listCollections();
// Returns: ['users', 'orders', 'products']
```

#### `dropCollection(collectionName)`

Drop a collection.

```javascript
await storage.dropCollection('temp_data');
```

#### `stats()`

Get database statistics.

```javascript
const stats = await storage.stats();
// Returns database size, collection count, etc.
```

## Advanced Examples

### Complex Queries

```javascript
// Find with multiple conditions
const users = await storage.find('users', {
  age: { $gte: 18, $lte: 65 },
  status: 'active',
  $or: [
    { role: 'admin' },
    { role: 'moderator' }
  ]
});

// Find with regex
const users = await storage.find('users', {
  email: { $regex: /@example\.com$/ }
});
```

### Aggregation Example

```javascript
// Get monthly revenue
const revenue = await storage.aggregate('orders', [
  {
    $match: {
      status: 'completed',
      createdAt: {
        $gte: new Date('2024-01-01'),
        $lt: new Date('2025-01-01')
      }
    }
  },
  {
    $group: {
      _id: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      },
      total: { $sum: '$amount' },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { '_id.year': 1, '_id.month': 1 }
  }
]);
```

### Transactions (MongoDB 4.0+)

```javascript
const session = storage.client.startSession();

try {
  await session.withTransaction(async () => {
    await storage.insert('users', { name: 'John' });
    await storage.insert('logs', { action: 'user_created' });
  });
} finally {
  await session.endSession();
}
```

## Error Handling

```javascript
try {
  await storage.connect();
  const users = await storage.find('users', {});
} catch (error) {
  console.error('Database error:', error.message);
} finally {
  await storage.disconnect();
}
```

## Using ObjectId

```javascript
const { ObjectId } = require('reklog-storage');

// Create new ObjectId
const id = new ObjectId();

// Convert string to ObjectId
const userId = new ObjectId('507f1f77bcf86cd799439011');

// Use in queries
const user = await storage.findOne('users', { _id: userId });
```

## Best Practices

1. **Always connect before operations:**
   ```javascript
   await storage.connect();
   ```

2. **Use try-finally for cleanup:**
   ```javascript
   try {
     await storage.connect();
     // Your operations
   } finally {
     await storage.disconnect();
   }
   ```

3. **Use indexes for better performance:**
   ```javascript
   await storage.createIndex('users', { email: 1 }, { unique: true });
   ```

4. **Handle errors properly:**
   ```javascript
   try {
     await storage.insert('users', document);
   } catch (error) {
     console.error('Insert failed:', error);
   }
   ```

## Connection String Format

```
mongodb://[username:password@]host[:port]/database[?options]
```

Example:
```
mongodb://admin:password@storage.reklog.com:27017/myapp?authSource=admin
```

## Requirements

- Node.js 12.x or higher
- MongoDB 4.0 or higher

## License

MIT

## Support

For issues and questions:
- GitHub: https://github.com/reklog/reklog-storage/issues
- Documentation: https://reklog.com/docs
- Website: https://reklog.com
