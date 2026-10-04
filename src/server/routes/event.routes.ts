import express from 'express';
import { Event } from '../models/Event.ts';
import { Category } from '../models/Category.ts';
import { Registration } from '../models/Registration.ts';
import { authenticateUser, authorizeRoles, AuthRequest } from '../middleware/auth.ts';
import mongoose from 'mongoose';

const router = express.Router();

// Get all events with search, filter, and pagination
router.get('/', async (req, res) => {
  try {
    const { category, search, date, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (category) {
      const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
      if (cat) query.categoryId = cat._id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.venue': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('categoryId', 'name')
      .populate('organizerId', 'name')
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ 
      success: true, 
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single event with registration stats
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const event: any = await Event.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('organizerId', 'name');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const registrationCount = await Registration.countDocuments({ 
      eventId: event._id, 
      status: 'confirmed' 
    });

    res.status(200).json({ 
      success: true, 
      data: { 
        ...event._doc,
        categoryName: event.categoryId?.name,
        organizerName: event.organizerId?.name,
        registeredParticipants: registrationCount,
        availableSeats: event.capacity - registrationCount
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create event (Organizer/Admin)
router.post('/', authenticateUser, authorizeRoles('organizer', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { title, description, category, date, time, venue, city, capacity, registrationFee, contactInfo, image } = req.body;

    if (!title || !description || !category || !date || !time || !venue || !city || !capacity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let cat = await Category.findOne({ name: category });
    if (!cat) {
      cat = await Category.create({ name: category });
    }

    const newEvent = await Event.create({
      title,
      description,
      categoryId: cat._id,
      organizerId: req.user!._id,
      date,
      time,
      location: { venue, city },
      capacity: Number(capacity),
      registrationFee: Number(registrationFee || 0),
      status: 'upcoming',
      contactInfo,
      image
    });

    res.status(201).json({ success: true, message: 'Event created successfully', data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update event
router.put('/:id', authenticateUser, authorizeRoles('organizer', 'admin'), async (req: AuthRequest, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user!.role !== 'admin' && event.organizerId.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { venue, city, ...rest } = req.body;
    const updateData = { ...rest };
    if (venue || city) {
      updateData.location = { 
        venue: venue || (event.location ? event.location.venue : ''), 
        city: city || (event.location ? event.location.city : '') 
      };
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, message: 'Event updated successfully', data: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', authenticateUser, authorizeRoles('organizer', 'admin'), async (req: AuthRequest, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user!.role !== 'admin' && event.organizerId.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ eventId: req.params.id });

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get my events (Organizer)
router.get('/organizer/my-events', authenticateUser, authorizeRoles('organizer', 'admin'), async (req: AuthRequest, res) => {
  try {
    const events = await Event.find({ organizerId: req.user!._id }).populate('categoryId', 'name');
    
    const eventsWithStats = await Promise.all(events.map(async (event: any) => {
      const registrations = await Registration.countDocuments({ eventId: event._id, status: 'confirmed' });
      return {
        ...event._doc,
        registrationCount: registrations
      };
    }));

    res.status(200).json({ success: true, data: eventsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
