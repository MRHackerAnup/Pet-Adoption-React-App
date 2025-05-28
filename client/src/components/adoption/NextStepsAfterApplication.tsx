import { useParams, Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, CreditCard, DollarSign, ArrowRight } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';

export function NextStepsAfterApplication() {
  const { id } = useParams();
  const petId = parseInt(id || "0");
  const { user } = useAuth();
  
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="font-poppins font-bold text-3xl text-dark mb-4">Application Received!</h1>
              <p className="font-opensans text-gray-600 mb-4">
                Thank you for applying to adopt. Your application is being reviewed by our team.
              </p>
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Application Status: Under Review</span>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="nextSteps">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nextSteps">Next Steps</TabsTrigger>
                <TabsTrigger value="schedule">Schedule a Visit</TabsTrigger>
                <TabsTrigger value="payment">Proceed to Payment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nextSteps" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What happens next?</CardTitle>
                    <CardDescription>Here's what you can expect after submitting your application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="bg-primary bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-primary font-medium">1</span>
                        </div>
                        <div>
                          <h3 className="font-poppins font-medium text-dark">Application Review</h3>
                          <p className="text-sm text-gray-600">Our team will review your application within 2-3 business days.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="bg-primary bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-primary font-medium">2</span>
                        </div>
                        <div>
                          <h3 className="font-poppins font-medium text-dark">Schedule a Meet & Greet</h3>
                          <p className="text-sm text-gray-600">If your application is approved, you can schedule a time to meet the pet.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="bg-primary bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-primary font-medium">3</span>
                        </div>
                        <div>
                          <h3 className="font-poppins font-medium text-dark">Adoption Fee Payment</h3>
                          <p className="text-sm text-gray-600">If all goes well, you'll pay the adoption fee to complete the process.</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="bg-primary bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-primary font-medium">4</span>
                        </div>
                        <div>
                          <h3 className="font-poppins font-medium text-dark">Welcome Home!</h3>
                          <p className="text-sm text-gray-600">Take your new family member home and start your journey together.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Link href={`/pets/${petId}`}>Back to Pet Details</Link>
                    </Button>
                    <Button>
                      <Link href="/my-appointments">View My Appointments</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="schedule" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule a Visit</CardTitle>
                    <CardDescription>Meet this pet in person before making your final decision</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>While your application is being reviewed, you can schedule a visit to meet the pet in person. 
                        This is a great opportunity to see if you and the pet are a good match.</p>
                        
                      <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span>Scheduling a visit doesn't guarantee application approval, but it can help the process.</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Link href={`/pets/${petId}`}>Schedule a Visit</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="payment" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Adoption Payment</CardTitle>
                    <CardDescription>Complete the adoption process with a secure payment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>After your application has been approved and you've met the pet, you can proceed with the adoption fee payment to complete the process.</p>
                      
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <CreditCard className="h-5 w-5 mr-2 text-gray-700" />
                          <span className="font-semibold text-gray-700">Adoption Fee Details</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span>Base Adoption Fee</span>
                            <span>₹2,500</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Medical Checkup & Vaccinations</span>
                            <span>₹1,500</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Microchipping</span>
                            <span>₹500</span>
                          </li>
                          <li className="flex justify-between font-semibold border-t border-gray-300 pt-2 mt-2">
                            <span>Total</span>
                            <span>₹4,500</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="flex items-center bg-blue-50 p-4 rounded-lg text-blue-700">
                        <DollarSign className="h-5 w-5 mr-2" />
                        <span>Payment is only required after your application has been approved.</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled>
                      Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NextStepsAfterApplication;