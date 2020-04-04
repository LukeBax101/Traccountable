const { Track, Metric }  = require('../db/models');
const { deleteMetric } = require('./metrics');

async function addTrack(req) {
    if (req && req.username && req.password_hash) {
      let track = await Track.forge({
        username: req.username,
        password_hash: req.password_hash,
      }).save();
      return track.toJSON();
    } else {
      throw new Error('Please provide username and password');
    }
}

async function deleteTrack(trackId) {
    if (trackId) {
      const metricFetch = await Metric.where({ ['track_id']: trackId }).fetchAll();
      const metrics = metricFetch.toJSON();

      const allDeleted = await Promise.all(metrics.map(async (metric) => {
         const deleted = await deleteMetric(metric.metric_id);
         return deleted;
      }));
      
      const trackDelete = await Track.where({ ['track_id']: trackId }).destroy({ require: true});
      return 'Successfully deleted track';
    } else {
      throw new Error('Please provide a trackId')
    }
}

async function editTrack(trackId, req) {
  if (trackId && req) {
    const trackModel = await new Track({ ['track_id']: trackId });
    const trackFetch = await trackModel.fetch();
    const track = trackFetch.toJSON();
    const trackRequest = await trackModel.set({
      username: req.username || track.username,
      password_hash: req.password_hash || track.password_hash,
    });
    const trackSave = await trackModel.save();
    const trackRet = trackSave.toJSON();
    return {
      track_id: trackRet.track_id,
      username: trackRet.username,
    };
  } else {
    throw new Error('Please provide a trackId and request body')
  }
}

async function getAllMetrics(trackId) {
  if (trackId) {
    const metricFetch = await Metric.where({ ['track_id']: trackId }).fetchAll({ columns: ['metric_id', 'name', 'units', 'colour', 'active'] });
    return metricFetch.toJSON();
  } else {
    throw new Error('Please provide a trackId')
  }
}


module.exports = {
    addTrack,
    deleteTrack,
    editTrack,
    getAllMetrics,
};
