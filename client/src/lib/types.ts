// Pet related types
export interface Pet {
  id: number;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Small Pet';
  breed: string;
  age: number;
  size: 'Small' | 'Medium' | 'Large';
  gender: 'Male' | 'Female';
  description: string;
  imageUrl: string;
  shelterId: number;
  status: 'Available' | 'Pending' | 'Adopted';
}

export interface InsertPet extends Omit<Pet, 'id'> {}

// Shelter related types
export interface Shelter {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  imageUrl: string;
  petsCount: number;
}

export interface InsertShelter extends Omit<Shelter, 'id' | 'petsCount'> {}

// Adoption application related types
export interface AdoptionApplication {
  id: number;
  petId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  housingType: 'House' | 'Apartment' | 'Condo' | 'Other';
  hasYard: boolean;
  hasChildren: boolean;
  hasPets: boolean;
  existingPets?: string;
  reasonForAdoption: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: Date;
}

export interface InsertAdoptionApplication extends Omit<AdoptionApplication, 'id' | 'status' | 'submittedAt'> {}

// Testimonial related types
export interface Testimonial {
  id: number;
  name: string;
  petName: string;
  adoptedDuration: string;
  content: string;
  rating: number;
  imageUrl: string;
}

export interface InsertTestimonial extends Omit<Testimonial, 'id'> {}

// Contact form related types
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

export interface InsertContactMessage extends Omit<ContactMessage, 'id' | 'submittedAt'> {}

// Newsletter subscription related types
export interface NewsletterSubscription {
  id: number;
  name?: string;
  email: string;
  subscribedAt: Date;
}

export interface InsertNewsletterSubscription extends Omit<NewsletterSubscription, 'id' | 'subscribedAt'> {}
