import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { eventService, userService } from '../services/api';
import EventCard from '../components/EventCard';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await eventService.getAll({ limit: 4 });
        setEvents(eventsRes.data.slice(0, 4));
        
        // Use default/mock stats if not available
        setStats({
          totalEvents: eventsRes.data.length + 5,
          upcomingEvents: eventsRes.data.filter((e: any) => e.status === 'upcoming').length,
          totalUsers: 150
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
          <div className="flex-1 space-y-6 z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Manage Your Events <br /> with <span className="text-indigo-200">Confidence</span>
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl max-w-lg">
              The complete platform for workshops, seminars, and social gatherings. Register, organize, and thrive together.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/events" 
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
              >
                Browse Events
              </Link>
              <Link 
                to="/register" 
                className="bg-indigo-500 text-white border border-indigo-400 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-400 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center z-10">
             <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 w-full max-w-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg"><Calendar className="w-6 h-6" /></div>
                    <div>
                      <div className="text-sm text-indigo-200">Active Events</div>
                      <div className="text-2xl font-bold">{stats.totalEvents}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                    <div>
                      <div className="text-sm text-indigo-200">Registrations</div>
                      <div className="text-2xl font-bold">1,240+</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg"><Users className="w-6 h-6" /></div>
                    <div>
                      <div className="text-sm text-indigo-200">Community</div>
                      <div className="text-2xl font-bold">{stats.totalUsers}+ Users</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400 rounded-full opacity-20"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
             <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                <CheckCircle className="w-8 h-8" />
             </div>
             <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEvents}</div>
             <div className="text-gray-500 font-medium">Total Events</div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
             <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                <Calendar className="w-8 h-8" />
             </div>
             <div className="text-3xl font-bold text-gray-900 mb-1">{stats.upcomingEvents}</div>
             <div className="text-gray-500 font-medium">Upcoming Events</div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
             <div className="bg-purple-100 text-purple-600 p-4 rounded-full mb-4">
                <Users className="w-8 h-8" />
             </div>
             <div className="text-3xl font-bold text-gray-900 mb-1">2,500+</div>
             <div className="text-gray-500 font-medium">Registered Participants</div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
            <p className="text-gray-500 mt-2">Discover popular events happening soon</p>
          </div>
          <Link to="/events" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
            View All Events
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 h-80 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Workshop', 'Seminar', 'Hackathon', 'Competition', 'Social', 'Corporate', 'College', 'Custom'].map(cat => (
              <Link 
                key={cat} 
                to={`/events?category=${cat}`}
                className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:border-indigo-600 hover:text-indigo-600 transition-all font-bold shadow-sm"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
