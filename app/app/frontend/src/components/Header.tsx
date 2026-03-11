import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, CalendarDays } from 'lucide-react';
import { client } from '@/lib/api';

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    await client.auth.toLogin();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/likenew-logo.png" alt="LikeNew Logo" className="w-9 h-9 rounded-lg object-cover" />
            <span className="text-xl font-bold text-gray-900">LikeNew</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">
              Home
            </Link>
            {user && (
              <>
                <Link to="/booking" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">
                  Book Now
                </Link>
                <Link to="/my-appointments" className="text-gray-600 hover:text-purple-700 font-medium transition-colors">
                  My Appointments
                </Link>
              </>
            )}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/my-appointments')}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    My Appointments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} className="bg-purple-600 hover:bg-purple-700 text-white">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-700 font-medium">
                Home
              </Link>
              {user ? (
                <>
                  <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-700 font-medium">
                    Book Now
                  </Link>
                  <Link to="/my-appointments" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-700 font-medium">
                    My Appointments
                  </Link>
                  <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <Button onClick={handleLogin} className="bg-purple-600 hover:bg-purple-700 text-white mx-3">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}