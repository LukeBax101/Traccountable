const { Metric, Track, Share } = require('../db/models');

async function addShare(trackId, metricId, req) {
    if (trackId && metricId && req && req.username) {
      const metricModel = await new Metric({ ['metric_id']: metricId });
      const metricFetch = await metricModel.fetch();
      const metric = metricFetch.toJSON();
      if (metric.track_id !== trackId) {
        throw new Error('Unauthorised sharing of metric');
      }
      let track;
      try {
        const trackRequest = await new Track({ ['username']: req.username }).fetch();
        track = await trackRequest.toJSON();
      } catch(e) {
        throw new Error('No matching username');
      }
      if (trackId === track.track_id) {
        throw new Error('Cannot share with self');
      }
      const selfTrackRequest = await new Track({ ['track_id']: trackId }).fetch();
      selfTrack = await selfTrackRequest.toJSON();
      try {
        let share = await Share.forge({
          owner_track_id: trackId,
          shared_track_id: track.track_id,
          metric_id: metricId,
          accepted: false,
          colour: metric.colour,
          active: true,
        }).save();
        return {
          ...share.toJSON(),
          owner_username: selfTrack.username,
          share_username: req.username,
          name: metric.name,
          units: metric.units,
        };
      } catch(e) {
        throw new Error('Already shared this metric with that user');
      }
    } else {
      throw new Error('Please provide trackId, metricId and username');
    }
}

async function deleteShare(trackId, metricId, req) {
    if (trackId && metricId) {
      let shareId;
      if (req && req.username) {
        try {
          const trackRequest = await new Track({ ['username']: req.username }).fetch();
          track = await trackRequest.toJSON();
          shareId = track.track_id;
        } catch(e) {
          throw new Error('No matching username');
        }
      } else {
        shareId = trackId;
      }
      let share;
      try {
        const shareRequest = await new Share({
          shared_track_id: shareId,
          metric_id: metricId,
        }).fetch();
        share = await shareRequest.toJSON();
      } catch(e) {
        throw new Error('No matching share');
      }
      if (trackId === share.owner_track_id || trackId === share.shared_track_id) {
        const shareDelete = await Share.where({
          shared_track_id: shareId,
          metric_id: metricId,
        }).destroy({ require: true});
        const ownerTrackRequest = await new Track({ ['track_id']: share.owner_track_id }).fetch();
        ownerTrack = await ownerTrackRequest.toJSON();
        const shareTrackRequest = await new Track({ ['track_id']: share.shared_track_id }).fetch();
        shareTrack = await shareTrackRequest.toJSON();
        return {
          metric_id: metricId,
          owner_username: ownerTrack.username,
          share_username: shareTrack.username,
        };
      } else {
        throw new Error('Unauthorised deletion of share');
      }
    } else {
      throw new Error('Please provide a trackId, metricId and username')
    }
}

async function editShare(trackId, metricId, req) {
  if (trackId && metricId && req) {
    let share;
    let shareModel;
    try {
      shareModel = await new Share({
        shared_track_id: trackId,
        metric_id: metricId,
      });
      const shareFetch = await shareModel.fetch();
      share = await shareFetch.toJSON();
    } catch(e) {
      throw new Error('No matching share');
    }
    let active;
    if (req.active === false) {
      active = false;
    } else if (req.active === true) {
      active = true;
    } else {
      active = share.active;
    }

    let accepted;
    if (req.accepted === false) {
      accepted = false;
    } else if (req.accepted === true) {
      accepted = true;
    } else {
      accepted = share.accepted;
    }
    const ownerTrackRequest = await new Track({ ['track_id']: share.owner_track_id }).fetch();
    ownerTrack = await ownerTrackRequest.toJSON();
    const shareTrackRequest = await new Track({ ['track_id']: share.shared_track_id }).fetch();
    shareTrack = await shareTrackRequest.toJSON();

    const metricRequest = await new Metric({ metric_id: share.metric_id }).fetch();
    const metric = await metricRequest.toJSON();


    const shareRequest = await shareModel.set({
      owner_track_id: share.owner_track_id,
      shared_track_id: share.shared_track_id,
      metric_id: share.metric_id,
      accepted,
      colour: req.colour || share.colour,
      active,
    });
    const shareSave = await shareModel.save();
    return {
      ...shareSave.toJSON(),
      owner_username: ownerTrack.username,
      share_username: shareTrack.username,
      name: metric.name,
      units: metric.units,
    };
  } else {
    throw new Error('Please provide a trackId, metricId and request body')
  }
}

async function getAllShares(trackId) {
  if (trackId) {
    const incomingFetch = await Share.where({ shared_track_id: trackId, accepted: false }).fetchAll();
    const incomingRaw = incomingFetch.toJSON();

    const incoming = await incomingRaw.reduce(async (collection, income) => {
      const acc = await collection;
      const trackRequest = await new Track({ track_id: income.owner_track_id }).fetch();
      const track = await trackRequest.toJSON();
      const metricRequest = await new Metric({ metric_id: income.metric_id }).fetch();
      const metric = await metricRequest.toJSON();
      return {
        ...acc,
        [track.username]: (acc[track.username]) ? {
          ...acc[track.username],
          [income.metric_id]: {
            name: metric.name,
            units: metric.units,
          },
        } : {
          [income.metric_id]: {
            name: metric.name,
            units: metric.units,
          },
        },
      };
    },  Promise.resolve({}))

    const outgoingFetch = await Share.where({ owner_track_id: trackId, accepted: false }).fetchAll({ columns: ['metric_id', 'shared_track_id'] });
    const outgoingRaw = outgoingFetch.toJSON();
    const outgoing = await outgoingRaw.reduce(async (collection, out) => {
      const acc = await collection;
      const trackRequest = await new Track({ track_id: out.shared_track_id }).fetch();
      const track = await trackRequest.toJSON();
      return {
        ...acc,
        [track.username]: (acc[track.username]) ? [...acc[track.username], out.metric_id] : [out.metric_id],
      }
    }, Promise.resolve({}))

    const acceptedFetch = await Share.where({ owner_track_id: trackId, accepted: true }).fetchAll({ columns: ['metric_id', 'shared_track_id'] });
    const acceptedRaw = acceptedFetch.toJSON();
    const accepted = await acceptedRaw.reduce(async (collection, accept) => {
      const acc = await collection;
      const trackRequest = await new Track({ track_id: accept.shared_track_id }).fetch();
      const track = await trackRequest.toJSON();
      return {
        ...acc,
        [track.username]: (acc[track.username]) ? [...acc[track.username], accept.metric_id] : [accept.metric_id]
      }
    }, Promise.resolve({}))

    return {
      incoming,
      outgoing,
      accepted,
    };
  } else {
    throw new Error('Please provide a trackId')
  }
}

module.exports = {
    addShare,
    deleteShare,
    editShare,
    getAllShares,
};
