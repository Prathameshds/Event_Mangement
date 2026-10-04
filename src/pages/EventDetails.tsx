import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Tag, Users, ShieldCheck, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { eventService, registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await eventService.getById(id!);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setRegistering(true);
    setMessage(null);
    try {
      await registrationService.register(id!);
      setMessage({ type: 'success', text: 'Registration Successful!' });
      // Refresh event details to update capacity
      fetchEvent();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Event not found</h2>
        <Link to="/events" className="text-indigo-600 font-bold hover:underline">Return to all events</Link>
      </div>
    );
  }

  const isFull = event.availableSeats <= 0;
  const isPast = new Date(event.date) < new Date();
  const isCancelled = event.status === 'cancelled';
  const canRegister = !isFull && !isPast && !isCancelled;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[400px] bg-indigo-50 rounded-3xl overflow-hidden relative border border-gray-100">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-200">
                <Calendar className="w-32 h-32" />
              </div>
            )}
            <div className="absolute top-6 left-6 flex gap-2">
               <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 shadow-sm">
                {event.category}
              </span>
              {isCancelled && (
                 <span className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest">
                  Cancelled
                </span>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-6 mb-8 text-gray-600">
               <div className="flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-indigo-500" />
                 <span className="font-medium">{format(new Date(event.date), 'EEEE, dd MMMM yyyy')}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Clock className="w-5 h-5 text-indigo-500" />
                 <span className="font-medium">{event.time}</span>
               </div>
               <div className="flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-indigo-500" />
                 <span className="font-medium">{event.venue}, {event.city}</span>
               </div>
            </div>

            <div className="prose prose-indigo max-w-none">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
            
            {event.contactInfo && (
              <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">Organizer Contact</h4>
                <p className="text-gray-600">{event.contactInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Registration Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Registration Fee</span>
              <span className="text-3xl font-bold text-gray-900">
                {event.registrationFee === 0 ? 'Free' : `₹${event.registrationFee}`}
              </span>
            </div>

            <div className="space-y-4 border-t border-b border-gray-50 py-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" /> Total Capacity</span>
                <span className="font-bold text-gray-900">{event.capacity} seats</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Available Seats</span>
                <span className={`font-bold ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                  {event.availableSeats} seats left
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Organized by</span>
                <span className="font-bold text-gray-900">{event.organizerName || 'Unknown'}</span>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
                {message.type === 'success' && (
                  <Link to="/participant/dashboard" className="block mt-2 underline font-bold">View My Registrations</Link>
                )}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={!canRegister || registering}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                canRegister 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {registering ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isCancelled ? (
                'Event Cancelled'
              ) : isPast ? (
                'Event Ended'
              ) : isFull ? (
                'Registration Full'
              ) : (
                'Register Now'
              )}
            </button>

            <div className="pt-2">
               <button className="w-full flex items-center justify-center gap-2 text-gray-500 font-medium hover:text-indigo-600 transition-colors">
                  <Share2 className="w-4 h-4" /> Share Event
               </button>
            </div>

            {!user && (
              <p className="text-xs text-center text-gray-400">
                Please login to register for this event.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
