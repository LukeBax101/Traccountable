const express = require('express');

const { addMetric, deleteMetric, editMetric, getAllReadingData } = require('../functions/metrics');
const reading = require('./reading');

const router = express.Router();

router.get('/:metricId', async (req, res) => {
  try {
    res.json(await getAllReadingData(req.params.metricId));
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const metric = await addMetric(req.trackId, req.body)
    req.socketio.emit('metric_new', metric);
    res.json(metric);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch('/:metricId', async (req, res) => {
  try {
    const metric = await editMetric(req.params.metricId, req.body);
    req.socketio.emit('metric_update', metric);
    res.json(metric);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/:metricId', async (req, res) => {
  try {
    const metric = await deleteMetric(req.params.metricId);
    req.socketio.emit('metric_delete', {
      track_id: req.trackId,
      metric_id: req.params.metricId,
    });
    res.send(metric);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
