import { useState } from 'react';
import { RazorpayPaymentForm } from './RazorpayPaymentForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DonationFormProps {
  shelterId: number;
  shelterName: string;
}

export function DonationForm({ shelterId, shelterName }: DonationFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-poppins font-bold text-dark">Support Our Work</CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          Your donation helps us continue to care for animals in need and find them loving homes.
        </CardDescription>
      </CardHeader>
      
      <p className="mb-4 text-gray-700">
        {shelterName} relies on donations to provide food, shelter, medical care, and enrichment for our animals. 
        Every contribution makes a difference in the lives of pets waiting for their forever homes.
      </p>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Make a Donation
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <RazorpayPaymentForm 
            type="donation"
            itemId={shelterId}
            name={shelterName}
            minimumAmount={100}
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}