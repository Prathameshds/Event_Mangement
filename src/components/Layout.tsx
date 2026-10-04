import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Github, Twitter, Linkedin, Mail, Calendar } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white text-gray-500 py-12 border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-gray-900">EventHive</span>
              <span className="text-gray-300 mx-2">|</span>
              <p className="text-sm tracking-tight">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
            
            <div className="flex gap-8 text-sm font-medium">
              <Link to="/events" className="hover:text-indigo-600 transition-colors">Events</Link>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
