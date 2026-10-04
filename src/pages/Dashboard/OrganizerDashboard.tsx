import { useState, useEffect } from 'react';
import { eventService, registrationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Edit, Trash2, Plus, Loader2, Eye, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await eventService.getMyEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also cancel all registrations.')) return;
    
    setDeleting(id);
    try {
      await eventService.delete(id);
      fetchMyEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;
  }

  const totalRegistrations = events.reduce((sum, e: any) => sum + (e.registrationCount || 0), 0);
  const upcomingEvents = events.filter((e: any) => e.status === 'upcoming').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Panel</h1>
          <p className="text-gray-500 mt-2">Manage your events and track participants.</p>
        </div>
        <Link 
          to="/events/create" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">My Events</div>
           <div className="text-4xl font-extrabold text-indigo-600">{events.length}</div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Registrations</div>
           <div className="text-4xl font-extrabold text-green-600">{totalRegistrations}</div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Upcoming</div>
           <div className="text-4xl font-extrabold text-blue-600">{upcomingEvents}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">My Events</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-6 text-lg font-medium">You haven't created any events yet.</p>
            <Link to="/events/create" className="text-indigo-600 font-bold hover:underline">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Event</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Capacity</th>
                  <th className="px-8 py-4">Registrations</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event: any) => (
                  <tr key={event._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{event.category}</div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-700">
                      {format(new Date(event.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-700">
                      {event.capacity}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-indigo-500 rounded-full" 
                               style={{ width: `${Math.min(100, (event.registrationCount / event.capacity) * 100)}%` }}
                             ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{event.registrationCount}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/events/${event._id}`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link to={`/events/edit/${event._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          disabled={deleting === event._id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          {deleting === event._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
