const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Club = require('../models/Club');

// create club
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const club = new Club({ title, description, owner: req.user.id, members: [req.user.id] });
    await club.save();
    res.json(club);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// list clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find().populate('owner','name email');
    res.json(clubs);
  } catch (err) { res.status(500).send('Server error'); }
});

// get single club
router.get('/:id', async (req,res) => {
  try {
    const club = await Club.findById(req.params.id).populate('owner','name');
    if (!club) return res.status(404).json({ msg: 'Club not found' });
    res.json(club);
  } catch (err) { res.status(500).send('Server error'); }
});

// join club
router.post('/:id/join', auth, async (req,res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ msg: 'Club not found' });
    if (club.members.includes(req.user.id)) return res.status(400).json({ msg: 'Already a member' });
    club.members.push(req.user.id);
    await club.save();
    res.json(club);
  } catch (err) { res.status(500).send('Server error'); }
});

// delete club (owner only)
router.delete('/:id', auth, async (req,res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ msg: 'Club not found' });
    if (club.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    await club.remove();
    res.json({ msg: 'Club removed' });
  } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;