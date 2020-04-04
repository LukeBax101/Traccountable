const { Metric, Reading } = require('../db/models');
// const { deleteTeam } = require('./teams');
// const fs = require('fs');
// const path = require('path');
// const bcrypt = require('bcrypt');

async function addMetric(trackId, req) {
    if (trackId && req && req.name && req.units && req.colour) {
      let metric = await Metric.forge({
        track_id: trackId,
        name: req.name,
        units: req.units,
        colour: req.colour,
        active: true,
      }).save();
      return metric.toJSON();
    } else {
      throw new Error('Please provide trackId, name, units and colour');
    }
}

async function deleteMetric(metricId) {
    if (metricId) {
      // const readingDelete = await Reading.where({ ['metric_id']: metricId }).destroy({ require: true});
      const readingFetch = await Reading.where({ ['metric_id']: metricId }).fetchAll();
      const readings = readingFetch.toJSON();

      const allDeleted = await Promise.all(readings.map(async (reading) => {
         const deleted = await Reading.where({ ['reading_id']: reading.reading_id }).destroy({ require: true});
         return deleted;
      }));
      const metricDelete = await Metric.where({ ['metric_id']: metricId }).destroy({ require: true});
      return 'Successfully deleted metric';
    } else {
      throw new Error('Please provide a metricId')
    }
}

async function editMetric(metricId, req) {
  if (metricId && req) {
    const metricModel = await new Metric({ ['metric_id']: metricId });
    const metricFetch = await metricModel.fetch();
    const metric = metricFetch.toJSON();
    let active;
    if (req.active === false) {
      active = false;
    } else if (req.active === true) {
      active = true;
    } else {
      active = metric.active;
    }
    const metricRequest = await metricModel.set({
      name: req.name || metric.name,
      units: req.units || metric.units,
      colour: req.colour || metric.colour,
      active,
    });
    const metricSave = await metricModel.save();
    return metricSave.toJSON();
  } else {
    throw new Error('Please provide a metricId and request body')
  }
}

async function getAllReadingData(metricId) {
  if (metricId) {
    const readingFetch = await Reading.where({ ['metric_id']: metricId }).fetchAll({ columns: ['reading_id', 'value', 'read_at'] });
    return readingFetch.toJSON();
  } else {
    throw new Error('Please provide a metricId')
  }
}

module.exports = {
    addMetric,
    deleteMetric,
    editMetric,
    getAllReadingData,
};
