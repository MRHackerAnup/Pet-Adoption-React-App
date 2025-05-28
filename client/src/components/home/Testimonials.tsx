import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import TestimonialCard from '@/components/ui/TestimonialCard';
import { Testimonial } from '@/lib/types';

const Testimonials = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-dark mb-4">Happy Adoption Stories</h2>
          <p className="font-opensans text-gray-600 max-w-2xl mx-auto">Hear from families who found their perfect companions through PetAdopt.</p>
        </div>
        
        <div className="relative">
          {isLoading ? (
            <div className="text-center py-10">
              <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
              <p className="mt-2 text-gray-600">Loading testimonials...</p>
            </div>
          ) : (
            <div ref={sliderRef} className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
              {testimonials?.map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
          
          {/* Navigation arrows (hidden on mobile) */}
          <button 
            className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 hidden md:flex bg-white rounded-full w-10 h-10 shadow-md items-center justify-center focus:outline-none"
            onClick={scrollLeft}
          >
            <i className="fas fa-chevron-left text-primary"></i>
          </button>
          <button 
            className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 hidden md:flex bg-white rounded-full w-10 h-10 shadow-md items-center justify-center focus:outline-none"
            onClick={scrollRight}
          >
            <i className="fas fa-chevron-right text-primary"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
