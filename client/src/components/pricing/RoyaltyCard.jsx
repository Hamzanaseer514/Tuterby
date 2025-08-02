import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Zap, Percent, ArrowRight, Sparkles, BookCheck, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const RoyaltyCard = ({ plan }) => {
  const ctaAriaLabel = `Enquire about the ${plan.name} royalty card at £${plan.price} per month via contact form`;
  return (
    <Card className={`flex flex-col w-full shadow-2xl hover:shadow-primary/40 dark:hover:shadow-primary/50 transition-all duration-300 ease-in-out transform hover:-translate-y-2 overflow-hidden border-2 ${plan.borderColor} bg-card`}>
      <CardHeader className={`p-6 text-white ${plan.gradientFrom} ${plan.gradientTo} bg-gradient-to-br`}>
        <div className="flex items-center justify-between mb-3">
          {React.cloneElement(plan.icon, { className: "w-12 h-12" })}
          {plan.kids && <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">{plan.kids}</span>}
          {plan.level === "Undergraduate" && <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">Undergraduate Focus</span> }
        </div>
        <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-white/90 text-sm min-h-[40px] md:min-h-[60px]">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-6 space-y-6">
        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-foreground">£{plan.price}</p>
          <p className="text-muted-foreground text-sm">per month {plan.level === "Undergraduate" ? " (per student)" : ""}</p>
        </div>
        
        <div className="space-y-3">
          {plan.kids && (
            <div className="flex items-center text-foreground">
              <Users className="w-5 h-5 text-primary mr-3 shrink-0" />
              <span>{plan.kids} - {plan.levelDisplayName || plan.level}</span>
            </div>
          )}
          <div className="flex items-center text-foreground">
            <Zap className="w-5 h-5 text-primary mr-3 shrink-0" />
            <span>Up to {plan.hoursPerStudent} hours {plan.level === "Undergraduate" ? "" : "per student "}/month</span>
          </div>
           <div className="flex items-center text-foreground">
            <BookCheck className="w-5 h-5 text-primary mr-3 shrink-0" />
            <span>Covers up to {plan.subjectsPerStudent || plan.modulesCovered} {plan.level === "Undergraduate" ? "modules" : "subjects/modules per student"}</span>
          </div>
          {plan.savings && (
            <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
              <Percent className="w-5 h-5 mr-3 shrink-0" />
              <span>Save {plan.savings} vs. standard rates!</span>
            </div>
          )}
        </div>

        <div className="min-h-[180px] md:min-h-[220px]">
          <h4 className="font-semibold text-foreground mb-2 mt-4">Key Benefits:</h4>
          <ul className="space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start text-sm text-muted-foreground">
                <Brain className="w-4 h-4 text-secondary mr-2 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-6 bg-muted/30 dark:bg-slate-800/20 mt-auto">
        <Button size="lg" className="w-full group btn-primary-hover text-base py-6" asChild>
          <Link 
            to="/contact" 
            state={{ selectedPackage: plan.name, price: plan.price, type: plan.type || 'family_royalty' }}
            aria-label={ctaAriaLabel}
          >
            Enquire for {plan.name} <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoyaltyCard;