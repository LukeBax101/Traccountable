const { Reading }  = require('../db/models');

async function addReading(metricId, req) {
    if (metricId && req && req.value && req.read_at) {
      let reading = await Reading.forge({
        metric_id: metricId,
        value: req.value,
        read_at: req.read_at,
      }).save();
      return reading.toJSON();
    } else {
      throw new Error('Please provide metricId, value and read_at');
    }
}

async function deleteReading(readingId) {
    if (readingId) {
      const readingDelete = await Reading.where({ ['reading_id']: readingId }).destroy({ require: true});
      return 'Successfully deleted reading';
    } else {
      throw new Error('Please provide a readingId')
    }
}

async function editReading(readingId, req) {
  if (readingId && req) {
    const readingModel = await new Reading({ ['reading_id']: readingId });
    const readingFetch = await readingModel.fetch();
    const reading = readingFetch.toJSON();
    const readingRequest = await readingModel.set({
      value: req.value || reading.value,
      read_at: req.read_at || reading.read_at,
    });
    const readingSave = await readingModel.save();
    return readingSave.toJSON();
  } else {
    throw new Error('Please provide a readingId and request body')
  }
}

module.exports = {
    addReading,
    deleteReading,
    editReading,
};
