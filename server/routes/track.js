const express = require('express');
const bcrypt = require('bcrypt');

const { Track } = require('../db/models');
const { deleteTrack, editTrack, getAllMetrics } = require('../functions/tracks');
const { getAllShares } = require('../functions/shares');
const metric = require('./metric');

const router = express.Router();

async function editLogin(trackId, req) {
  if (req) {
    const trackRequest = await Track.where({ ['track_id']: trackId }).fetch();
    let track = trackRequest.toJSON();
    if (req.username) {
      const tracksRequest = await Track.where({ ['username']: req.username }).fetchAll();
      let tracks = tracksRequest.toJSON();
      if (tracks.length > 0) {
        throw new Error('Username already in use');
      } else {
        track.username = req.username;
      }
    }
    if (req.password) {
      const hash = await bcrypt.hash(req.password, 10);
      track.password_hash = hash;
    }
    return editTrack(trackId, track);
  } else {
    throw new Error('Please provide a username or password');
  }
}

router.get('/', async (req, res) => {
  try {
    res.json(await getAllMetrics(req.trackId));
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get('/shares', async (req, res) => {
  try {
    res.json(await getAllShares(req.trackId));
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch('/', async (req, res) => {
  try {
    const track = await editLogin(req.trackId, req.body);
    req.socketio.emit('track_update', track);
    res.json(track);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/', async (req, res) => {
  try {
    const deleted = await deleteTrack(req.trackId);
    req.socketio.emit('track_delete', deleted);
    res.send('Successfully deleted track');
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
