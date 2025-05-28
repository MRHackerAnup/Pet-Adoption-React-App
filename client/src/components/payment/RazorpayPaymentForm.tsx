import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentFormProps {
  type: 'adoption' | 'donation';
  itemId: number;
  name: string;
  amount?: number;
  minimumAmount?: number;
  onSuccess?: (response: any) => void;
  onFailure?: (error: any) => void;
}

/**
 * RazorpayPaymentForm - A reusable component for handling payments via Razorpay
 */
export function RazorpayPaymentForm({ 
  type, 
  itemId, 
  name, 
  amount, 
  minimumAmount = 100,
  onSuccess,
  onFailure
}: PaymentFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentAmount, setPaymentAmount] = useState<number>(amount || minimumAmount);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (paymentAmount < minimumAmount) {
      toast({
        title: 'Invalid amount',
        description: `Amount must be at least ${minimumAmount}`,
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create an order based on payment type
      const endpoint = type === 'adoption' 
        ? '/api/payments/create-adoption-order' 
        : '/api/payments/create-donation-order';

      const paymentData = type === 'adoption' 
        ? { petId: itemId, amount: paymentAmount }
        : { shelterId: itemId, amount: paymentAmount, message, anonymous };

      const response = await apiRequest('POST', endpoint, paymentData);
      const orderData = await response.json();

      if (!orderData.id) {
        throw new Error('Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PetAdopt',
        description: `Payment for ${type === 'adoption' ? 'adopting' : 'donating to'} ${name}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment on the server
            const verifyRes = await apiRequest('POST', '/api/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast({
                title: 'Payment Successful',
                description: `Your ${type} payment was processed successfully!`,
              });

              if (onSuccess) {
                onSuccess(verifyData);
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: 'We could not verify your payment. Please contact support.',
              variant: 'destructive'
            });

            if (onFailure) {
              onFailure(error);
            }
          }
        },
        prefill: user ? {
          name: user.name || user.username,
          email: user.email,
        } : undefined,
        theme: {
          color: '#4f46e5',
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Unable to process your payment. Please try again later.',
        variant: 'destructive'
      });

      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{type === 'adoption' ? 'Adoption Fee' : 'Make a Donation'}</CardTitle>
        <CardDescription>
          {type === 'adoption' 
            ? `Pay the adoption fee for ${name}`
            : `Support ${name} with your contribution`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            min={minimumAmount}
            required
          />
          <p className="text-xs text-muted-foreground">
            Minimum amount: ₹{minimumAmount}
          </p>
        </div>

        {type === 'donation' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message with your donation"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="anonymous" className="text-sm font-normal">
                Make this donation anonymous
              </Label>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handlePayment} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${paymentAmount}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}