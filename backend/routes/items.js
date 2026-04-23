const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');

// All item routes require authentication
router.use(authMiddleware);

// ─── GET /api/items/search?name=xyz ──────────────────────────────────────────
// NOTE: This MUST be defined before /:id route to avoid conflict
router.get('/search', async (req, res) => {
  try {
    const { name, type } = req.query;
    const query = {};

    if (name) {
      query.itemName = { $regex: name, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }

    const items = await Item.find(query).populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ message: 'Server error during search.' });
  }
});

// ─── GET /api/items ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    console.error('Get items error:', err.message);
    res.status(500).json({ message: 'Server error fetching items.' });
  }
});

// ─── GET /api/items/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.status(200).json(item);
  } catch (err) {
    console.error('Get item error:', err.message);
    res.status(500).json({ message: 'Server error fetching item.' });
  }
});

// ─── POST /api/items ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    if (!itemName || !description || !type || !location || !date || !contactInfo) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const item = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      postedBy: req.user.id,
    });

    await item.save();
    res.status(201).json({ message: 'Item reported successfully!', item });
  } catch (err) {
    console.error('Add item error:', err.message);
    res.status(500).json({ message: 'Server error adding item.' });
  }
});

// ─── PUT /api/items/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    // Only the owner can update
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only update your own items.' });
    }

    const { itemName, description, type, location, date, contactInfo } = req.body;

    item.itemName = itemName || item.itemName;
    item.description = description || item.description;
    item.type = type || item.type;
    item.location = location || item.location;
    item.date = date || item.date;
    item.contactInfo = contactInfo || item.contactInfo;

    await item.save();
    res.status(200).json({ message: 'Item updated successfully!', item });
  } catch (err) {
    console.error('Update item error:', err.message);
    res.status(500).json({ message: 'Server error updating item.' });
  }
});

// ─── DELETE /api/items/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    // Only the owner can delete
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own items.' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Item deleted successfully!' });
  } catch (err) {
    console.error('Delete item error:', err.message);
    res.status(500).json({ message: 'Server error deleting item.' });
  }
});

module.exports = router;
