import { Testimonial } from '@/lib/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    // Add empty stars to make up 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    
    return stars;
  };

  return (
    <div className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
      <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
        <div className="flex items-center mb-4">
          <img 
            src={testimonial.imageUrl} 
            alt={`${testimonial.name} with ${testimonial.petName}`} 
            className="w-16 h-16 rounded-full object-cover mr-4"
          />
          <div>
            <h4 className="font-poppins font-semibold text-dark">{testimonial.name} & {testimonial.petName}</h4>
            <p className="text-sm text-gray-500">Adopted {testimonial.adoptedDuration}</p>
          </div>
        </div>
        <p className="font-opensans text-gray-600 mb-4">
          "{testimonial.content}"
        </p>
        <div className="flex text-yellow-400">
          {renderStars(testimonial.rating)}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
