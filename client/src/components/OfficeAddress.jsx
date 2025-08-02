import React from 'react';
import { MapPin } from 'lucide-react';

const OfficeAddress = () => {
  const headOfficeAddress = "Unit 1, Parliament Business Centre, Commerce Way, Liverpool, L8 7BL";
  return (
    <div className="bg-secondary dark:bg-slate-700 text-secondary-foreground dark:text-slate-300 py-3 text-center text-sm">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
        <span>Head Office: {headOfficeAddress}</span>
      </div>
    </div>
  );
};

export default OfficeAddress;