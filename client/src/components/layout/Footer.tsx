import { Link } from 'wouter';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await apiRequest('POST', '/api/newsletter-subscriptions', { email });
      toast({
        title: "Success!",
        description: "You have been subscribed to our newsletter",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center mb-6">
              <i className="fas fa-paw text-primary text-3xl mr-2"></i>
              <span className="font-poppins font-bold text-2xl">Pet<span className="text-primary">Adopt</span></span>
            </div>
            <p className="font-opensans text-gray-400 mb-6">
              PetAdopt connects loving homes with pets in need. Our mission is to reduce pet homelessness and help every animal find their forever family.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="font-opensans text-gray-400 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="font-opensans text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/pets" className="font-opensans text-gray-400 hover:text-primary transition-colors">Adopt a Pet</Link></li>
              <li><Link href="/shelters" className="font-opensans text-gray-400 hover:text-primary transition-colors">Partner Shelters</Link></li>
              <li><Link href="#" className="font-opensans text-gray-400 hover:text-primary transition-colors">Success Stories</Link></li>
              <li><Link href="/contact" className="font-opensans text-gray-400 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Pets */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Find Pets</h3>
            <ul className="space-y-3">
              <li><Link href="/pets?species=Dog" className="font-opensans text-gray-400 hover:text-primary transition-colors">Dogs</Link></li>
              <li><Link href="/pets?species=Cat" className="font-opensans text-gray-400 hover:text-primary transition-colors">Cats</Link></li>
              <li><Link href="/pets?species=Small Pet" className="font-opensans text-gray-400 hover:text-primary transition-colors">Small Pets</Link></li>
              <li><Link href="/pets?species=Bird" className="font-opensans text-gray-400 hover:text-primary transition-colors">Birds</Link></li>
              <li><Link href="/pets" className="font-opensans text-gray-400 hover:text-primary transition-colors">All Pets</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Newsletter</h3>
            <p className="font-opensans text-gray-400 mb-4">Subscribe to get updates on new pets and adoption events.</p>
            <form onSubmit={handleSubscribe}>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-primary transition-colors w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="bg-primary px-4 py-2 rounded-r-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-opensans text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} PetAdopt. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="font-opensans text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="font-opensans text-gray-400 hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="font-opensans text-gray-400 hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
