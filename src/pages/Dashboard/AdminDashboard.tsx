import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, eventService, registrationService } from '../../services/api';
import { Users, Calendar, Shield, Trash2, Ban, CheckCircle, Loader2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'registrations'>('users');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        userService.getAll(),
        userService.getStats()
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await userService.updateStatus(id, newStatus);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user? All their events and registrations will be removed.')) return;
    try {
      await userService.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage the entire EventHive ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 text-indigo-600 mb-2">
             <Users className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-wider">Total Users</span>
           </div>
           <div className="text-3xl font-extrabold text-gray-900">{stats?.totalUsers}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 text-green-600 mb-2">
             <Shield className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-wider">Organizers</span>
           </div>
           <div className="text-3xl font-extrabold text-gray-900">{stats?.totalOrganizers}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 text-blue-600 mb-2">
             <Calendar className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-wider">Total Events</span>
           </div>
           <div className="text-3xl font-extrabold text-gray-900">{stats?.totalEvents}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-3 text-purple-600 mb-2">
             <BarChart3 className="w-5 h-5" />
             <span className="text-sm font-bold uppercase tracking-wider">Registrations</span>
           </div>
           <div className="text-3xl font-extrabold text-gray-900">{stats?.totalRegistrations}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex px-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-6 px-4 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-6 px-4 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'events' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Manage Events
            </button>
          </nav>
        </div>

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Joined</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'organizer' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${
                        u.status === 'active' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-600' : 'bg-red-500'}`}></div>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      {format(new Date(u.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleToggleStatus(u._id, u.status)}
                            className={`p-2 rounded-lg transition-all ${
                              u.status === 'active' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={u.status === 'active' ? 'Disable' : 'Enable'}
                          >
                            {u.status === 'active' ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'events' && (
           <div className="p-12 text-center text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Event moderation tools are available on individual event pages.</p>
              <Link to="/events" className="text-indigo-600 font-bold hover:underline mt-4 inline-block">View All Events</Link>
           </div>
        )}
      </div>
    </div>
  );
}
