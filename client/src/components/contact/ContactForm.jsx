import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { Send } from 'lucide-react';
    import useContactFormLogic from '@/hooks/useContactFormLogic';
    import ContactFormHeader from '@/components/contact/ContactFormHeader';
    import ContactFormFields from '@/components/contact/ContactFormFields';
    import { supabase } from '@/lib/supabaseClient';
    import { cn } from '@/lib/utils';

    const MIN_SUBMISSION_TIME_MS = 3000; 

    const ContactForm = ({ className }) => {
      const { toast } = useToast();
      const {
        formData,
        handleChange,
        handleCheckboxChange,
        handleSelectChange,
        selectedLevel,
        availableSubjects,
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
          const { error } = await supabase
            .from('contact_submissions')
            .insert([
              { 
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                selected_plan: formData.selectedPlan,
                level: formData.level,
                subject: formData.subject,
                preferred_days: formData.preferredDays,
                hours_per_week: formData.hoursPerWeek,
                message: formData.message,
                tutoring_preference: formData.tutoringPreference,
                is_not_robot: formData.isNotRobot,
                math_captcha_answer: formData.mathCaptcha,
                form_load_timestamp: formData.formLoadTime
              }
            ]);

          if (error) {
            throw error;
          }

          toast({
            title: "Enquiry Sent!",
            description: "Thank you for your message. We'll get back to you soon.",
          });
          
          resetForm();

        } catch (error) {
          console.error("Error submitting to Supabase:", error);
          toast({
            title: "Submission Failed",
            description: "Sorry, there was an error sending your message. Please try again later.",
            variant: "destructive",
          });
          setMathQuestion(generateMathQuestionFunc());
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
                  selectedLevel={selectedLevel}
                  availableSubjects={availableSubjects}
                  handleRobotCheckboxChange={handleRobotCheckboxChange}
                  mathQuestion={mathQuestion}
                />
              </div>
              <Button type="submit" size="lg" className="w-full flex items-center justify-center mt-auto"> {/* Added mt-auto to push button to bottom */}
                <Send className="w-5 h-5 mr-2" /> Send Enquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    };
    export default ContactForm;