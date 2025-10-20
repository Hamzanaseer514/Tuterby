import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MailWarning, ListChecks, UserCircle, CalendarDays, FileText, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const ComplaintsInfo = ({ className }) => {
  const complaintChecklist = [
    { icon: <UserCircle className="w-4 h-4 mr-2 text-primary" />, text: "Your Full Name & Contact Email" },
    { icon: <UserCircle className="w-4 h-4 mr-2 text-primary" />, text: "Student's Name (if applicable)" },
    { icon: <CalendarDays className="w-4 h-4 mr-2 text-primary" />, text: "Date(s) of Incident/Issue" },
    { icon: <FileText className="w-4 h-4 mr-2 text-primary" />, text: "Clear and Detailed Description of the Complaint" },
    { icon: <Target className="w-4 h-4 mr-2 text-primary" />, text: "Any Supporting Evidence (e.g., screenshots, correspondence)" },
    { icon: <Target className="w-4 h-4 mr-2 text-primary" />, text: "Your Desired Outcome or Resolution" },
  ];

  return (
    <Card className={cn("shadow-lg border bg-card", className)}>
      <CardHeader>
        <div className="flex items-center mb-2">
          <MailWarning className="h-8 w-8 text-destructive mr-3" />
          <CardTitle className="text-2xl text-destructive">Complaints & Feedback</CardTitle>
        </div>
        <CardDescription>
          We are committed to providing the highest quality service. If you have any concerns or complaints, please let us know.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3 p-3 bg-destructive/5 dark:bg-destructive/10 rounded-md">
          <MailWarning className="h-6 w-6 text-destructive mt-1" />
          <div>
            <p className="font-medium text-black">Complaints Email</p>
            <a href="mailto:complaints@tutornearby.uk" className="text-destructive hover:underline">complaints@tutornearby.uk</a>
          </div>
        </div>
        
        {/* <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-3">
            We take all feedback seriously and aim to resolve any issues promptly and fairly. 
            We aim to acknowledge receipt of your complaint within 2 business days and provide a full response or update within 10 business days.
          </p>
          <h4 className="font-semibold text-foreground mb-2 flex items-center">
            <ListChecks className="w-5 h-5 mr-2 text-primary" />
            To help us investigate thoroughly, please include:
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {complaintChecklist.map((item, index) => (
              <li key={index} className="flex items-center">
                {item.icon}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div> */}
        <p className="text-xs text-muted-foreground pt-3">
          Your feedback is invaluable in helping us improve our services. Thank you for bringing any concerns to our attention.
        </p>
      </CardContent>
    </Card>
  );
};

export default ComplaintsInfo;