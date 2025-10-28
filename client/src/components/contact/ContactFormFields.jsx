import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, User, BookOpen as BookOpenIcon, CalendarClock, Hourglass, MessageSquare, ShoppingBag, Star, ShieldCheck, Brain } from 'lucide-react';
import { levels, days, hours, planTypes } from '@/data/contactFormData';

const ContactFormFields = ({ formData, handleChange, handleCheckboxChange, handleSelectChange, selectedLevel, availableSubjects, handleRobotCheckboxChange, mathQuestion }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="flex items-center mb-1"><User className="w-4 h-4 mr-2 text-primary" />Full Name <span className="text-destructive ml-1">*</span></Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" required />
        </div>
        <div>
          <Label htmlFor="email" className="flex items-center mb-1"><Mail className="w-4 h-4 mr-2 text-primary" />Email Address <span className="text-destructive ml-1">*</span></Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g. john.doe@example.com" required />
        </div>
      </div>
      <div>
        <Label htmlFor="phone" className="flex items-center mb-1"><Phone className="w-4 h-4 mr-2 text-primary" />Phone Number <span className="text-destructive ml-1">*</span></Label>
        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="e.g. 07123456789" required />
      </div>
{/* 
      <div>
        <Label htmlFor="selectedPlan" className="flex items-center mb-1"><ShoppingBag className="w-4 h-4 mr-2 text-primary" />Select a Plan</Label>
        <Select name="selectedPlan" value={formData.selectedPlan} onValueChange={(value) => handleSelectChange('selectedPlan', value)}>
          <SelectTrigger id="selectedPlan"><SelectValue placeholder="Choose a plan or hourly option (Optional)" /></SelectTrigger>
          <SelectContent>
            {planTypes.map(plan => <SelectItem key={plan} value={plan}>{plan}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="level" className="flex items-center mb-1"><BookOpenIcon className="w-4 h-4 mr-2 text-primary" />Academic Level</Label>
          <Select name="level" value={selectedLevel} onValueChange={(value) => handleSelectChange('level', value)}>
            <SelectTrigger id="level"><SelectValue placeholder="Select level (Optional)" /></SelectTrigger>
            <SelectContent>
              {levels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="subject" className="flex items-center mb-1"><BookOpenIcon className="w-4 h-4 mr-2 text-primary" />Subject Required</Label>
          <Select name="subject" value={formData.subject} onValueChange={(value) => handleSelectChange('subject', value)} disabled={!selectedLevel}>
            <SelectTrigger id="subject"><SelectValue placeholder={selectedLevel ? "Select subject (Optional)" : "Select level first"} /></SelectTrigger>
            <SelectContent>
              {availableSubjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div> */}

      {/* <div>
        <Label htmlFor="tutoringPreference" className="flex items-center mb-1"><Star className="w-4 h-4 mr-2 text-primary" />Tutoring Preference</Label>
        <Select name="tutoringPreference" value={formData.tutoringPreference} onValueChange={(value) => handleSelectChange('tutoringPreference', value)}>
          <SelectTrigger id="tutoringPreference"><SelectValue placeholder="Online or In-Person? (Optional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Online">Online</SelectItem>
            <SelectItem value="In-Person">In-Person (Subject to availability in your area)</SelectItem>
            <SelectItem value="Flexible">Flexible / No Preference</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* <div>
        <Label className="flex items-center mb-2"><CalendarClock className="w-4 h-4 mr-2 text-primary" />Preferred Days</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {days.map(day => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox 
                id={day} 
                checked={formData.preferredDays.includes(day)}
                onCheckedChange={() => handleCheckboxChange(day)}
              />
              <Label htmlFor={day} className="font-normal">{day}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="hoursPerWeek" className="flex items-center mb-1"><Hourglass className="w-4 h-4 mr-2 text-primary" />Hours Per Week</Label>
        <Select name="hoursPerWeek" value={formData.hoursPerWeek} onValueChange={(value) => handleSelectChange('hoursPerWeek', value)}>
          <SelectTrigger id="hoursPerWeek"><SelectValue placeholder="Select hours (Optional)" /></SelectTrigger>
          <SelectContent>
            {hours.map(hourRange => <SelectItem key={hourRange} value={hourRange}>{hourRange}</SelectItem>)}
          </SelectContent>
        </Select>
      </div> */}

      <div>
        <Label htmlFor="message" className="flex items-center mb-1"><MessageSquare className="w-4 h-4 mr-2 text-primary" />Message <span className="text-destructive ml-1">*</span></Label>
        <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more about your requirements, specific topics, or any questions you have. If requesting in-person, please mention your postcode or general area." rows={5} required />
      </div>

      <div className="mt-4 p-4 border rounded-md bg-muted/40">
        <Label htmlFor="mathCaptcha" className="flex items-center mb-2">
          <Brain className="w-4 h-4 mr-2 text-primary" /> Security Question <span className="text-destructive ml-1">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-2">To help us prevent spam, please answer this simple math question:</p>
        <p className="text-lg font-semibold mb-2">{mathQuestion.num1} + {mathQuestion.num2} = ?</p>
        <Input 
          id="mathCaptcha" 
          name="mathCaptcha" 
          type="number" 
          value={formData.mathCaptcha} 
          onChange={handleChange} 
          placeholder="Your answer" 
          required 
        />
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="robotCheck" 
          checked={formData.isNotRobot}
          onCheckedChange={handleRobotCheckboxChange}
        />
        <Label htmlFor="robotCheck" className="font-normal flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-green-600" /> I confirm I am not a robot <span className="text-destructive ml-1">*</span>
        </Label>
      </div>
      
      <input type="text" name="honeypot" value={formData.honeypot} onChange={handleChange} style={{ display: 'none' }} />
    </>
  );
};

export default ContactFormFields;