import { Link } from 'wouter';

const HeroSection = () => {
  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-40">
        <img src="https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
             alt="Happy dog and owner" 
             className="w-full h-full object-cover opacity-85" />
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-6 text-center text-white">
          <h1 className="font-poppins font-bold text-4xl md:text-6xl mb-6">Find Your Forever Friend</h1>
          <p className="font-opensans text-lg md:text-xl mb-8 max-w-2xl mx-auto">Thousands of adorable pets are waiting for a loving home. Start your journey to find the perfect companion today.</p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
            <Link href="/pets" className="transform transition-all duration-300 hover:scale-105 font-poppins font-medium text-lg px-8 py-4 bg-primary text-white rounded-full hover:bg-opacity-90">
              Adopt a Pet
            </Link>
            <Link href="/about" className="transform transition-all duration-300 hover:scale-105 font-poppins font-medium text-lg px-8 py-4 bg-white text-primary rounded-full hover:bg-gray-100">
              How It Works
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default HeroSection;
