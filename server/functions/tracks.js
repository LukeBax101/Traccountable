const { Track, Metric, Share }  = require('../db/models');
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

      const shareFetch = await Share.where({ ['shared_track_id']: trackId }).fetchAll();
      const shares = shareFetch.toJSON();

      const allShareDeleted = await Promise.all(shares.map(async (share) => {
         const deleted = await Share.where({ ['share_id']: share.share_id }).destroy({ require: true});
         return deleted;
      }));
      const trackRequest = await new Track({ track_id: trackId }).fetch();
      const track = await trackRequest.toJSON();

      const trackDelete = await Track.where({ ['track_id']: trackId }).destroy({ require: true});
      return {
        track_id: trackId,
        username: track.username,
      };
    } else {
      throw new Error('Please provide a trackId')
    }
}

async function editTrack(trackId, req) {
  if (trackId && req) {
    const trackModel = await new Track({ ['track_id']: trackId });
    const trackFetch = await trackModel.fetch();
    const track = trackFetch.toJSON();
    let updateName = null;
    if (req.username && (req.username !== track.username)) {
      updateName = {
        old_username: track.username,
      };
    }
    const trackRequest = await trackModel.set({
      username: req.username || track.username,
      password_hash: req.password_hash || track.password_hash,
    });
    const trackSave = await trackModel.save();
    const trackRet = trackSave.toJSON();
    return {
      track_id: trackRet.track_id,
      username: trackRet.username,
      ...updateName,
    };
  } else {
    throw new Error('Please provide a trackId and request body')
  }
}

async function getAllMetrics(trackId) {
  if (trackId) {
    const selfTrackRequest = await new Track({ track_id: trackId }).fetch();
    const selfTrack = await selfTrackRequest.toJSON();
    const selfMetricFetch = await Metric.where({ ['track_id']: trackId }).fetchAll({ columns: ['metric_id', 'name', 'units', 'colour', 'active'] });
    const selfMetrics = selfMetricFetch.toJSON();

    const foreignFetch = await Share.where({ shared_track_id: trackId, accepted: true }).fetchAll();
    const foreignRaw = foreignFetch.toJSON();

    const foreign = await foreignRaw.reduce(async (collection, income) => {
      const acc = await collection;
      const trackRequest = await new Track({ track_id: income.owner_track_id }).fetch();
      const track = await trackRequest.toJSON();
      const metricRequest = await new Metric({ metric_id: income.metric_id }).fetch({ columns: ['metric_id', 'name', 'units'] });
      const metric = await metricRequest.toJSON();
      return {
        ...acc,
        [track.username]: (acc[track.username]) ? [
          ...acc[track.username],
          {
            ...metric,
            colour: income.colour,
            active: income.active,
          },
        ] : [
          {
            ...metric,
            colour: income.colour,
            active: income.active,
          },
        ],
      };
    },  Promise.resolve({}))
    return {
      ...foreign,
      [selfTrack.username]: selfMetrics,
    };
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
