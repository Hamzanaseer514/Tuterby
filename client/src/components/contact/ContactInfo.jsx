import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Mail, Phone, MessageSquare } from 'lucide-react';
    import { cn } from '@/lib/utils';

    const ContactInfo = ({ className }) => {
      const whatsAppNumber = "07466436417";
      const whatsAppURL = `https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=Hello%20TutorNearby,%20I'd%20like%20to%20make%20an%20enquiry.`;

      return (
        <Card className={cn("shadow-lg border bg-card", className)}>
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
            <CardDescription>Reach out to us directly through these channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-md">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <p className="font-semibold">Email Us</p>
                <a href="mailto:info@tutornearby.co.uk" className="text-primary hover:underline">info@tutornearby.co.uk</a>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-md">
              <Phone className="h-6 w-6 text-primary mt-1" />
              <div>
                <p className="font-semibold">Call Us / WhatsApp</p>
                 <a href={whatsAppURL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{whatsAppNumber}</a>
              </div>
            </div>
            <div className="mt-6">
               <Button variant="outline" className="w-full" asChild>
                  <a href={whatsAppURL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                     <MessageSquare className="w-5 h-5 mr-2" /> Chat on WhatsApp
                  </a>
               </Button>
            </div>
            {/* <div className="pt-4">
              <p className="text-sm text-muted-foreground">We aim to respond to all enquiries within 24 business hours.</p>
              <p className="text-sm text-muted-foreground mt-2">For in-person tutoring requests, please provide your postcode in the message so we can check local availability.</p>
            </div> */}
          </CardContent>
        </Card>
      );
    };

    export default ContactInfo;