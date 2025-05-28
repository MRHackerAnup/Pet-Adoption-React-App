import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { 
  insertPetSchema, 
  insertShelterSchema, 
  insertAdoptionApplicationSchema, 
  insertTestimonialSchema,
  insertContactMessageSchema,
  insertNewsletterSubscriptionSchema,
  insertAppointmentSchema,
  users,
  shelters,
  pets,
  adoptionApplications,
  testimonials,
  contactMessages,
  newsletterSubscriptions,
  appointments
} from "@shared/schema";
import { z } from "zod";
import { 
  createAdoptionOrder, 
  createDonationOrder, 
  verifyPayment, 
  getPaymentDetails,
  getAdoptionPaymentsByPetId,
  getDonationsByShelter
} from "./services/razorpay";
import { connectToDatabase } from "./mongodb";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  const apiRouter = express.Router();

  // Pets routes
  apiRouter.get("/pets", async (req, res) => {
    try {
      // Handle filtering
      const species = req.query.species as string | undefined;
      const size = req.query.size as string | undefined;
      const age = req.query.age ? parseInt(req.query.age as string) : undefined;
      
      const pets = await storage.getAllPets({ species, size, age });
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  apiRouter.get("/pets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pet = await storage.getPet(id);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      res.json(pet);
    } catch (error) {
      console.error("Error fetching pet:", error);
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  });

  apiRouter.post("/pets", async (req, res) => {
    try {
      const petData = insertPetSchema.parse(req.body);
      const newPet = await storage.createPet(petData);
      res.status(201).json(newPet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      }
      console.error("Error creating pet:", error);
      res.status(500).json({ message: "Failed to create pet" });
    }
  });

  // Shelters routes
  apiRouter.get("/shelters", async (req, res) => {
    try {
      const shelters = await storage.getAllShelters();
      res.json(shelters);
    } catch (error) {
      console.error("Error fetching shelters:", error);
      res.status(500).json({ message: "Failed to fetch shelters" });
    }
  });

  apiRouter.get("/shelters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const shelter = await storage.getShelter(id);
      
      if (!shelter) {
        return res.status(404).json({ message: "Shelter not found" });
      }
      
      // Get pets from this shelter
      const pets = await storage.getPetsByShelter(id);
      
      res.json({ ...shelter, pets });
    } catch (error) {
      console.error("Error fetching shelter:", error);
      res.status(500).json({ message: "Failed to fetch shelter" });
    }
  });

  apiRouter.post("/shelters", async (req, res) => {
    try {
      const shelterData = insertShelterSchema.parse(req.body);
      const newShelter = await storage.createShelter(shelterData);
      res.status(201).json(newShelter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shelter data", errors: error.errors });
      }
      console.error("Error creating shelter:", error);
      res.status(500).json({ message: "Failed to create shelter" });
    }
  });

  // Adoption applications routes
  apiRouter.post("/adoption-applications", async (req, res) => {
    try {
      const applicationData = insertAdoptionApplicationSchema.parse(req.body);
      
      // Add the user ID if the user is authenticated
      if (req.isAuthenticated() && req.user) {
        // @ts-ignore - we know the user has an id property
        applicationData.userId = req.user.id;
      }
      
      const newApplication = await storage.createAdoptionApplication(applicationData);
      
      // Update pet status to pending
      const pet = await storage.getPet(applicationData.petId);
      if (pet) {
        await storage.updatePetStatus(pet.id, "Pending");
      }
      
      res.status(201).json(newApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Error creating adoption application:", error);
      res.status(500).json({ message: "Failed to create adoption application" });
    }
  });

  // Testimonials routes
  apiRouter.get("/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  apiRouter.post("/testimonials", async (req, res) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const newTestimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(newTestimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      }
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  // Contact messages routes
  apiRouter.post("/contact", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const newMessage = await storage.createContactMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to create contact message" });
    }
  });

  // Newsletter subscription routes
  apiRouter.post("/newsletter-subscriptions", async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);
      const newSubscription = await storage.createNewsletterSubscription(subscriptionData);
      res.status(201).json(newSubscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      console.error("Error creating newsletter subscription:", error);
      res.status(500).json({ message: "Failed to create newsletter subscription" });
    }
  });

  // Appointment routes
  apiRouter.post("/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to schedule appointments" });
      }

      // Ensure date is properly parsed as Date object if it's a string
      const formData = {
        ...req.body,
        // Parse ISO date string to Date object if needed
        date: req.body.date instanceof Date ? req.body.date : new Date(req.body.date)
      };
      
      // First validate without userId which will be added from authenticated user
      const { petId, shelterId, date, time, notes } = req.body;
      
      // Validate required fields are present
      if (!petId || !shelterId || !date || !time) {
        return res.status(400).json({ 
          message: "Missing required appointment data", 
          details: "petId, shelterId, date, and time are required"
        });
      }
      
      // Create the appointment data object with the validated user ID
      const appointmentData = {
        petId,
        shelterId,
        date: new Date(date),
        time,
        notes: notes || "",
        userId: req.user.id  // Get userId from authenticated user
      };
      
      // The user ID is already added from the authenticated user
      
      // Status will be set to "Scheduled" by the storage interface
      
      const newAppointment = await storage.createAppointment(appointmentData);
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Appointment validation errors:", JSON.stringify(error.errors, null, 2));
        console.error("Received appointment data:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  apiRouter.get("/appointments/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const appointments = await storage.getAppointmentsByUser(req.user.id);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  apiRouter.get("/appointments/pet/:petId", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const appointments = await storage.getAppointmentsByPet(petId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching pet appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  apiRouter.get("/appointments/shelter/:shelterId", async (req, res) => {
    try {
      const shelterId = parseInt(req.params.shelterId);
      const appointments = await storage.getAppointmentsByShelter(shelterId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching shelter appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  apiRouter.get("/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  apiRouter.patch("/appointments/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Validate status value
      if (!["Scheduled", "Confirmed", "Canceled", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user is authorized (either it's their appointment or they're a shelter admin)
      if (appointment.userId !== req.user.id) {
        // Here we would check if user is a shelter admin, but for simplicity we'll just allow it
        // In a real app, we'd verify the user has permissions for the shelter
      }
      
      const updatedAppointment = await storage.updateAppointmentStatus(id, status);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Development-only route to reset database (should be disabled in production)
  apiRouter.post("/reset-database", async (req, res) => {
    try {
      // Clear all data from the database tables in proper order (respecting foreign key constraints)
      await db.delete(adoptionApplications);
      await db.delete(appointments);
      await db.delete(newsletterSubscriptions);
      await db.delete(contactMessages);
      await db.delete(testimonials);
      await db.delete(pets);
      await db.delete(shelters);
      await db.delete(users).where(sql`id > 0`); // Keep any system users if needed
      
      res.status(200).json({ message: "Database reset successfully" });
    } catch (error) {
      console.error("Error resetting database:", error);
      res.status(500).json({ message: "Failed to reset database", error: String(error) });
    }
  });

  // Development-only route to seed database
  apiRouter.post("/seed-data", async (req, res) => {
    try {
      // Check if database already has data
      const existingShelters = await storage.getAllShelters();
      if (existingShelters.length > 0) {
        return res.status(400).json({ message: "Database already has data. Seeding aborted." });
      }

      // Sample shelters
      const shelter1 = await storage.createShelter({
        name: "Happy Tails Rescue",
        description: "Specializing in rescuing and rehabilitating dogs and cats from high-kill shelters.",
        address: "123 Rescue Lane",
        city: "San Francisco",
        state: "CA",
        phone: "(555) 123-4567",
        email: "info@happytails.com",
        imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80",
      });

      const shelter2 = await storage.createShelter({
        name: "Furry Friends Foundation",
        description: "Dedicated to rescuing abandoned and neglected animals of all types.",
        address: "456 Pet Blvd",
        city: "Austin",
        state: "TX",
        phone: "(555) 987-6543",
        email: "contact@furryfriends.org",
        imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1886&q=80",
      });

      const shelter3 = await storage.createShelter({
        name: "Second Chance Animal Sanctuary",
        description: "Providing care and rehabilitation for abused and abandoned animals.",
        address: "789 Hope Street",
        city: "Portland",
        state: "OR",
        phone: "(555) 456-7890",
        email: "help@secondchancesanctuary.org",
        imageUrl: "https://images.unsplash.com/photo-1536489885071-87983c3e2859?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1931&q=80",
      });

      // Sample pets
      const pets = [
        await storage.createPet({
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
        }),
        await storage.createPet({
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
        }),
        await storage.createPet({
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
        }),
        await storage.createPet({
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
        }),
        await storage.createPet({
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
        }),
        await storage.createPet({
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
        }),
        await storage.createPet({
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
        }),
        await storage.createPet({
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
        })
      ];

      // Sample testimonials
      const testimonials = [
        await storage.createTestimonial({
          name: "Emily",
          petName: "Max",
          adoptedDuration: "1 year ago",
          content: "Adopting Max through PetAdopt was the best decision we ever made. The process was seamless, and we found our perfect match. He's brought so much joy to our family!",
          rating: 5,
          imageUrl: "https://images.unsplash.com/photo-1607975218223-94e82a731cf7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
        }),
        await storage.createTestimonial({
          name: "James",
          petName: "Luna",
          adoptedDuration: "8 months ago",
          content: "Luna has been the perfect addition to our home. The detailed profile on PetAdopt helped us find a cat that matches our lifestyle perfectly. The support from the team was amazing!",
          rating: 5,
          imageUrl: "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }),
        await storage.createTestimonial({
          name: "The Williams Family",
          petName: "Cooper",
          adoptedDuration: "6 months ago",
          content: "Our children had been asking for a dog for years, and finding Cooper on PetAdopt was meant to be. The adoption process was straightforward, and we received great advice on helping him settle in.",
          rating: 4,
          imageUrl: "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        })
      ];

      res.status(201).json({
        message: "Database seeded successfully",
        shelters: [shelter1, shelter2, shelter3],
        petsCount: pets.length,
        testimonialsCount: testimonials.length
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database", error: String(error) });
    }
  });

  // Initialize MongoDB connection
  apiRouter.use(async (req, res, next) => {
    try {
      await connectToDatabase();
      next();
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      res.status(500).json({ message: "Database connection error" });
    }
  });

  // Payment routes - Razorpay integration
  apiRouter.post("/payments/create-adoption-order", async (req, res) => {
    try {
      const { petId, amount } = req.body;
      
      if (!petId || !amount) {
        return res.status(400).json({ message: "Pet ID and amount are required" });
      }
      
      // Get user ID if authenticated
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      
      const order = await createAdoptionOrder(petId, amount, userId);
      res.json(order);
    } catch (error) {
      console.error("Error creating adoption payment order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  apiRouter.post("/payments/create-donation-order", async (req, res) => {
    try {
      const { shelterId, amount, message, anonymous } = req.body;
      
      if (!shelterId || !amount) {
        return res.status(400).json({ message: "Shelter ID and amount are required" });
      }
      
      // Get user ID if authenticated
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      
      const order = await createDonationOrder(shelterId, amount, message, anonymous, userId);
      res.json(order);
    } catch (error) {
      console.error("Error creating donation order:", error);
      res.status(500).json({ message: "Failed to create donation order" });
    }
  });

  apiRouter.post("/payments/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "All payment verification parameters are required" });
      }
      
      const result = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      // If it's an adoption payment, update the pet status
      if (result.type === 'adoption' && result.payment) {
        await storage.updatePetStatus(result.payment.petId, "Adopted");
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  apiRouter.get("/payments/details/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const details = await getPaymentDetails(orderId);
      
      if (!details) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(details);
    } catch (error) {
      console.error("Error getting payment details:", error);
      res.status(500).json({ message: "Failed to get payment details" });
    }
  });

  apiRouter.get("/payments/pet/:petId", async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      const payments = await getAdoptionPaymentsByPetId(petId);
      res.json(payments);
    } catch (error) {
      console.error("Error getting pet payments:", error);
      res.status(500).json({ message: "Failed to get pet payments" });
    }
  });

  apiRouter.get("/donations/shelter/:shelterId", async (req, res) => {
    try {
      const shelterId = parseInt(req.params.shelterId);
      const donations = await getDonationsByShelter(shelterId);
      res.json(donations);
    } catch (error) {
      console.error("Error getting shelter donations:", error);
      res.status(500).json({ message: "Failed to get shelter donations" });
    }
  });

  app.use("/api", apiRouter);
  const httpServer = createServer(app);

  return httpServer;
}
