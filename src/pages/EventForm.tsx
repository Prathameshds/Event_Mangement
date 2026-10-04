import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/api';
import { Calendar, MapPin, Clock, Tag, Users, Info, ArrowLeft, Loader2, Save, Plus } from 'lucide-react';

export default function EventForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    date: '',
    time: '',
    venue: '',
    city: '',
    capacity: '',
    registrationFee: '0',
    contactInfo: '',
    image: '',
    status: 'upcoming'
  });

  const categories = ['Workshop', 'Seminar', 'College', 'Competition', 'Hackathon', 'Social', 'Corporate', 'Other'];

  useEffect(() => {
    if (isEdit) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await eventService.getById(id!);
      const event = res.data;
      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date.split('T')[0],
        time: event.time,
        venue: event.venue,
        city: event.city,
        capacity: event.capacity.toString(),
        registrationFee: event.registrationFee.toString(),
        contactInfo: event.contactInfo || '',
        image: event.image || '',
        status: event.status
      });
    } catch (err) {
      setError('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await eventService.update(id!, formData);
      } else {
        await eventService.create(formData);
      }
      navigate('/organizer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="px-8 py-8 border-b border-gray-50 bg-indigo-600 text-white">
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="text-indigo-100 mt-2">Fill in the details below to reach your audience.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border-l-4 border-red-500">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Info className="w-5 h-5 text-indigo-500" /> Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Event Title *</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Annual Tech Symposium"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Category *</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                 <label className="text-sm font-bold text-gray-700 ml-1">Registration Fee (₹) *</label>
                 <input 
                   name="registrationFee" 
                   type="number" 
                   min="0"
                   value={formData.registrationFee} 
                   onChange={handleChange} 
                   required
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Description *</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  rows={4}
                  placeholder="What is this event about? Highlights, guest speakers, agenda..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Logistics */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> Date, Time & Venue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Date *</label>
                <input 
                  name="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Time *</label>
                <input 
                  name="time" 
                  type="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Venue *</label>
                <input 
                  name="venue" 
                  value={formData.venue} 
                  onChange={handleChange} 
                  required
                  placeholder="Room, Hall or Building Name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">City *</label>
                <input 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  required
                  placeholder="Mumbai, Bangalore, etc."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                 <label className="text-sm font-bold text-gray-700 ml-1">Maximum Capacity *</label>
                 <input 
                   name="capacity" 
                   type="number" 
                   min="1"
                   value={formData.capacity} 
                   onChange={handleChange} 
                   required
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
              </div>
              {isEdit && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Event Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Additional Info */}
          <section className="space-y-4">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-500" /> Additional Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Contact Email/Phone</label>
                  <input 
                    name="contactInfo" 
                    value={formData.contactInfo} 
                    onChange={handleChange}
                    placeholder="e.g. contact@event.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Image URL</label>
                  <input 
                    name="image" 
                    value={formData.image} 
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
             </div>
          </section>

          <div className="pt-8 border-t border-gray-50 flex gap-4">
             <button 
               type="button" 
               onClick={() => navigate(-1)}
               className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
             >
               Cancel
             </button>
             <button 
               type="submit" 
               disabled={saving}
               className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
             >
               {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Event' : 'Create Event'}</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
