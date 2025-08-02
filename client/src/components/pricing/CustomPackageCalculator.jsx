import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomPackageCalculator = () => {
  const [hours, setHours] = useState([10]); 
  const baseCustomHourlyRate = 35; 
  const customPackagePrice = hours[0] * baseCustomHourlyRate;

  const whatsAppNumber = "07466436417";
  const whatsAppMessage = `Hello TutorNearby, I'm interested in discussing a custom tutoring package for approximately ${hours[0]} hours per month. My budget is around £${customPackagePrice}. Could we explore options?`;
  const encodedWhatsAppMessage = encodeURIComponent(whatsAppMessage);
  const whatsAppURL = `https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=${encodedWhatsAppMessage}`;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-slate-800/30 dark:via-slate-900/50 dark:to-slate-800/30 p-8 md:p-12 rounded-xl shadow-2xl border border-border glassmorphism">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">Craft Your Perfect Learning Plan</h2>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Need something more specific? Adjust the hours below. Our standard custom rate starts from £{baseCustomHourlyRate}/hour, varying by level and tutor.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium text-foreground">Estimated Hours per Month:</span>
            <span className="text-2xl font-bold text-primary">{hours[0]} hours</span>
          </div>
          <Slider
            defaultValue={hours}
            onValueChange={setHours}
            max={50}
            step={1}
            className="w-full"
            aria-label={`Slider to estimate hours per month for a custom package, current estimate ${hours[0]} hours`}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 hour</span>
            <span>50 hours</span>
          </div>
        </div>

        <div className="text-center bg-muted/30 dark:bg-slate-700/20 p-6 rounded-lg mb-8 border border-border/50">
          <p className="text-lg text-foreground mb-1">Estimated Monthly Cost (from):</p>
          <p className="text-4xl font-bold text-primary">£{customPackagePrice}</p>
          <p className="text-xs text-muted-foreground mt-1">Final price depends on subject level and tutor selection.</p>
        </div>

        <Button size="lg" className="w-full group btn-secondary-hover text-lg py-7" asChild>
          <a href={whatsAppURL} target="_blank" rel="noopener noreferrer" aria-label={`Discuss a custom tutoring package of approximately ${hours[0]} hours at around £${customPackagePrice} on WhatsApp`}>
            <MessageCircle className="w-6 h-6 mr-3" /> Discuss on WhatsApp
          </a>
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Or <Link to="/contact" state={{ customHours: hours[0], customPrice: customPackagePrice, type: 'custom' }} className="text-primary hover:underline font-medium" aria-label={`Send a detailed enquiry for a custom tutoring package of approximately ${hours[0]} hours at around £${customPackagePrice} via our contact form`}>send us a detailed enquiry via our contact form</Link>.
        </p>
      </div>
    </div>
  );
};

export default CustomPackageCalculator;