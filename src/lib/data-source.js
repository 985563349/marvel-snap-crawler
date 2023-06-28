const mongoose = require('mongoose');

class DataSource {
  constructor(options) {
    this.name = options.name || 'default';
    this.options = options;
    this.client = null;
    this.models = null;
    this.isInitialized = false;
  }

  get isConnected() {
    return this.isInitialized;
  }

  async initialize() {
    if (this.isInitialized) {
      throw new Error(
        `Cannot create a "${this.name}" connection because connection to the database already established.`
      );
    }

    const { url, schemas, synchronize, ...rest } = this.options;

    this.client = await mongoose.connect(url, rest);
    this.isInitialized = true;

    try {
      if (synchronize) this.synchronize();
    } catch (error) {
      await this.destroy();
      throw error;
    }

    return this;
  }

  async destroy() {
    await this.client.disconnect();
    this.client = null;
    this.models = null;
    this.isInitialized = false;
  }

  synchronize() {
    this.models = new Map();

    this.options.schemas?.forEach((schema) => {
      const model = this.client.model(schema.name, schema);
      this.models.set(schema.name, model);
    });
  }

  model(name) {
    return this.models?.get(name);
  }
}

module.exports = DataSource;
