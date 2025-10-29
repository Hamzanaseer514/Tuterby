import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { Send } from 'lucide-react';
    import useContactFormLogic from '@/hooks/useContactFormLogic';
    import ContactFormHeader from '@/components/contact/ContactFormHeader';
    import ContactFormFields from '@/components/contact/ContactFormFields';
    import { cn } from '@/lib/utils';
    import emailjs from '@emailjs/browser';

    const MIN_SUBMISSION_TIME_MS = 3000; 

    const ContactForm = ({ className }) => {
      const { toast } = useToast();
      const [isSubmitting, setIsSubmitting] = React.useState(false);
      const {
        formData,
        handleChange,
        handleCheckboxChange,
        handleSelectChange,
        // selectedLevel,
        // availableSubjects,
        resetForm,
        handleRobotCheckboxChange,
        mathQuestion,
        setMathQuestion,
        generateMathQuestionFunc
      } = useContactFormLogic();

      const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionTime = Date.now();
        if ((submissionTime - formData.formLoadTime) < MIN_SUBMISSION_TIME_MS) {
          console.log("Potential bot: Form submitted too quickly.");
          toast({
            title: "Submission Error",
            description: "There was an issue with your submission. Please try again.",
            variant: "destructive",
          });
          setMathQuestion(generateMathQuestionFunc()); 
          return;
        }
        
        if (formData.honeypot) {
          console.log("Bot submission detected (honeypot).");
          setMathQuestion(generateMathQuestionFunc());
          return; 
        }

        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
           toast({
            title: "Incomplete Form",
            description: "Please fill out your Name, Email, Phone Number, and Message.",
            variant: "destructive",
          });
          setMathQuestion(generateMathQuestionFunc());
          return;
        }

        if (parseInt(formData.mathCaptcha, 10) !== mathQuestion.answer) {
          toast({
            title: "Security Question Failed",
            description: "Incorrect answer to the math question. Please try again.",
            variant: "destructive",
          });
          setMathQuestion(generateMathQuestionFunc());
          handleChange({ target: { name: 'mathCaptcha', value: '' } }); 
          return;
        }

        if (!formData.isNotRobot) {
          toast({
            title: "Verification Required",
            description: "Please confirm you are not a robot.",
            variant: "destructive",
          });
          setMathQuestion(generateMathQuestionFunc());
          return;
        }

        try {
          setIsSubmitting(true);

          // Send email to admin via EmailJS (first, so DB issues don't block email)
          try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL; // optional if your EmailJS template defines recipient

            if (!serviceId || !templateId || !publicKey) {
              console.warn('EmailJS env vars are not configured. Skipping email send.');
            } else {
              if (!adminEmail) {
                console.warn('VITE_ADMIN_EMAIL is not set. Ensure your EmailJS template has a fixed To address or set VITE_ADMIN_EMAIL and use {{to_email}} in the template.');
              }
              const now = new Date();
              const year = now.getFullYear();
              const time = now.toLocaleString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });

              const templateParams = {
                to_email: adminEmail,
                // match EmailJS template variables
                name: formData.name,
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
                time,
                year,
                // improve deliverability and reply behavior
                reply_to: formData.email,
                from_name: 'TutorNearBy',
                subject: `New Contact Message — ${formData.name}`,
                title: `New Contact Message — ${formData.name}`
              };
              console.log(templateParams);
              console.log(serviceId);
              console.log(templateId);
              console.log(publicKey);
              console.log(adminEmail);
              await emailjs.send(serviceId, templateId, templateParams, publicKey);
            }
          } catch (emailError) {
            console.error('EmailJS send error:', emailError);
            throw emailError; // surface email failure to user
          }

          toast({
            title: "Enquiry Sent!",
            description: "Thank you for your message. We'll get back to you soon.",
          });
          
          resetForm();

        } catch (error) {
          console.error("Submission error:", error);
          toast({
            title: "Sorry, we couldn't send your email",
            description: "Please try again in a moment or contact us directly.",
            variant: "destructive",
          });
          setMathQuestion(generateMathQuestionFunc());
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <Card className={cn("shadow-lg border bg-card w-full h-full flex flex-col", className)}> {/* Added flex flex-col and h-full */}
          <ContactFormHeader />
          <CardContent className="flex-grow flex flex-col"> {/* Added flex-grow and flex flex-col */}
            <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col"> {/* Added flex-grow and flex flex-col */}
              <div className="flex-grow space-y-6"> {/* Added flex-grow for fields area */}
                <ContactFormFields
                  formData={formData}
                  handleChange={handleChange}
                  handleCheckboxChange={handleCheckboxChange}
                  handleSelectChange={handleSelectChange}
                  // selectedLevel={selectedLevel}
                  // availableSubjects={availableSubjects}
                  handleRobotCheckboxChange={handleRobotCheckboxChange}
                  mathQuestion={mathQuestion}
                />
              </div>
              <Button type="submit" size="lg" className="w-full flex items-center justify-center mt-auto" disabled={isSubmitting}> {/* Added mt-auto to push button to bottom */}
                <Send className="w-5 h-5 mr-2" /> {isSubmitting ? 'Sending...' : 'Send Enquiry'}
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    };
    export default ContactForm;