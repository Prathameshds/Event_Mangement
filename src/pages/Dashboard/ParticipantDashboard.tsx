import { useState, useEffect } from 'react';
import { registrationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Clock, ExternalLink, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationService.getMyRegistrations();
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    
    setCancelling(id);
    try {
      await registrationService.cancel(id);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;
  }

  const activeRegistrations = registrations.filter((r: any) => ['registered', 'pending', 'waitlisted'].includes(r.status));
  const pastRegistrations = registrations.filter((r: any) => r.status === 'registered' && new Date(r.eventDetails.date) < new Date());
  const upcomingRegistrations = registrations.filter((r: any) => r.status === 'registered' && new Date(r.eventDetails.date) >= new Date());

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'waitlisted':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 mt-2">Manage your event registrations and profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Registrations</div>
           <div className="text-4xl font-extrabold text-indigo-600">{activeRegistrations.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Upcoming Events</div>
           <div className="text-4xl font-extrabold text-green-600">{upcomingRegistrations.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Completed Events</div>
           <div className="text-4xl font-extrabold text-gray-400">{pastRegistrations.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">My Registrations</h2>
        </div>
        
        {registrations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-6 text-lg font-medium">You haven't registered for any events yet.</p>
            <Link to="/events" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors inline-block shadow-lg">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Event</th>
                  <th className="px-8 py-4">Date & Time</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map((reg: any) => (
                  <tr key={reg._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 font-bold shrink-0">
                          {reg.eventDetails.title[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {reg.eventDetails.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {reg.eventDetails.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-gray-700">{format(new Date(reg.eventDetails.date), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {reg.eventDetails.time}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(reg.status)}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={`/events/${reg.event}`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Event">
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        {reg.status !== 'cancelled' && new Date(reg.eventDetails.date) > new Date() && (
                          <button 
                            onClick={() => handleCancel(reg._id)}
                            disabled={cancelling === reg._id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            title="Cancel Registration"
                          >
                            {cancelling === reg._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                          </button>
                        )}
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
