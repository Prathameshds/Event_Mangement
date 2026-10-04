import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventCalendarProps {
  events: any[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-4 bg-indigo-600 text-white rounded-t-2xl">
        <h2 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {days.map((day, index) => (
          <div key={index} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    const rows: React.ReactNode[] = [];
    let days: React.ReactNode[] = [];

    calendarDays.forEach((day, i) => {
      const formattedDate = format(day, 'd');
      const dayEvents = events.filter(event => isSameDay(parseISO(event.date), day));
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);

      days.push(
        <div
          key={day.toString()}
          className={`relative min-h-[80px] md:min-h-[120px] p-2 border-r border-b border-gray-100 cursor-pointer transition-all ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-300' : 'bg-white text-gray-700'
          } ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-10' : 'hover:bg-indigo-50/30'}`}
          onClick={() => setSelectedDate(day)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
              isToday(day) ? 'bg-indigo-600 text-white' : ''
            }`}>
              {formattedDate}
            </span>
          </div>
          <div className="mt-1 space-y-1 overflow-hidden">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div 
                key={event._id} 
                className="text-[10px] md:text-xs px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded truncate font-medium"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-gray-400 font-bold pl-1">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="bg-white rounded-b-2xl overflow-hidden border-l border-t border-gray-100">{rows}</div>;
  };

  const renderEventList = () => {
    const selectedDateEvents = events.filter(event => isSameDay(parseISO(event.date), selectedDate));
    
    return (
      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          Events for {format(selectedDate, 'MMMM do, yyyy')}
        </h3>
        
        {selectedDateEvents.length === 0 ? (
          <p className="text-gray-500 italic">No events scheduled for this day.</p>
        ) : (
          <div className="space-y-4">
            {selectedDateEvents.map((event) => (
              <div key={event._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}, {event.city}</span>
                  </div>
                </div>
                <Link 
                  to={`/events/${event._id}`}
                  className="mt-4 md:mt-0 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="shadow-xl rounded-2xl overflow-hidden border border-indigo-100">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      {renderEventList()}
    </div>
  );
}
