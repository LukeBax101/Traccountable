const express = require('express');

const { addMetric, deleteMetric, editMetric, getAllReadingData } = require('../functions/metrics');
const { addShare, deleteShare, editShare } = require('../functions/shares');
const { canEditMetric, canViewMetric } = require('../functions/auth');
const reading = require('./reading');

const router = express.Router();

router.get('/:metricId', async (req, res) => {
  try {
    if (!await canViewMetric(req.trackId, req.params.metricId)) {
      res.status(401).send('Invalid credentials');
    } else {
      res.json(await getAllReadingData(req.params.metricId));
    }
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
    if (!await canEditMetric(req.trackId, req.params.metricId)) {
      res.status(401).send('Invalid credentials');
    } else {
      const metric = await editMetric(req.params.metricId, req.body);
      req.socketio.emit('metric_update', metric);
      res.json(metric);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/:metricId', async (req, res) => {
  try {
    if (!await canEditMetric(req.trackId, req.params.metricId)) {
      res.status(401).send('Invalid credentials');
    } else {
      const metric = await deleteMetric(req.params.metricId);
      req.socketio.emit('metric_delete', {
        track_id: req.trackId,
        metric_id: req.params.metricId,
      });
      res.send(metric);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post('/:metricId/shares', async (req, res) => {
  try {
    const share = await addShare(req.trackId, req.params.metricId, req.body)
    req.socketio.emit('share_new', share);
    res.json(share);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch('/:metricId/shares', async (req, res) => {
  try {
    const share = await editShare(req.trackId, req.params.metricId, req.body);
    req.socketio.emit('share_update', share);
    res.json(share);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.put('/:metricId/shares', async (req, res) => {
  try {
    const share = await editShare(req.trackId, req.params.metricId, req.body);
    req.socketio.emit('share_accept', share);
    res.json(share);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/:metricId/shares', async (req, res) => {
  try {
    const share = await deleteShare(req.trackId, req.params.metricId, req.body);
    req.socketio.emit('share_delete', share);
    res.send("Share successfully deleted");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
