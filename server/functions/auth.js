const { Metric, Track, Share, Reading } = require('../db/models');

async function canEditMetric(trackId, metricId) {
    if (trackId && metricId) {
      const metricModel = await new Metric({ ['metric_id']: metricId });
      const metricFetch = await metricModel.fetch();
      const metric = metricFetch.toJSON();
      return (metric.track_id === trackId);
    } else {
      throw new Error('Please provide trackId, metricId');
    }
}

async function canEditReading(trackId, readingId) {
  if (trackId && readingId) {
    const readingModel = await new Reading({ ['reading_id']: readingId });
    const readingFetch = await readingModel.fetch();
    const reading = readingFetch.toJSON();
    return await canEditMetric(trackId, reading.metric_id);
  } else {
    throw new Error('Please provide trackId, readingId');
  }
}

async function canViewMetric(trackId, metricId, req) {
  if (trackId && metricId) {
    const metricModel = await new Metric({ ['metric_id']: metricId });
    const metricFetch = await metricModel.fetch();
    const metric = metricFetch.toJSON();
    if (metric.track_id === trackId) return true;
    let share;
    try {
      const shareRequest = await new Share({ metric_id: metricId, shared_track_id: trackId }).fetch();
      share = await shareRequest.toJSON();
    } catch(e) {
      console.log('Invalid attempt to view metric');
    }
    return !!share;
  } else {
    throw new Error('Please provide trackId, metricId');
  }
}


module.exports = {
    canEditMetric,
    canEditReading,
    canViewMetric,
};
