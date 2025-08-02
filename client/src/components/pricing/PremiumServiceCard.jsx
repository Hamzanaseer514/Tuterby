import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, ArrowRight, Sparkles, Users, Brain, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumServiceCard = ({ service }) => {
  const contentFeatures = service.features || [];
  const mentorshipFeatures = service.mentorshipFeatures || [];
  const discoverAriaLabel = `Discover full details for the ${service.name} programme on the Premium Programme page`;
  const ctaAriaLabel = `Enquire about the ${service.name} programme, starting at £${service.priceHourly}/hour, via contact form`;

  return (
    <Card className="w-full shadow-2xl hover:shadow-primary/40 dark:hover:shadow-primary/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-2 border-primary ring-4 ring-primary/20 dark:ring-primary/30 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-slate-800/30 dark:via-slate-900/50 dark:to-slate-800/30">
      <div className="md:flex">
        <div className="md:w-1/3 p-6 md:p-8 bg-primary/10 dark:bg-primary/20 flex flex-col justify-center items-center text-center md:text-left">
          <div className="p-4 bg-gradient-to-tr from-primary to-purple-600 rounded-xl shadow-lg mb-4 inline-block">
            {React.cloneElement(service.icon, { className: "w-16 h-16 text-primary-foreground"})}
          </div>
          <CardTitle className="text-2xl lg:text-3xl font-bold gradient-text mb-2">{service.name}</CardTitle>
          <p className="text-sm text-muted-foreground mb-3">{service.levelCategory}</p>
          <div>
            <span className="text-4xl lg:text-5xl font-bold text-foreground">£{service.priceHourly}</span>
            <span className="text-muted-foreground text-lg">/hour</span>
          </div>
           <p className="text-xs text-muted-foreground mt-1">(Starting rate)</p>
        </div>

        <div className="md:w-2/3 p-6 md:p-8">
          <CardDescription className="text-base text-muted-foreground mb-6">{service.description}</CardDescription>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <FileText className="w-5 h-5 text-secondary mr-2" /> Content Creation Features
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {contentFeatures.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-1" />
                    {feature}
                  </li>
                ))}
                {contentFeatures.length > 5 && (
                   <li className="text-xs italic">+ {contentFeatures.length - 5} more...</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Users className="w-5 h-5 text-secondary mr-2" /> Mentorship Support
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {mentorshipFeatures.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2 shrink-0 mt-1" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <Button size="lg" className="w-full group btn-secondary-hover text-base py-6" asChild>
                <Link to="/premium-programme" aria-label={discoverAriaLabel}>
                Discover the Full Programme <ExternalLink className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-0" />
                </Link>
            </Button>
            <Button size="lg" className="w-full group btn-primary-hover text-base py-6" asChild>
                <Link 
                  to="/contact" 
                  state={{ selectedPackage: service.name, price: service.priceHourly, type: service.type }}
                  aria-label={ctaAriaLabel}
                >
                {service.cta} <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PremiumServiceCard;