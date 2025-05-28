import { Link } from 'wouter';

const AdoptionProcess = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-dark mb-4">How Adoption Works</h2>
          <p className="font-opensans text-gray-600 max-w-2xl mx-auto">Our simple 4-step process makes adopting your new best friend easy and enjoyable.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-2xl text-primary"></i>
            </div>
            <div className="font-poppins font-semibold text-xl text-dark mb-2">Browse Pets</div>
            <p className="font-opensans text-gray-600">Search through our database of adorable pets waiting for their forever homes.</p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-teal-400 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-alt text-2xl text-teal-400"></i>
            </div>
            <div className="font-poppins font-semibold text-xl text-dark mb-2">Apply</div>
            <p className="font-opensans text-gray-600">Complete our simple adoption application form for the pet you're interested in.</p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-yellow-400 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-calendar-check text-2xl text-yellow-400"></i>
            </div>
            <div className="font-poppins font-semibold text-xl text-dark mb-2">Meet & Greet</div>
            <p className="font-opensans text-gray-600">Schedule a time to meet your potential new family member at the shelter.</p>
          </div>
          
          {/* Step 4 */}
          <div className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-500 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-home text-2xl text-green-500"></i>
            </div>
            <div className="font-poppins font-semibold text-xl text-dark mb-2">Bring Home</div>
            <p className="font-opensans text-gray-600">Complete the adoption process and welcome your new pet to their forever home.</p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link href="/pets" className="inline-block font-poppins font-medium px-8 py-3 bg-primary text-white rounded-full hover:bg-opacity-90 transition-colors">Start Your Journey</Link>
        </div>
      </div>
    </section>
  );
};

export default AdoptionProcess;
