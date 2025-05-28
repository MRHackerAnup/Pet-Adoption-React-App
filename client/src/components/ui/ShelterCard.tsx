import { Link } from 'wouter';
import { Shelter } from '@/lib/types';

interface ShelterCardProps {
  shelter: Shelter;
}

const ShelterCard = ({ shelter }: ShelterCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <img 
        src={shelter.imageUrl} 
        alt={shelter.name} 
        className="w-full h-48 object-cover"
      />
      
      <div className="p-6">
        <h3 className="font-poppins font-semibold text-xl text-dark mb-2">{shelter.name}</h3>
        <p className="font-opensans text-gray-600 mb-4 line-clamp-2">{shelter.description}</p>
        
        <div className="flex items-center text-gray-500 mb-4">
          <i className="fas fa-map-marker-alt mr-2"></i>
          <span className="text-sm">{shelter.city}, {shelter.state}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-poppins">{shelter.petsCount} Pets Available</span>
          <Link href={`/shelters/${shelter.id}`} className="text-primary font-poppins text-sm font-medium hover:underline">View Shelter</Link>
        </div>
      </div>
    </div>
  );
};

export default ShelterCard;
