const bookshelf = require('./bookshelf');


const Reading = bookshelf.Model.extend({
  tableName: 'readings',
  idAttribute: "reading_id",
  uuid: true,
});

const Metric = bookshelf.Model.extend({
  tableName: 'metrics',
  idAttribute: "metric_id",
  uuid: true,
  reading: function () {
    return this.hasMany('Reading').attach(readings['reading_id']);
  },
}, { dependents: ['reading']});

const Track = bookshelf.Model.extend({
  tableName: 'tracks',
  idAttribute: "track_id",
  uuid: true,
  metric: function () {
    return this.hasMany('Metric').attach(metrics['metric_id']);
  }
}, { dependents: ['metric']});

module.exports = { Reading, Metric, Track };
