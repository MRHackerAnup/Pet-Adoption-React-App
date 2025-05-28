import mongoose from 'mongoose';

// Provide a mock for models if MongoDB is not available
const createMockMongoose = () => {
  const mockMongoose = {
    connection: { readyState: 1 },
    models: {
      Payment: {
        find: () => ({ 
          exec: () => Promise.resolve([]),
          populate: () => ({ exec: () => Promise.resolve([]) }) 
        }),
        findOne: () => ({ 
          exec: () => Promise.resolve(null),
          populate: () => ({ exec: () => Promise.resolve(null) }) 
        }),
        create: () => Promise.resolve({ _id: 'mock-id' }),
      },
      Donation: {
        find: () => ({ 
          exec: () => Promise.resolve([]),
          populate: () => ({ exec: () => Promise.resolve([]) }) 
        }),
        findOne: () => ({ 
          exec: () => Promise.resolve(null),
          populate: () => ({ exec: () => Promise.resolve(null) }) 
        }),
        create: () => Promise.resolve({ _id: 'mock-id' }),
      }
    }
  };
  return mockMongoose as unknown as typeof mongoose;
};

// Simple connection function that doesn't try to be too clever with caching
async function connectToDatabase(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set - returning mock mongoose');
    return createMockMongoose();
  }

  try {
    if (mongoose.connection.readyState) {
      return mongoose;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Using mock mongoose instead');
    return createMockMongoose();
  }
}

export { connectToDatabase };