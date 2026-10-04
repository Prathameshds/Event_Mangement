import express from 'express';
import { Registration } from '../models/Registration.ts';
import { Event } from '../models/Event.ts';
import { authenticateUser, authorizeRoles } from '../middleware/auth.ts';
import mongoose from 'mongoose';

const router = express.Router();

// 1. Total registrations per event (Demonstrates $group)
router.get('/registrations-per-event', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const stats = await Registration.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: "$eventId",
          registrationCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          eventTitle: "$eventDetails.title",
          registrationCount: 1
        }
      },
      { $sort: { registrationCount: -1 } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Registrations by Category (Demonstrates complex $lookup and $group)
router.get('/by-category', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          eventCount: { $sum: 1 }
        }
      },
      { $sort: { eventCount: -1 } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. User Stats (Total by role)
router.get('/users-by-role', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const stats = await mongoose.model('User').aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
