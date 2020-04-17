const bookshelf = require('./bookshelf');


const Reading = bookshelf.Model.extend({
  tableName: 'readings',
  idAttribute: "reading_id",
  uuid: true,
});

const Share = bookshelf.Model.extend({
  tableName: 'shares',
  idAttribute: "share_id",
  uuid: true,
});

const Metric = bookshelf.Model.extend({
  tableName: 'metrics',
  idAttribute: "metric_id",
  uuid: true,
  reading: function () {
    return this.hasMany('Reading').attach(readings['reading_id']);
  },
  share: function () {
    return this.hasMany('Share').attach(shares['share_id']);
  },
}, { dependents: ['reading']});

const Track = bookshelf.Model.extend({
  tableName: 'tracks',
  idAttribute: "track_id",
  uuid: true,
  metric: function () {
    return this.hasMany('Metric').attach(metrics['metric_id']);
  },
  share: function () {
    return this.hasMany('Share').attach(shares['share_id']);
  },
}, { dependents: ['metric']});

module.exports = { Reading, Metric, Track, Share };
