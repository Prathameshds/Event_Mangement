import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Users } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const isFree = event.registrationFee === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-48 bg-indigo-50 relative overflow-hidden">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-200">
            <Calendar className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
          {event.category}
        </div>
        {event.status === 'cancelled' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-1 rounded-md font-bold uppercase tracking-wider text-sm">
              Cancelled
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{format(new Date(event.date), 'dd MMMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="line-clamp-1">{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>{event.capacity} seats available</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
          <div className="text-lg font-bold text-gray-900">
            {isFree ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span>₹{event.registrationFee}</span>
            )}
          </div>
          <Link 
            to={`/events/${event._id}`}
            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
