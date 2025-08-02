import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingCard = ({ tier, popular }) => {
  const featuresList = tier.features || [];
  const mentorshipFeaturesList = tier.mentorshipFeatures || [];
  const ctaAriaLabel = `Enquire about the ${tier.name} plan at £${tier.priceHourly ? tier.priceHourly + '/hour' : tier.priceMonthly ? tier.priceMonthly + '/month' : tier.priceCustom} via contact form`;

  return (
    <Card className={`flex flex-col w-full h-full shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${popular ? 'border-2 border-primary ring-4 ring-primary/20 dark:ring-primary/30' : 'border-border'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
            {tier.icon}
          </div>
          {popular && (
            <span className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">MOST POPULAR</span>
          )}
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground">{tier.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground min-h-[40px] md:min-h-[60px]">{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          {tier.priceHourly ? (
            <>
              <span className="text-5xl font-bold text-foreground">£{tier.priceHourly}</span>
              <span className="text-muted-foreground text-lg">/hour</span>
            </>
          ) : tier.priceMonthly ? (
            <>
              <span className="text-5xl font-bold text-foreground">£{tier.priceMonthly}</span>
              <span className="text-muted-foreground text-lg">/month</span>
            </>
          ) : (
            <span className="text-4xl font-bold text-primary">{tier.priceCustom}</span>
          )}
        </div>
        <p className="text-sm font-medium text-primary mb-3">{tier.levelCategory} Focus</p>
        
        {featuresList.length > 0 && (
          <>
            { mentorshipFeaturesList.length > 0 && <p className="text-xs font-semibold text-muted-foreground mt-4 mb-1 uppercase">Content Creation Features:</p>}
            <ul className="space-y-2 text-sm text-foreground">
              {featuresList.slice(0, tier.name === "CONTENT ON DEMAND & Mentorship Programme" ? 5 : featuresList.length).map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-1" />
                  {feature}
                </li>
              ))}
              {tier.name === "CONTENT ON DEMAND & Mentorship Programme" && featuresList.length > 5 && (
                <li className="text-xs text-muted-foreground italic">+ {featuresList.length - 5} more content features...</li>
              )}
            </ul>
          </>
        )}

        {mentorshipFeaturesList.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground mt-4 mb-1 uppercase">Mentorship Support:</p>
            <ul className="space-y-2 text-sm text-foreground">
              {mentorshipFeaturesList.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2 shrink-0 mt-1" />
                  {feature}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-6">
        <Button size="lg" className="w-full group btn-primary-hover text-base py-6" asChild>
          <Link 
            to="/contact" 
            state={{ selectedPackage: tier.name, price: tier.priceHourly || tier.priceMonthly || tier.priceCustom, type: tier.type }}
            aria-label={ctaAriaLabel}
          >
            {tier.cta} <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;