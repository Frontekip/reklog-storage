# RekLog Storage

Simple and secure API client for RekLog Storage - Access your dedicated database instances with API keys.

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

// Initialize with your API key (auto-validates)
// Default environment is 'development'
const storage = new RekLogStorage('your-api-key-here');

// Or specify a different environment (production, staging, test, etc.)
const prodStorage = new RekLogStorage('your-api-key-here', {
  environment: 'production'
});

// Insert documents
await storage.insert('users', {
  username: 'john_doe',
  email: 'john@example.com',
  age: 30
});

// Get documents
const users = await storage.get('users', { status: 'active' });

// Update documents
await storage.update('users',
  { username: 'john_doe' },
  { $set: { age: 31 } }
);

// Delete documents
await storage.delete('users', { status: 'inactive' });
```

## Features

- 🔐 **API Key Authentication** - Secure access with API keys
- ✨ **Auto-Validation** - API key validated automatically on initialization
- 🚀 **Simple API** - No connection management needed
- 📦 **Full CRUD** - Create, Read, Update, Delete operations
- 🔍 **MongoDB Query Syntax** - Use familiar MongoDB queries
- 🎯 **Promise-Based** - Modern async/await support

## API Reference

### Constructor

```javascript
new RekLogStorage(apiKey, options)
```

**Parameters:**
- `apiKey` (string, required): Your storage API key from RekLog dashboard
- `options` (object, optional):
  - `environment` (string): Environment to use - must match one of the environments created with your storage (default: `'development'`)
  - `apiUrl` (string): Custom API URL (default: `https://api.reklog.com/api`)

**Example:**
```javascript
// With default environment (development)
const storage = new RekLogStorage('your-api-key-here');

// With production environment
const prodStorage = new RekLogStorage('your-api-key-here', {
  environment: 'production'
});

// With custom environment and API URL
const stagingStorage = new RekLogStorage('your-api-key-here', {
  environment: 'staging',
  apiUrl: 'https://api.reklog.com/api'
});
```

### Get Operations

#### `get(collection, query, options)`

Get documents matching a query.

**Parameters:**
- `collection` (string): Collection name
- `query` (object): MongoDB query filter (default: `{}`)
- `options` (object, optional):
  - `limit` (number): Maximum number of documents
  - `skip` (number): Number of documents to skip
  - `sort` (object): Sort order (e.g., `{ createdAt: -1 }`)
  - `projection` (object): Fields to include/exclude

**Returns:** `Promise<Array>` - Array of documents

**Examples:**
```javascript
// Get all active users
const activeUsers = await storage.get('users', { status: 'active' });

// Get with pagination
const users = await storage.get('users', {}, {
  limit: 10,
  skip: 20,
  sort: { createdAt: -1 }
});

// Get with projection (only specific fields)
const usernames = await storage.get('users', {}, {
  projection: { username: 1, email: 1 }
});

// Complex queries
const users = await storage.get('users', {
  age: { $gte: 18, $lte: 65 },
  status: 'active'
});
```

#### `getAll(collection, options)`

Get all documents from a collection.

**Parameters:**
- `collection` (string): Collection name
- `options` (object, optional): Same as `get()` options

**Returns:** `Promise<Array>` - Array of all documents

**Example:**
```javascript
// Get all users
const allUsers = await storage.getAll('users');

// Get all with limit
const first100 = await storage.getAll('users', { limit: 100 });
```

### Insert Operations

#### `insert(collection, documents)`

Insert one or multiple documents.

**Parameters:**
- `collection` (string): Collection name
- `documents` (object | array): Document(s) to insert

**Returns:**
- Single document: `Promise<{ insertedId: ObjectId }>`
- Multiple documents: `Promise<{ insertedCount: number, insertedIds: Object }>`

**Examples:**
```javascript
// Insert single document
const result = await storage.insert('users', {
  username: 'john_doe',
  email: 'john@example.com',
  age: 30,
  createdAt: new Date()
});
console.log(result.insertedId);

// Insert multiple documents
const users = [
  { username: 'user1', email: 'user1@example.com' },
  { username: 'user2', email: 'user2@example.com' },
  { username: 'user3', email: 'user3@example.com' }
];
const result = await storage.insert('users', users);
console.log(`Inserted ${result.insertedCount} users`);
```

### Update Operations

#### `update(collection, query, update)`

Update documents matching a query.

**Parameters:**
- `collection` (string): Collection name
- `query` (object): MongoDB query filter
- `update` (object): Update operations (e.g., `{ $set: { field: value } }`)

**Returns:** `Promise<{ matchedCount: number, modifiedCount: number }>`

**Examples:**
```javascript
// Update with $set
const result = await storage.update('users',
  { status: 'inactive' },
  { $set: { status: 'active', updatedAt: new Date() } }
);
console.log(`Updated ${result.modifiedCount} users`);

// Update with $inc (increment)
await storage.update('users',
  { age: { $lt: 18 } },
  { $inc: { age: 1 } }
);

// Update with $push (add to array)
await storage.update('users',
  { username: 'john_doe' },
  { $push: { tags: 'verified' } }
);

// Update with $unset (remove field)
await storage.update('users',
  { tempField: { $exists: true } },
  { $unset: { tempField: '' } }
);
```

### Delete Operations

#### `delete(collection, query)`

Delete documents matching a query.

**Parameters:**
- `collection` (string): Collection name
- `query` (object): MongoDB query filter

**Returns:** `Promise<{ deletedCount: number }>`

**Examples:**
```javascript
// Delete inactive users
const result = await storage.delete('users', { status: 'inactive' });
console.log(`Deleted ${result.deletedCount} users`);

// Delete specific users
await storage.delete('users', {
  username: { $in: ['user1', 'user2', 'user3'] }
});

// Delete users older than date
await storage.delete('users', {
  createdAt: { $lt: new Date('2024-01-01') }
});
```

## MongoDB Query Operators

RekLog Storage supports MongoDB query operators:

### Comparison
- `$eq` - Equal to
- `$ne` - Not equal to
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal
- `$in` - In array
- `$nin` - Not in array

### Logical
- `$and` - Logical AND
- `$or` - Logical OR
- `$not` - Logical NOT
- `$nor` - Logical NOR

### Element
- `$exists` - Field exists
- `$type` - Field type

### Array
- `$all` - All elements match
- `$elemMatch` - Element matches
- `$size` - Array size

**Example:**
```javascript
// Find users between 18 and 65 who are active
const users = await storage.get('users', {
  age: { $gte: 18, $lte: 65 },
  status: 'active',
  $or: [
    { role: 'admin' },
    { role: 'moderator' }
  ]
});
```

## Update Operators

### Field Update Operators
- `$set` - Set field value
- `$unset` - Remove field
- `$inc` - Increment value
- `$mul` - Multiply value
- `$rename` - Rename field
- `$min` - Update if new value is less
- `$max` - Update if new value is greater

### Array Update Operators
- `$push` - Add element to array
- `$pop` - Remove first/last element
- `$pull` - Remove matching elements
- `$addToSet` - Add unique element
- `$pullAll` - Remove all matching

**Example:**
```javascript
// Set and increment
await storage.update('products',
  { sku: 'ABC123' },
  {
    $set: { inStock: true },
    $inc: { quantity: 10 }
  }
);
```

## Complete Example

```javascript
const RekLogStorage = require('reklog-storage');

async function main() {
  try {
    // Initialize storage
    const storage = new RekLogStorage('your-api-key-here');

    // Insert users
    console.log('Inserting users...');
    await storage.insert('users', [
      { username: 'alice', age: 25, status: 'active' },
      { username: 'bob', age: 30, status: 'active' },
      { username: 'charlie', age: 35, status: 'inactive' }
    ]);

    // Get active users
    const activeUsers = await storage.get('users', { status: 'active' });
    console.log('Active users:', activeUsers);

    // Update inactive users
    const updateResult = await storage.update('users',
      { status: 'inactive' },
      { $set: { status: 'active' } }
    );
    console.log(`Updated ${updateResult.modifiedCount} users`);

    // Delete old users
    const deleteResult = await storage.delete('users', {
      age: { $lt: 18 }
    });
    console.log(`Deleted ${deleteResult.deletedCount} users`);

    // Get all remaining users
    const allUsers = await storage.getAll('users');
    console.log(`Total users: ${allUsers.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Error Handling

```javascript
try {
  await storage.insert('users', { username: 'john' });
} catch (error) {
  if (error.message.includes('API key validation failed')) {
    console.error('Invalid API key');
  } else if (error.message.includes('Insert failed')) {
    console.error('Failed to insert document');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Environments

RekLog Storage supports multiple environments for the same storage instance. This allows you to separate your development, staging, and production data while using a single API key.

### Creating Storage with Environments

When creating a storage in the RekLog dashboard:
1. Enter your storage name
2. Add environments (e.g., `development`, `production`, `staging`, `test`)
3. Each environment will have its own database: `dbname-environment`

**Example:**
- Storage name: `my-app`
- Environments: `development`, `production`, `staging`
- Databases created: `my-app-development`, `my-app-production`, `my-app-staging`

### Using Different Environments

```javascript
// Development environment (default)
const devStorage = new RekLogStorage('your-api-key');

// Production environment
const prodStorage = new RekLogStorage('your-api-key', {
  environment: 'production'
});

// Staging environment
const stagingStorage = new RekLogStorage('your-api-key', {
  environment: 'staging'
});

// Each instance connects to its own database
await devStorage.insert('users', { name: 'Dev User' });      // Goes to my-app-development
await prodStorage.insert('users', { name: 'Prod User' });    // Goes to my-app-production
await stagingStorage.insert('users', { name: 'Stage User' }); // Goes to my-app-staging
```

## Getting Your API Key

1. Sign up at [RekLog](https://reklog.com)
2. Navigate to **Storages** in your dashboard
3. Click **Create Storage**
4. Enter storage name and environments
5. Copy your **Storage API Key** from the storage details page

## Requirements

- Node.js 12.x or higher
- Valid RekLog Storage API key

## Security

- API keys are validated automatically on initialization
- All communication is done over HTTPS
- Never expose your API key in public repositories
- Use environment variables for API keys in production

```javascript
// Good practice
const storage = new RekLogStorage(process.env.REKLOG_API_KEY);
```

## License

MIT

## Support

For issues and questions:
- Documentation: https://reklog.com/docs
- GitHub Issues: https://github.com/frontekip/reklog-storage/issues
- Website: https://reklog.com
