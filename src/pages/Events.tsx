import { Search, Filter, Calendar as CalendarIcon, X, LayoutGrid, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import EventCalendar from '../components/EventCalendar';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');

  const categories = ['Workshop', 'Seminar', 'College', 'Competition', 'Hackathon', 'Social', 'Corporate', 'Other'];

  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries([...searchParams]);
      const res = await eventService.getAll(params);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (search) newParams.set('search', search); else newParams.delete('search');
    if (category) newParams.set('category', category); else newParams.delete('category');
    if (date) newParams.set('date', date); else newParams.delete('date');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setDate('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Events</h1>
          <p className="text-gray-500 mt-1">Discover workshops, seminars and social gatherings</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              List
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            {events.length} Results
          </div>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Event title, city or venue..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-48 space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
          <select 
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="w-full md:w-48 space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input 
              type="date" 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            type="submit"
            className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply
          </button>
          <button 
            type="button"
            onClick={clearFilters}
            className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            title="Clear Filters"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </form>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-100 h-96 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
           <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-1">No events found</h3>
           <p className="text-gray-500">Try adjusting your filters or search terms</p>
           <button 
             onClick={clearFilters}
             className="mt-6 text-indigo-600 font-bold hover:underline"
           >
             Clear all filters
           </button>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-2 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <EventCalendar events={events} />
          </div>
        )
      )}
    </div>
  );
}
