import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment, Donation } from '../models/payment';
import { connectToDatabase } from '../mongodb';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Create an adoption payment order
 */
export async function createAdoptionOrder(petId: number, amount: number, userId?: number) {
  try {
    await connectToDatabase();
    
    // Generate a unique receipt ID
    const receipt = `adoption_${petId}_${Date.now()}`;
    
    // Create an order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt,
      notes: {
        petId: petId.toString(),
        userId: userId ? userId.toString() : 'guest',
        type: 'adoption'
      }
    }) as RazorpayOrder;
    
    // Save the order details in MongoDB
    const payment = new Payment({
      userId,
      petId,
      orderId: order.id,
      amount,
      currency: 'INR',
      status: 'created',
      receipt,
      notes: {
        type: 'adoption'
      }
    });
    
    await payment.save();
    
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key: process.env.RAZORPAY_KEY_ID
    };
  } catch (error) {
    console.error('Error creating adoption order:', error);
    throw error;
  }
}

/**
 * Create a donation order
 */
export async function createDonationOrder(
  shelterId: number, 
  amount: number, 
  message?: string, 
  anonymous: boolean = false,
  userId?: number
) {
  try {
    await connectToDatabase();
    
    // Generate a unique receipt ID
    const receipt = `donation_${shelterId}_${Date.now()}`;
    
    // Create an order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt,
      notes: {
        shelterId: shelterId.toString(),
        userId: userId ? userId.toString() : 'guest',
        type: 'donation',
        anonymous: anonymous ? 'true' : 'false'
      }
    }) as RazorpayOrder;
    
    // Save the order details in MongoDB
    const donation = new Donation({
      userId,
      shelterId,
      orderId: order.id,
      amount,
      currency: 'INR',
      status: 'created',
      receipt,
      message,
      anonymous,
      notes: {
        type: 'donation'
      }
    });
    
    await donation.save();
    
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key: process.env.RAZORPAY_KEY_ID
    };
  } catch (error) {
    console.error('Error creating donation order:', error);
    throw error;
  }
}

/**
 * Verify and capture payment
 */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
) {
  try {
    await connectToDatabase();
    
    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + "|" + paymentId)
      .digest('hex');
    
    if (generated_signature !== signature) {
      throw new Error('Invalid payment signature');
    }
    
    // Update payment status in database
    let payment = await Payment.findOne({ orderId });
    if (payment) {
      payment.paymentId = paymentId;
      payment.status = 'captured';
      await payment.save();
      
      return { 
        success: true, 
        type: 'adoption',
        payment 
      };
    }
    
    // Check if it's a donation
    let donation = await Donation.findOne({ orderId });
    if (donation) {
      donation.paymentId = paymentId;
      donation.status = 'captured';
      await donation.save();
      
      return { 
        success: true, 
        type: 'donation',
        donation 
      };
    }
    
    throw new Error('Order not found');
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Get payment details
 */
export async function getPaymentDetails(orderId: string) {
  try {
    await connectToDatabase();
    
    const payment = await Payment.findOne({ orderId });
    if (payment) {
      return { type: 'adoption', data: payment };
    }
    
    const donation = await Donation.findOne({ orderId });
    if (donation) {
      return { type: 'donation', data: donation };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw error;
  }
}

/**
 * Get adoption payments by pet ID
 */
export async function getAdoptionPaymentsByPetId(petId: number) {
  try {
    await connectToDatabase();
    
    const payments = await Payment.find({ 
      petId,
      status: 'captured' 
    }).sort({ createdAt: -1 });
    
    return payments;
  } catch (error) {
    console.error('Error getting pet payments:', error);
    throw error;
  }
}

/**
 * Get donations by shelter ID
 */
export async function getDonationsByShelter(shelterId: number) {
  try {
    await connectToDatabase();
    
    const donations = await Donation.find({ 
      shelterId,
      status: 'captured' 
    }).sort({ createdAt: -1 });
    
    return donations;
  } catch (error) {
    console.error('Error getting shelter donations:', error);
    throw error;
  }
}