import express from 'express';
import { Registration } from '../models/Registration.ts';
import { Event } from '../models/Event.ts';
import { User } from '../models/User.ts';
import { authenticateUser, authorizeRoles, AuthRequest } from '../middleware/auth.ts';
import mongoose from 'mongoose';

const router = express.Router();

// Register for an event with Part 2 Logic
router.post('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: `Cannot register for a ${event.status} event` });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot register for a past event' });
    }

    // Duplicate protection (a cancelled row still exists because of the unique userId+eventId index)
    const existing = await Registration.findOne({ userId: req.user!._id, eventId });
    if (existing && existing.status === 'confirmed') {
      return res.status(409).json({ success: false, message: 'Already registered' });
    }

    // Capacity management
    const confirmedCount = await Registration.countDocuments({ eventId, status: 'confirmed' });
    if (confirmedCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    let newRegistration: any;
    try {
      if (existing) {
        // Re-activate a previously cancelled registration instead of inserting a duplicate
        existing.status = 'confirmed';
        existing.registeredAt = new Date();
        existing.cancelledAt = null;
        newRegistration = await existing.save();
      } else {
        newRegistration = await Registration.create({
          userId: req.user!._id,
          eventId,
          status: 'confirmed',
          registeredAt: new Date()
        });
      }
    } catch (err: any) {
      if (err?.code === 11000) {
        return res.status(409).json({ success: false, message: 'Already registered' });
      }
      throw err;
    }

    // Re-check after write so two simultaneous requests can't exceed capacity
    const finalCount = await Registration.countDocuments({ eventId, status: 'confirmed' });
    if (finalCount > event.capacity) {
      newRegistration.status = 'cancelled';
      newRegistration.cancelledAt = new Date();
      await newRegistration.save();
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    res.status(201).json({ success: true, message: 'Registration successful', data: newRegistration });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get my registrations ($lookup example simulation via populate)
router.get('/my', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const myRegistrations = await Registration.find({ userId: req.user!._id })
      .populate({
        path: 'eventId',
        populate: { path: 'organizerId', select: 'name' }
      })
      .sort({ registeredAt: -1 });
    
    // Transform to match frontend expectations
    const registrationsWithEvent = myRegistrations.map((reg: any) => ({
      ...reg._doc,
      eventDetails: reg.eventId
    }));

    res.status(200).json({ success: true, data: registrationsWithEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Aggregation Example: Stats by status for an event
router.get('/stats/:eventId', authenticateUser, authorizeRoles('organizer', 'admin'), async (req, res) => {
  try {
    const stats = await Registration.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(req.params.eventId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel registration
router.delete('/:id', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.userId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save();

    res.status(200).json({ success: true, message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
