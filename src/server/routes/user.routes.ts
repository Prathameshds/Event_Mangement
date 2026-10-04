import express from 'express';
import { User } from '../models/User.ts';
import { Event } from '../models/Event.ts';
import { Registration } from '../models/Registration.ts';
import { authenticateUser, authorizeRoles } from '../middleware/auth.ts';

const router = express.Router();

// Admin: Get all users
router.get('/', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get stats (Aggregation and Counts)
router.get('/stats', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const [totalUsers, totalOrganizers, totalEvents, totalRegistrations, upcomingEvents] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'organizer' }),
      Event.countDocuments(),
      Registration.countDocuments({ status: 'confirmed' }),
      Event.countDocuments({ status: 'upcoming' })
    ]);

    const stats = {
      totalUsers,
      totalOrganizers,
      totalEvents,
      totalRegistrations,
      upcomingEvents
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update user status
router.put('/:id/status', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Delete user
router.delete('/:id', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);
    // Cleanup related data
    await Event.deleteMany({ organizerId: req.params.id });
    await Registration.deleteMany({ userId: req.params.id });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
