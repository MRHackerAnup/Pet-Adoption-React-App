import { Link } from 'wouter';
import { Pet } from '@/lib/types';

interface PetCardProps {
  pet: Pet;
}

const PetCard = ({ pet }: PetCardProps) => {
  const getSpeciesBadgeColor = (species: string) => {
    switch (species) {
      case 'Dog':
        return 'bg-primary';
      case 'Cat':
        return 'bg-teal-400';
      case 'Bird':
        return 'bg-yellow-400';
      case 'Small Pet':
        return 'bg-purple-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 pet-card">
      <div className="relative">
        <img 
          src={pet.imageUrl} 
          alt={`${pet.name} - ${pet.breed}`} 
          className="w-full h-48 object-cover"
        />
        <span className={`absolute top-3 left-3 ${getSpeciesBadgeColor(pet.species)} text-white text-xs font-poppins font-medium px-3 py-1 rounded-full`}>
          {pet.species}
        </span>
        
        {pet.status !== 'Available' && (
          <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-poppins font-medium px-3 py-1 rounded-full">
            {pet.status}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-poppins font-semibold text-lg text-dark">{pet.name}</h3>
          <span className="text-sm font-poppins text-gray-500">{pet.age} {pet.age === 1 ? 'yr' : 'yrs'}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pet.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-poppins">{pet.breed}</span>
          <Link href={`/pets/${pet.id}`} className="text-primary font-poppins text-sm font-medium hover:underline">View Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
