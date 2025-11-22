const axios = require('axios');

class RekLogStorage {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.apiUrl = (options.apiUrl || 'https://api.reklog.com/api').replace(/\/$/, ''); // Remove trailing slash

    // Start validation immediately and store the promise
    this._validationPromise = this._validateKey();
  }

  /**
   * Validate API key (internal)
   */
  async _validateKey() {
    try {
      const response = await axios.post(`${this.apiUrl}/storages/validate-key`, {
        apiKey: this.apiKey
      });

      if (response.data.success) {
        this.storageId = response.data.data.storageId;
        this.databaseName = response.data.data.databaseName;
        this._validated = true;
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      throw new Error(`API key validation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Ensure API key is validated before operations
   */
  async _ensureValidated() {
    if (!this._validated) {
      await this._validationPromise;
    }
  }

  /**
   * Get documents from a collection
   * @param {string} collection - Collection name
   * @param {object} query - Query filter (optional, default: {})
   * @param {object} options - Query options (limit, skip, sort, projection)
   * @returns {Promise<array>} Array of documents
   */
  async get(collection, query = {}, options = {}) {
    try {
      // Ensure validation is complete
      await this._ensureValidated();

      const response = await axios.post(`${this.apiUrl}/storages/data/find`, {
        apiKey: this.apiKey,
        collection,
        query,
        options
      });

      if (response.data.success) {
        return response.data.data.documents;
      }

      throw new Error(response.data.message || 'Failed to get documents');
    } catch (error) {
      throw new Error(`Get failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get all documents from a collection
   * @param {string} collection - Collection name
   * @param {object} options - Query options (limit, skip, sort, projection)
   * @returns {Promise<array>} Array of all documents
   */
  async getAll(collection, options = {}) {
    try {
      // Ensure validation is complete
      await this._ensureValidated();

      const response = await axios.post(`${this.apiUrl}/storages/data/findAll`, {
        apiKey: this.apiKey,
        collection,
        options
      });

      if (response.data.success) {
        return response.data.data.documents;
      }

      throw new Error(response.data.message || 'Failed to get documents');
    } catch (error) {
      throw new Error(`Get all failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Insert one or multiple documents into a collection
   * @param {string} collection - Collection name
   * @param {object|array} documents - Document(s) to insert (single object or array of objects)
   * @returns {Promise<object>} Insert result with insertedId(s)
   */
  async insert(collection, documents) {
    try {
      // Ensure validation is complete
      await this._ensureValidated();

      const response = await axios.post(`${this.apiUrl}/storages/data/insert`, {
        apiKey: this.apiKey,
        collection,
        documents
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to insert documents');
    } catch (error) {
      throw new Error(`Insert failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete documents from a collection
   * @param {string} collection - Collection name
   * @param {object} query - Query filter to match documents to delete
   * @returns {Promise<object>} Delete result with deletedCount
   */
  async delete(collection, query = {}) {
    try {
      // Ensure validation is complete
      await this._ensureValidated();

      const response = await axios.post(`${this.apiUrl}/storages/data/delete`, {
        apiKey: this.apiKey,
        collection,
        query
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to delete documents');
    } catch (error) {
      throw new Error(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update documents in a collection
   * @param {string} collection - Collection name
   * @param {object} query - Query filter to match documents to update
   * @param {object} update - Update operations (e.g., { $set: { field: value } })
   * @returns {Promise<object>} Update result with matchedCount and modifiedCount
   */
  async update(collection, query = {}, update) {
    try {
      // Ensure validation is complete
      await this._ensureValidated();

      const response = await axios.post(`${this.apiUrl}/storages/data/update`, {
        apiKey: this.apiKey,
        collection,
        query,
        update
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to update documents');
    } catch (error) {
      throw new Error(`Update failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = RekLogStorage;
