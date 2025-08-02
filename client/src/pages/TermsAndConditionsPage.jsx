import React from 'react';
import { ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

const TermsAndConditionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-full lg:max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold gradient-text mb-2">Terms and Conditions</h1>
          <p className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-8" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" /></div>
            <div>
              <p className="font-bold">Important Legal Notice</p>
              <p className="text-sm">The following Terms and Conditions are a template and for illustrative purposes only. You MUST consult with a qualified legal professional to ensure these terms are accurate, complete, and legally binding for your specific business operations and comply with all applicable UK laws and regulations, including GDPR.</p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <section>
            <h2>1. Introduction</h2>
            <p>Welcome to TutorNearby ("we", "us", "our"). These Terms and Conditions govern your use of our website (tutornearby.co.uk) and the tutoring services offered. By accessing our website or using our services, you agree to be bound by these terms.</p>
          </section>

          <section>
            <h2>2. Service Description</h2>
            <p>TutorNearby provides a platform to connect students (or their parents/guardians) with independent tutors for educational support. Services may be delivered online or in-person, as agreed between the student/parent and the tutor.</p>
          </section>

          <section>
            <h2>3. User Obligations (Students/Parents)</h2>
            <ul>
              <li>You agree to provide accurate and complete information when registering or requesting services.</li>
              <li>You are responsible for ensuring a safe and appropriate learning environment for in-person sessions.</li>
              <li>You agree to treat tutors with respect and professionalism.</li>
              <li>You are responsible for any materials or equipment required for sessions, unless otherwise agreed.</li>
            </ul>
          </section>

          <section>
            <h2>4. Tutor Conduct and Responsibilities</h2>
            <p>Tutors engaged through TutorNearby are expected to:</p>
            <ul>
              <li>Provide services with professionalism, diligence, and skill.</li>
              <li>Adhere to agreed schedules and communicate any changes promptly.</li>
              <li>Maintain confidentiality regarding student information.</li>
              <li>Comply with all applicable laws and TutorNearby policies, including safeguarding.</li>
            </ul>
            <p>TutorNearby undertakes vetting procedures for tutors, including DBS checks where appropriate for UK-based tutors working with children. However, TutorNearby acts as an introductory agency and is not the employer of tutors.</p>
          </section>
          
          <section>
            <h2>5. Payment Terms</h2>
            <ul>
              <li>Fees for tutoring services will be as displayed on our website or as agreed during consultation.</li>
              <li>Payments are typically due in advance of sessions or block bookings.</li>
              <li>We reserve the right to change our fees, with reasonable notice provided.</li>
              <li>Late payments may incur additional charges or suspension of services.</li>
            </ul>
          </section>

          <section>
            <h2>6. Cancellation and Rescheduling Policy</h2>
            <ul>
              <li>We require a minimum of 24 hours' notice for cancellation or rescheduling of a session by the student/parent to avoid being charged for the session.</li>
              <li>Tutors are also expected to provide reasonable notice if they need to cancel or reschedule.</li>
              <li>Repeated cancellations may result in a review of service provision.</li>
              <li>Specific terms for Royalty Card packages may differ and will be outlined separately.</li>
            </ul>
          </section>

          <section>
            <h2>7. Intellectual Property</h2>
            <p>All content on the TutorNearby website, including text, graphics, logos, and software, is the property of TutorNearby or its licensors and is protected by copyright laws. Tutoring materials provided by tutors may be subject to their own intellectual property rights.</p>
          </section>

          <section>
            <h2>8. Data Protection and GDPR Compliance</h2>
            <p>TutorNearby is committed to protecting your privacy and handling your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
            <ul>
              <li>We collect personal information necessary to provide our services, including names, contact details, and educational requirements.</li>
              <li>Your data is used to match you with tutors, manage bookings, process payments, and communicate with you.</li>
              <li>We will only share your data with tutors for the purpose of providing the services, or with third parties where legally required or with your explicit consent.</li>
              <li>We implement appropriate technical and organisational measures to protect your data.</li>
              <li>You have rights regarding your personal data, including the right to access, rectify, erase, or restrict processing. Please see our Privacy Policy for full details.</li>
            </ul>
          </section>

          <section>
            <h2>9. Safeguarding</h2>
            <p>TutorNearby is committed to safeguarding and promoting the welfare of children and vulnerable adults. Tutors are made aware of their safeguarding responsibilities. Any concerns regarding safeguarding should be reported to us immediately.</p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>TutorNearby acts as an introductory agency and is not liable for the direct actions or omissions of tutors, beyond our vetting and matching process. Our liability is limited to the value of the services paid for. We are not liable for indirect or consequential losses. We do not guarantee specific academic outcomes, as these depend on various factors including student effort.</p>
          </section>

          <section>
            <h2>11. Governing Law and Dispute Resolution</h2>
            <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
            <p>We encourage you to contact us first to try and resolve any disputes amicably.</p>
          </section>

          <section>
            <h2>12. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms and Conditions at any time. Any changes will be effective immediately upon posting on our website. Your continued use of our services after such changes constitutes your acceptance of the new terms.</p>
          </section>

          <section>
            <h2>13. Contact Information</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <p>Email: info@tutornearby.co.uk</p>
            <p>Address: Unit 1, Parliament Business Centre, Commerce Way, Liverpool, L8 7BL</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;