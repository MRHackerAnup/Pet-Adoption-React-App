const QuickStats = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 border-b-4 border-primary rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <i className="fas fa-home text-4xl text-primary mb-4"></i>
            <h3 className="font-poppins font-bold text-2xl text-dark mb-2">10,000+</h3>
            <p className="font-opensans text-gray-600">Pets Adopted</p>
          </div>
          
          <div className="text-center p-6 border-b-4 border-teal-400 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <i className="fas fa-building text-4xl text-teal-400 mb-4"></i>
            <h3 className="font-poppins font-bold text-2xl text-dark mb-2">200+</h3>
            <p className="font-opensans text-gray-600">Partner Shelters</p>
          </div>
          
          <div className="text-center p-6 border-b-4 border-yellow-400 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <i className="fas fa-heart text-4xl text-yellow-400 mb-4"></i>
            <h3 className="font-poppins font-bold text-2xl text-dark mb-2">50,000+</h3>
            <p className="font-opensans text-gray-600">Happy Families</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStats;
