import { eq } from "drizzle-orm";
import { db } from "./db";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { Store } from "express-session";
import { pool } from "./db";
import {
  users,
  pets,
  shelters,
  adoptionApplications,
  testimonials,
  contactMessages,
  newsletterSubscriptions,
  appointments,
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
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

interface PetFilter {
  species?: string;
  size?: string;
  age?: number;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Pet methods
  async getAllPets(filter?: PetFilter): Promise<Pet[]> {
    let query = db.select().from(pets);
    
    if (filter) {
      if (filter.species) {
        query = query.where(eq(pets.species, filter.species));
      }
      if (filter.size) {
        query = query.where(eq(pets.size, filter.size));
      }
      if (filter.age !== undefined) {
        query = query.where(eq(pets.age, filter.age));
      }
    }
    
    return await query;
  }

  async getPet(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet;
  }

  async getPetsByShelter(shelterId: number): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.shelterId, shelterId));
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const [newPet] = await db.insert(pets).values(pet).returning();
    return newPet;
  }

  async updatePetStatus(id: number, status: string): Promise<Pet | undefined> {
    const [updatedPet] = await db
      .update(pets)
      .set({ status })
      .where(eq(pets.id, id))
      .returning();
    return updatedPet;
  }

  // Shelter methods
  async getAllShelters(): Promise<Shelter[]> {
    const shelterList = await db.select().from(shelters);
    
    // Add pet count to each shelter
    const sheltersWithPetsCount = await Promise.all(
      shelterList.map(async (shelter) => {
        const petCount = await db
          .select()
          .from(pets)
          .where(eq(pets.shelterId, shelter.id))
          .then(petsList => petsList.length);
        
        return {
          ...shelter,
          petsCount: petCount
        };
      })
    );
    
    return sheltersWithPetsCount;
  }

  async getShelter(id: number): Promise<Shelter | undefined> {
    const [shelter] = await db.select().from(shelters).where(eq(shelters.id, id));
    
    if (!shelter) return undefined;
    
    // Get pet count for the shelter
    const petCount = await db
      .select()
      .from(pets)
      .where(eq(pets.shelterId, id))
      .then(petsList => petsList.length);
    
    return {
      ...shelter,
      petsCount: petCount
    };
  }

  async createShelter(shelter: InsertShelter): Promise<Shelter> {
    const [newShelter] = await db.insert(shelters).values(shelter).returning();
    
    return {
      ...newShelter,
      petsCount: 0
    };
  }

  // Adoption application methods
  async getAdoptionApplicationsByPet(petId: number): Promise<AdoptionApplication[]> {
    return await db
      .select()
      .from(adoptionApplications)
      .where(eq(adoptionApplications.petId, petId));
  }

  async createAdoptionApplication(application: InsertAdoptionApplication): Promise<AdoptionApplication> {
    const [newApplication] = await db
      .insert(adoptionApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db
      .insert(testimonials)
      .values(testimonial)
      .returning();
    return newTestimonial;
  }

  // Contact message methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Newsletter subscription methods
  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [newSubscription] = await db
      .insert(newsletterSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  // Appointment methods
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    // Ensure date is properly handled
    const appointmentData = {
      ...appointment,
      // Parse date if needed
      date: appointment.date instanceof Date ? 
        appointment.date : 
        new Date(appointment.date as unknown as string)
    };
    
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return newAppointment;
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId));
  }

  async getAppointmentsByPet(petId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.petId, petId));
  }

  async getAppointmentsByShelter(shelterId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.shelterId, shelterId));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }
}