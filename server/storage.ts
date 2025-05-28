import {
  User,
  InsertUser,
  Pet,
  InsertPet,
  Shelter,
  InsertShelter,
  AdoptionApplication,
  InsertAdoptionApplication,
  Testimonial,
  InsertTestimonial,
  ContactMessage,
  InsertContactMessage,
  NewsletterSubscription,
  InsertNewsletterSubscription,
  Appointment,
  InsertAppointment
} from "@shared/schema";

interface PetFilter {
  species?: string;
  size?: string;
  age?: number;
}

import session from "express-session";
import { Store } from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Session store for authentication
  sessionStore: Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Pet methods
  getAllPets(filter?: PetFilter): Promise<Pet[]>;
  getPet(id: number): Promise<Pet | undefined>;
  getPetsByShelter(shelterId: number): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePetStatus(id: number, status: string): Promise<Pet | undefined>;

  // Shelter methods
  getAllShelters(): Promise<Shelter[]>;
  getShelter(id: number): Promise<Shelter | undefined>;
  createShelter(shelter: InsertShelter): Promise<Shelter>;

  // Adoption application methods
  getAdoptionApplicationsByPet(petId: number): Promise<AdoptionApplication[]>;
  createAdoptionApplication(application: InsertAdoptionApplication): Promise<AdoptionApplication>;

  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  getAppointmentsByPet(petId: number): Promise<Appointment[]>;
  getAppointmentsByShelter(shelterId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;

  // Testimonial methods
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Contact message methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Newsletter subscription methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pets: Map<number, Pet>;
  private shelters: Map<number, Shelter>;
  private adoptionApplications: Map<number, AdoptionApplication>;
  private appointments: Map<number, Appointment>;
  private testimonials: Map<number, Testimonial>;
  private contactMessages: Map<number, ContactMessage>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  public sessionStore: Store;

  private userCurrentId: number;
  private petCurrentId: number;
  private shelterCurrentId: number;
  private applicationCurrentId: number;
  private appointmentCurrentId: number;
  private testimonialCurrentId: number;
  private messageCurrentId: number;
  private subscriptionCurrentId: number;

  constructor() {
    // Create in-memory session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.pets = new Map();
    this.shelters = new Map();
    this.adoptionApplications = new Map();
    this.appointments = new Map();
    this.testimonials = new Map();
    this.contactMessages = new Map();
    this.newsletterSubscriptions = new Map();

    this.userCurrentId = 1;
    this.petCurrentId = 1;
    this.shelterCurrentId = 1;
    this.applicationCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.testimonialCurrentId = 1;
    this.messageCurrentId = 1;
    this.subscriptionCurrentId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      // Ensure name and email are properly formatted as string | null
      name: insertUser.name || null,
      email: insertUser.email || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Pet methods
  async getAllPets(filter?: PetFilter): Promise<Pet[]> {
    let pets = Array.from(this.pets.values());
    
    if (filter) {
      if (filter.species) {
        pets = pets.filter(pet => pet.species === filter.species);
      }
      
      if (filter.size) {
        pets = pets.filter(pet => pet.size === filter.size);
      }
      
      if (filter.age !== undefined) {
        pets = pets.filter(pet => pet.age === filter.age);
      }
    }
    
    return pets;
  }

  async getPet(id: number): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async getPetsByShelter(shelterId: number): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(
      pet => pet.shelterId === shelterId
    );
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = this.petCurrentId++;
    // Ensure status is set to "Available" if not provided
    const pet: Pet = { 
      ...insertPet, 
      id,
      status: insertPet.status || "Available"
    };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePetStatus(id: number, status: string): Promise<Pet | undefined> {
    const pet = this.pets.get(id);
    if (pet) {
      const updatedPet = { ...pet, status };
      this.pets.set(id, updatedPet);
      return updatedPet;
    }
    return undefined;
  }

  // Shelter methods
  async getAllShelters(): Promise<Shelter[]> {
    return Array.from(this.shelters.values());
  }

  async getShelter(id: number): Promise<Shelter | undefined> {
    return this.shelters.get(id);
  }

  async createShelter(insertShelter: InsertShelter): Promise<Shelter> {
    const id = this.shelterCurrentId++;
    const petCount = Array.from(this.pets.values()).filter(pet => pet.shelterId === id).length;
    const shelter: Shelter = { ...insertShelter, id, petsCount: petCount };
    this.shelters.set(id, shelter);
    return shelter;
  }

  // Adoption application methods
  async getAdoptionApplicationsByPet(petId: number): Promise<AdoptionApplication[]> {
    return Array.from(this.adoptionApplications.values()).filter(
      application => application.petId === petId
    );
  }

  async createAdoptionApplication(insertApplication: InsertAdoptionApplication): Promise<AdoptionApplication> {
    const id = this.applicationCurrentId++;
    const application: AdoptionApplication = { 
      ...insertApplication, 
      id, 
      status: 'Pending',
      userId: insertApplication.userId || null, 
      submittedAt: new Date() 
    };
    this.adoptionApplications.set(id, application);
    return application;
  }

  // Appointment methods
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    
    // Ensure date is properly formatted as Date object
    const parsedDate = insertAppointment.date instanceof Date ? 
      insertAppointment.date : 
      new Date(insertAppointment.date as unknown as string);
      
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      status: 'Scheduled',
      // Convert undefined notes to null
      notes: insertAppointment.notes || null,
      // Ensure date is properly set
      date: parsedDate,
      createdAt: new Date()
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.userId === userId
    );
  }

  async getAppointmentsByPet(petId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.petId === petId
    );
  }

  async getAppointmentsByShelter(shelterId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.shelterId === shelterId
    );
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      const updatedAppointment = { ...appointment, status };
      this.appointments.set(id, updatedAppointment);
      return updatedAppointment;
    }
    return undefined;
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialCurrentId++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Contact message methods
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.messageCurrentId++;
    const message: ContactMessage = { ...insertMessage, id, submittedAt: new Date() };
    this.contactMessages.set(id, message);
    return message;
  }

  // Newsletter subscription methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = this.subscriptionCurrentId++;
    const subscription: NewsletterSubscription = { 
      ...insertSubscription, 
      id, 
      // Ensure name is properly formatted as string | null
      name: insertSubscription.name || null,
      subscribedAt: new Date() 
    };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }

  // Initialize with sample data
  private initializeData() {
    // Sample shelters
    const shelter1: Shelter = {
      id: this.shelterCurrentId++,
      name: "Happy Tails Rescue",
      description: "Specializing in rescuing and rehabilitating dogs and cats from high-kill shelters.",
      address: "123 Rescue Lane",
      city: "San Francisco",
      state: "CA",
      phone: "(555) 123-4567",
      email: "info@happytails.com",
      imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80",
      petsCount: 0
    };

    const shelter2: Shelter = {
      id: this.shelterCurrentId++,
      name: "Furry Friends Foundation",
      description: "Dedicated to rescuing abandoned and neglected animals of all types.",
      address: "456 Pet Blvd",
      city: "Austin",
      state: "TX",
      phone: "(555) 987-6543",
      email: "contact@furryfriends.org",
      imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1886&q=80",
      petsCount: 0
    };

    const shelter3: Shelter = {
      id: this.shelterCurrentId++,
      name: "Second Chance Animal Sanctuary",
      description: "Providing care and rehabilitation for abused and abandoned animals.",
      address: "789 Hope Street",
      city: "Portland",
      state: "OR",
      phone: "(555) 456-7890",
      email: "help@secondchancesanctuary.org",
      imageUrl: "https://images.unsplash.com/photo-1536489885071-87983c3e2859?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1931&q=80",
      petsCount: 0
    };

    this.shelters.set(shelter1.id, shelter1);
    this.shelters.set(shelter2.id, shelter2);
    this.shelters.set(shelter3.id, shelter3);

    // Sample pets
    const pet1: Pet = {
      id: this.petCurrentId++,
      name: "Max",
      species: "Dog",
      breed: "Golden Retriever",
      age: 2,
      size: "Large",
      gender: "Male",
      description: "Friendly Golden Retriever who loves to play fetch and cuddle.",
      imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      shelterId: shelter1.id,
      status: "Available"
    };

    const pet2: Pet = {
      id: this.petCurrentId++,
      name: "Luna",
      species: "Cat",
      breed: "Tabby",
      age: 1,
      size: "Medium",
      gender: "Female",
      description: "Playful tabby cat who loves attention and window watching.",
      imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
      shelterId: shelter1.id,
      status: "Available"
    };

    const pet3: Pet = {
      id: this.petCurrentId++,
      name: "Cooper",
      species: "Dog",
      breed: "Border Collie",
      age: 3,
      size: "Medium",
      gender: "Male",
      description: "Intelligent Border Collie who needs an active family.",
      imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80",
      shelterId: shelter2.id,
      status: "Available"
    };

    const pet4: Pet = {
      id: this.petCurrentId++,
      name: "Bella",
      species: "Cat",
      breed: "Siamese",
      age: 2,
      size: "Medium",
      gender: "Female",
      description: "Elegant Siamese cat who loves to chat and be the center of attention.",
      imageUrl: "https://images.unsplash.com/photo-1598935888738-cd2a3c5845d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1980&q=80",
      shelterId: shelter2.id,
      status: "Available"
    };

    const pet5: Pet = {
      id: this.petCurrentId++,
      name: "Charlie",
      species: "Dog",
      breed: "Beagle",
      age: 1,
      size: "Small",
      gender: "Male",
      description: "Curious Beagle puppy who loves to explore and play with toys.",
      imageUrl: "https://images.unsplash.com/photo-1550414485-9f21a1b1f81c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1970&q=80",
      shelterId: shelter3.id,
      status: "Available"
    };

    const pet6: Pet = {
      id: this.petCurrentId++,
      name: "Oliver",
      species: "Cat",
      breed: "Maine Coon",
      age: 3,
      size: "Large",
      gender: "Male",
      description: "Majestic Maine Coon who is gentle and loves to be brushed.",
      imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1980&q=80",
      shelterId: shelter3.id,
      status: "Available"
    };

    const pet7: Pet = {
      id: this.petCurrentId++,
      name: "Daisy",
      species: "Dog",
      breed: "Pomeranian",
      age: 2,
      size: "Small",
      gender: "Female",
      description: "Fluffy Pomeranian with a big personality and lots of energy.",
      imageUrl: "https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      shelterId: shelter1.id,
      status: "Available"
    };

    const pet8: Pet = {
      id: this.petCurrentId++,
      name: "Leo",
      species: "Cat",
      breed: "Bengal",
      age: 1,
      size: "Medium",
      gender: "Male",
      description: "Playful Bengal cat with stunning markings who loves to climb.",
      imageUrl: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1780&q=80",
      shelterId: shelter2.id,
      status: "Available"
    };

    this.pets.set(pet1.id, pet1);
    this.pets.set(pet2.id, pet2);
    this.pets.set(pet3.id, pet3);
    this.pets.set(pet4.id, pet4);
    this.pets.set(pet5.id, pet5);
    this.pets.set(pet6.id, pet6);
    this.pets.set(pet7.id, pet7);
    this.pets.set(pet8.id, pet8);

    // Update pet counts in shelters
    const shelter1Pets = Array.from(this.pets.values()).filter(pet => pet.shelterId === shelter1.id).length;
    const shelter2Pets = Array.from(this.pets.values()).filter(pet => pet.shelterId === shelter2.id).length;
    const shelter3Pets = Array.from(this.pets.values()).filter(pet => pet.shelterId === shelter3.id).length;

    this.shelters.set(shelter1.id, { ...shelter1, petsCount: shelter1Pets });
    this.shelters.set(shelter2.id, { ...shelter2, petsCount: shelter2Pets });
    this.shelters.set(shelter3.id, { ...shelter3, petsCount: shelter3Pets });

    // Sample testimonials
    const testimonial1: Testimonial = {
      id: this.testimonialCurrentId++,
      name: "Emily",
      petName: "Max",
      adoptedDuration: "1 year ago",
      content: "Adopting Max through PetAdopt was the best decision we ever made. The process was seamless, and we found our perfect match. He's brought so much joy to our family!",
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1607975218223-94e82a731cf7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
    };

    const testimonial2: Testimonial = {
      id: this.testimonialCurrentId++,
      name: "James",
      petName: "Luna",
      adoptedDuration: "8 months ago",
      content: "Luna has been the perfect addition to our home. The detailed profile on PetAdopt helped us find a cat that matches our lifestyle perfectly. The support from the team was amazing!",
      rating: 5,
      imageUrl: "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    };

    const testimonial3: Testimonial = {
      id: this.testimonialCurrentId++,
      name: "The Williams Family",
      petName: "Cooper",
      adoptedDuration: "6 months ago",
      content: "Our children had been asking for a dog for years, and finding Cooper on PetAdopt was meant to be. The adoption process was straightforward, and we received great advice on helping him settle in.",
      rating: 4.5,
      imageUrl: "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    };

    this.testimonials.set(testimonial1.id, testimonial1);
    this.testimonials.set(testimonial2.id, testimonial2);
    this.testimonials.set(testimonial3.id, testimonial3);
  }
}

// For development and testing, use in-memory storage
export const storage = new MemStorage();

// For production, use database storage
// import { DatabaseStorage } from "./databaseStorage";
// export const storage = new DatabaseStorage();
