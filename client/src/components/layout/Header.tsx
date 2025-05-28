import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, User } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <i className="fas fa-paw text-primary text-3xl mr-2"></i>
            <span className="font-poppins font-bold text-2xl text-dark">Pet<span className="text-primary">Adopt</span></span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-poppins font-medium ${isActive('/') ? 'text-primary' : 'text-dark hover:text-primary'} transition-colors`}>Home</Link>
            <Link href="/about" className={`font-poppins font-medium ${isActive('/about') ? 'text-primary' : 'text-dark hover:text-primary'} transition-colors`}>About</Link>
            <Link href="/pets" className={`font-poppins font-medium ${isActive('/pets') ? 'text-primary' : 'text-dark hover:text-primary'} transition-colors`}>Adopt</Link>
            <Link href="/shelters" className={`font-poppins font-medium ${isActive('/shelters') ? 'text-primary' : 'text-dark hover:text-primary'} transition-colors`}>Shelters</Link>
            <Link href="/contact" className={`font-poppins font-medium ${isActive('/contact') ? 'text-primary' : 'text-dark hover:text-primary'} transition-colors`}>Contact</Link>
            
            {isLoading ? (
              <Button disabled className="font-poppins px-6 py-2 bg-primary text-white rounded-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link href="/my-appointments" className={`font-poppins font-medium ${isActive('/my-appointments') ? 'text-primary' : 'text-dark hover:text-primary'} transition-colors`}>
                  My Appointments
                </Link>
                <span className="font-poppins font-medium text-dark">
                  {user.name || user.username}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </Button>
              </div>
            ) : (
              <Link href="/auth" className="font-poppins font-medium px-6 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 transition-colors">
                Sign In
              </Link>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-dark text-2xl focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white py-3 px-4 shadow-inner`}>
        <nav className="flex flex-col space-y-3">
          <Link href="/" onClick={closeMobileMenu} className="font-poppins font-medium text-dark hover:text-primary transition-colors py-2 border-b border-gray-100">Home</Link>
          <Link href="/about" onClick={closeMobileMenu} className="font-poppins font-medium text-dark hover:text-primary transition-colors py-2 border-b border-gray-100">About</Link>
          <Link href="/pets" onClick={closeMobileMenu} className="font-poppins font-medium text-dark hover:text-primary transition-colors py-2 border-b border-gray-100">Adopt</Link>
          <Link href="/shelters" onClick={closeMobileMenu} className="font-poppins font-medium text-dark hover:text-primary transition-colors py-2 border-b border-gray-100">Shelters</Link>
          <Link href="/contact" onClick={closeMobileMenu} className="font-poppins font-medium text-dark hover:text-primary transition-colors py-2 border-b border-gray-100">Contact</Link>
          
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : user ? (
            <div className="flex flex-col space-y-2 py-2 border-t border-gray-100">
              <div className="font-poppins font-medium text-dark">
                {user.name || user.username}
              </div>
              <Link 
                href="/my-appointments" 
                onClick={closeMobileMenu} 
                className="font-poppins font-medium text-dark hover:text-primary transition-colors py-2 border-y border-gray-100"
              >
                My Appointments
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logoutMutation.mutate();
                  closeMobileMenu();
                }}
                disabled={logoutMutation.isPending}
                className="w-full flex justify-center items-center"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Sign Out
              </Button>
            </div>
          ) : (
            <Link 
              href="/auth" 
              onClick={closeMobileMenu} 
              className="font-poppins font-medium px-6 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 transition-colors w-full text-center mt-2"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
