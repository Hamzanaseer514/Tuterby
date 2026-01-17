// ...existing code...
const ChangeLog = require("../Models/Logs");

module.exports = function logPlugin(schema) {
  async function writeLog({ table, action, before, documentKey, changedBy, meta }) {
    try {
      await ChangeLog.create({
        table,
        action,
        actualJson: before || null,
        documentKey: documentKey || (before && { _id: before._id }) || null,
        changedBy: changedBy || null,
        meta: meta || null
      });
    } catch (e) {
      console.error('ChangeLog error:', e);
    }
  }

  // Capture BEFORE state for findOneAndUpdate / findOneAndReplace
  schema.pre(['findOneAndUpdate', 'findOneAndReplace'], async function (next) {
    try { this._log_before = await this.model.findOne(this.getQuery()).lean(); } catch (e) { this._log_before = null; }
    next();
  });

  schema.post(['findOneAndUpdate', 'findOneAndReplace'], async function () {
    const before = this._log_before || null;
    const changedBy = this.getOptions()._changedBy || null;
    const table = this.model && this.model.collection ? this.model.collection.name : (this.model && this.model.modelName) || 'unknown';
    await writeLog({ table, action: 'update', before, documentKey: before ? { _id: before._id } : null, changedBy });
  });

  // findOneAndDelete
  schema.pre('findOneAndDelete', async function (next) {
    try { this._log_before = await this.model.findOne(this.getQuery()).lean(); } catch (e) { this._log_before = null; }
    next();
  });

  schema.post('findOneAndDelete', async function () {
    const before = this._log_before || null;
    const changedBy = this.getOptions()._changedBy || null;
    const table = this.model && this.model.collection ? this.model.collection.name : (this.model && this.model.modelName) || 'unknown';
    await writeLog({ table, action: 'delete', before, documentKey: before ? { _id: before._id } : null, changedBy });
  });


  // Fetch DB state BEFORE applying save updates so we log the real "before" snapshot
  schema.pre('save', async function (next) {
    // If this is an embedded subdocument, skip pre-save DB fetch (parent document will be handled by its save)
    if (typeof this.ownerDocument === 'function' && this.ownerDocument()) {
      this._log_before = null;
      return next();
    }

    if (!this.isNew) {
      try {
        // fetch latest stored doc before modifications were applied in memory
        this._log_before = await this.constructor.findById(this._id).lean();
      } catch (e) {
        this._log_before = null;
      }
    }
    next();
  });

  schema.post('save', async function (doc) {
    // If this is an embedded subdocument, skip: parent save hook will log the change.
    if (typeof doc.ownerDocument === 'function' && doc.ownerDocument()) {
      return;
    }

    const table = (doc.constructor && doc.constructor.collection && doc.constructor.collection.name)
      || (doc.constructor && doc.constructor.modelName)
      || 'unknown';
    const changedBy = doc._changedBy || null;
    if (doc._log_before) {
      await writeLog({ table, action: 'update', before: doc._log_before, documentKey: { _id: doc._id }, changedBy });
    } else if (doc.isNew) {
      await writeLog({ table, action: 'create', before: null, documentKey: { _id: doc._id }, changedBy });
    }
  });

  // document.remove()
  schema.pre('remove', function (next) {
    try { this._log_before = this.toObject({ depopulate: true }); } catch (e) { this._log_before = null; }
    next();
  });

  schema.post('remove', async function (doc) {
    // For subdocument removals, ownerDocument() exists — parent remove/save will handle logging; still handle top-level deletes
    if (typeof doc.ownerDocument === 'function' && doc.ownerDocument()) {
      return;
    }

    const changedBy = doc._changedBy || null;
    const table = (doc.constructor && doc.constructor.collection && doc.constructor.collection.name)
      || (doc.constructor && doc.constructor.modelName)
      || 'unknown';
    await writeLog({ table, action: 'delete', before: doc._log_before, documentKey: { _id: doc._id }, changedBy });
  });
};