const { MongoClient, ObjectId } = require('mongodb');

class RekLogStorage {
  constructor(connectionString, options = {}) {
    if (!connectionString) {
      throw new Error('Connection string is required');
    }

    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options
    };
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      this.client = new MongoClient(this.connectionString, this.options);
      await this.client.connect();

      // Extract database name from connection string
      const dbName = this.extractDatabaseName(this.connectionString);
      this.db = this.client.db(dbName);

      return true;
    } catch (error) {
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
  }

  /**
   * Extract database name from connection string
   */
  extractDatabaseName(connectionString) {
    const match = connectionString.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : 'test';
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  /**
   * Get collection
   */
  getCollection(collectionName) {
    if (!this.db) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }
    return this.db.collection(collectionName);
  }

  /**
   * Insert a single document
   * @param {string} collectionName - Collection name
   * @param {object} document - Document to insert
   * @returns {Promise<object>} Inserted document with _id
   */
  async insert(collectionName, document) {
    const collection = this.getCollection(collectionName);
    const result = await collection.insertOne(document);
    return {
      _id: result.insertedId,
      ...document
    };
  }

  /**
   * Insert multiple documents
   * @param {string} collectionName - Collection name
   * @param {array} documents - Array of documents to insert
   * @returns {Promise<array>} Inserted documents with _id
   */
  async insertMany(collectionName, documents) {
    const collection = this.getCollection(collectionName);
    const result = await collection.insertMany(documents);
    return documents.map((doc, index) => ({
      _id: result.insertedIds[index],
      ...doc
    }));
  }

  /**
   * Find documents
   * @param {string} collectionName - Collection name
   * @param {object} query - Query filter
   * @param {object} options - Query options (projection, sort, limit, skip)
   * @returns {Promise<array>} Array of documents
   */
  async find(collectionName, query = {}, options = {}) {
    const collection = this.getCollection(collectionName);
    const cursor = collection.find(query);

    // Apply options
    if (options.projection) {
      cursor.project(options.projection);
    }
    if (options.sort) {
      cursor.sort(options.sort);
    }
    if (options.limit) {
      cursor.limit(options.limit);
    }
    if (options.skip) {
      cursor.skip(options.skip);
    }

    return await cursor.toArray();
  }

  /**
   * Find one document
   * @param {string} collectionName - Collection name
   * @param {object} query - Query filter
   * @param {object} options - Query options (projection)
   * @returns {Promise<object|null>} Document or null
   */
  async findOne(collectionName, query = {}, options = {}) {
    const collection = this.getCollection(collectionName);
    return await collection.findOne(query, options);
  }

  /**
   * Find document by ID
   * @param {string} collectionName - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<object|null>} Document or null
   */
  async findById(collectionName, id) {
    return await this.findOne(collectionName, { _id: new ObjectId(id) });
  }

  /**
   * Update documents
   * @param {string} collectionName - Collection name
   * @param {object} query - Query filter
   * @param {object} update - Update operations
   * @param {object} options - Update options
   * @returns {Promise<object>} Update result
   */
  async update(collectionName, query, update, options = {}) {
    const collection = this.getCollection(collectionName);
    const result = await collection.updateMany(query, update, options);
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  }

  /**
   * Update one document
   * @param {string} collectionName - Collection name
   * @param {object} query - Query filter
   * @param {object} update - Update operations
   * @param {object} options - Update options
   * @returns {Promise<object>} Update result
   */
  async updateOne(collectionName, query, update, options = {}) {
    const collection = this.getCollection(collectionName);
    const result = await collection.updateOne(query, update, options);
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  }

  /**
   * Update document by ID
   * @param {string} collectionName - Collection name
   * @param {string} id - Document ID
   * @param {object} update - Update operations
   * @returns {Promise<object>} Update result
   */
  async updateById(collectionName, id, update) {
    return await this.updateOne(collectionName, { _id: new ObjectId(id) }, update);
  }

  /**
   * Delete documents
   * @param {string} collectionName - Collection name
   * @param {object} query - Query filter
   * @returns {Promise<number>} Number of deleted documents
   */
  async delete(collectionName, query) {
    const collection = this.getCollection(collectionName);
    const result = await collection.deleteMany(query);
    return result.deletedCount;
  }

  /**
   * Delete one document
   * @param {string} collectionName - Collection name
   * @param {object} query - Query filter
   * @returns {Promise<number>} Number of deleted documents (0 or 1)
   */
  async deleteOne(collectionName, query) {
    const collection = this.getCollection(collectionName);
    const result = await collection.deleteOne(query);
    return result.deletedCount;
  }

  /**
   * Delete document by ID
   * @param {string} collectionName - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<number>} Number of deleted documents (0 or 1)
   */
  async deleteById(collectionName, id) {
    return await this.deleteOne(collectionName, { _id: new ObjectId(id) });
  }

  /**
   * Count documents
   * @param {string} collectionName - Collection name
   * @param {object} query - Query filter
   * @returns {Promise<number>} Number of documents
   */
  async count(collectionName, query = {}) {
    const collection = this.getCollection(collectionName);
    return await collection.countDocuments(query);
  }

  /**
   * Aggregate
   * @param {string} collectionName - Collection name
   * @param {array} pipeline - Aggregation pipeline
   * @returns {Promise<array>} Aggregation result
   */
  async aggregate(collectionName, pipeline) {
    const collection = this.getCollection(collectionName);
    return await collection.aggregate(pipeline).toArray();
  }

  /**
   * Create index
   * @param {string} collectionName - Collection name
   * @param {object} keys - Index keys
   * @param {object} options - Index options
   * @returns {Promise<string>} Index name
   */
  async createIndex(collectionName, keys, options = {}) {
    const collection = this.getCollection(collectionName);
    return await collection.createIndex(keys, options);
  }

  /**
   * Drop collection
   * @param {string} collectionName - Collection name
   * @returns {Promise<boolean>} Success
   */
  async dropCollection(collectionName) {
    const collection = this.getCollection(collectionName);
    return await collection.drop();
  }

  /**
   * List collections
   * @returns {Promise<array>} Array of collection names
   */
  async listCollections() {
    if (!this.db) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }
    const collections = await this.db.listCollections().toArray();
    return collections.map(col => col.name);
  }

  /**
   * Get database stats
   * @returns {Promise<object>} Database statistics
   */
  async stats() {
    if (!this.db) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }
    return await this.db.stats();
  }
}

// Export ObjectId for convenience
RekLogStorage.ObjectId = ObjectId;

module.exports = RekLogStorage;
