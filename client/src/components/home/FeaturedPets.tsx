import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import PetCard from '@/components/ui/PetCard';
import { Pet } from '@/lib/types';

const FeaturedPets = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ['/api/pets'],
  });

  const filteredPets = pets ? 
    (activeCategory === 'All' ? 
      pets : 
      pets.filter(pet => pet.species === activeCategory)
    ) : [];

  return (
    <section id="adopt" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-dark mb-4">Find Your Perfect Companion</h2>
          <p className="font-opensans text-gray-600 max-w-2xl mx-auto">Browse our selection of loving pets waiting for their forever homes.</p>
        </div>
        
        {/* Pet Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button 
            className={`px-6 py-2 ${activeCategory === 'All' ? 'bg-primary text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'} rounded-full font-poppins transition-colors`}
            onClick={() => setActiveCategory('All')}
          >
            All Pets
          </button>
          <button 
            className={`px-6 py-2 ${activeCategory === 'Dog' ? 'bg-primary text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'} rounded-full font-poppins transition-colors`}
            onClick={() => setActiveCategory('Dog')}
          >
            Dogs
          </button>
          <button 
            className={`px-6 py-2 ${activeCategory === 'Cat' ? 'bg-primary text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'} rounded-full font-poppins transition-colors`}
            onClick={() => setActiveCategory('Cat')}
          >
            Cats
          </button>
          <button 
            className={`px-6 py-2 ${activeCategory === 'Small Pet' ? 'bg-primary text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'} rounded-full font-poppins transition-colors`}
            onClick={() => setActiveCategory('Small Pet')}
          >
            Small Pets
          </button>
          <button 
            className={`px-6 py-2 ${activeCategory === 'Bird' ? 'bg-primary text-white' : 'bg-gray-100 text-dark hover:bg-gray-200'} rounded-full font-poppins transition-colors`}
            onClick={() => setActiveCategory('Bird')}
          >
            Birds
          </button>
        </div>
        
        {/* Pet Listings Grid */}
        {isLoading ? (
          <div className="text-center py-10">
            <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
            <p className="mt-2 text-gray-600">Loading pets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link href="/pets" className="inline-block font-poppins font-medium px-8 py-3 bg-primary text-white rounded-full hover:bg-opacity-90 transition-colors">View All Pets</Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPets;
