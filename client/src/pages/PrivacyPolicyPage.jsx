import React from 'react';
import { Lock, ListChecks, AlertTriangle, Info } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-full lg:max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold gradient-text mb-2">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-8" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" /></div>
            <div>
              <p className="font-bold">Important Legal Notice</p>
              <p className="text-sm">The following Privacy Policy is a template and for illustrative purposes only. You MUST consult with a qualified legal professional or a GDPR specialist to ensure this policy is accurate, complete, and legally compliant for your specific business operations and data processing activities under UK GDPR and other applicable privacy laws.</p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <section>
            <h2>1. Introduction</h2>
            <p>TutorNearby ("we", "us", "our") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (tutornearby.co.uk) and use our tutoring services. This policy is compliant with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
            <p>Our company, Laskon Technologies, is the data controller for the personal information we process, unless otherwise stated.</p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We may collect and process the following types of personal data:</p>
            <ul>
              <li><strong>Personal Identification Information:</strong> Name, email address, phone number, postal address, date of birth (for students, if relevant and provided).</li>
              <li><strong>Educational Information:</strong> Academic level, subjects of interest, learning needs, school information, exam board details, and progress information.</li>
              <li><strong>Tutor Information:</strong> Qualifications, experience, DBS check status (for tutors), subject specialisms, availability.</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website. This may include information collected via cookies (see section 9).</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services, including session recordings for quality and training purposes (with consent where required), and data stored in your browser's local storage to enhance user experience (e.g., remembering partially filled form data, if you consent to functional cookies).</li>
              <li><strong>Communication Data:</strong> Records of your communications with us, including emails, messages, and call logs.</li>
              <li><strong>Payment Information:</strong> While we do not store full card details, we process payment information through secure third-party payment processors.</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect in the following ways:</p>
            <ul>
              <li>To provide and manage our tutoring services, including matching students with suitable tutors.</li>
              <li>To process payments for our services.</li>
              <li>To communicate with you regarding your enquiries, bookings, and our services.</li>
              <li>To improve our website, services, and customer experience (e.g., by using cookies to remember your preferences or analyse traffic).</li>
              <li>For internal record keeping, administrative, and operational purposes.</li>
              <li>To comply with legal and regulatory obligations (e.g., safeguarding, financial reporting).</li>
              <li>For marketing purposes, where you have consented to receive such communications.</li>
              <li>To ensure the security of our website and services.</li>
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis for Processing Your Personal Data</h2>
            <p>We will only process your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul>
              <li><strong>Performance of a Contract:</strong> Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing tutoring services).</li>
              <li><strong>Legitimate Interests:</strong> Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests (e.g., improving our services, fraud prevention, using essential functional cookies).</li>
              <li><strong>Consent:</strong> Where you have given us explicit consent to process your personal data for a specific purpose (e.g., for marketing communications, using non-essential cookies, or processing special category data if necessary).</li>
              <li><strong>Legal Obligation:</strong> Where we need to comply with a legal or regulatory obligation.</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Sharing and Disclosure</h2>
            <p>We may share your personal data with:</p>
            <ul>
              <li><strong>Tutors:</strong> To enable them to provide tutoring services to you. We only share necessary information.</li>
              <li><strong>Third-Party Service Providers:</strong> Who perform services on our behalf, such as payment processing, IT support, marketing, and data analytics. These providers are contractually bound to protect your data.</li>
              <li><strong>Legal and Regulatory Authorities:</strong> If required by law or in response to valid requests by public authorities (e.g., for safeguarding purposes, law enforcement).</li>
              <li><strong>Professional Advisors:</strong> Including lawyers, bankers, auditors, and insurers who provide consultancy, banking, legal, insurance, and accounting services.</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>We have implemented appropriate technical and organisational security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorised way, altered, or disclosed. We limit access to your personal data to those employees, agents, tutors, and other third parties who have a business need to know. They will only process your personal data on our instructions and are subject to a duty of confidentiality.</p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <p>We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. Typically, this means data related to client services will be kept for up to 6 years after our relationship ends for tax and legal reasons. Data stored in local storage for functional purposes (e.g., contact form data) is retained until you clear your browser data or specifically remove it, unless you decline consent where applicable.</p>
          </section>

          <section>
            <h2>8. Your Data Protection Rights (UK GDPR)</h2>
            <p>Under UK data protection law, you have certain rights regarding your personal data:</p>
            <ul>
              <li><strong>Right to Access:</strong> You can request copies of your personal data.</li>
              <li><strong>Right to Rectification:</strong> You can ask us to correct inaccurate or incomplete information.</li>
              <li><strong>Right to Erasure ('Right to be Forgotten'):</strong> You can ask us to delete your personal data in certain circumstances.</li>
              <li><strong>Right to Restrict Processing:</strong> You can ask us to restrict the processing of your personal data in certain circumstances.</li>
              <li><strong>Right to Data Portability:</strong> You can ask that we transfer the information you gave us to another organisation, or to you, in certain circumstances.</li>
              <li><strong>Right to Object to Processing:</strong> You can object to the processing of your personal data in certain circumstances (e.g., for direct marketing).</li>
              <li><strong>Right to Withdraw Consent:</strong> Where we rely on consent to process your data (e.g., for non-essential cookies or marketing), you can withdraw your consent at any time.</li>
              <li><strong>Rights related to Automated Decision Making and Profiling:</strong> We do not currently conduct automated decision-making or profiling that has a legal or similarly significant effect on you.</li>
            </ul>
            <p>To exercise any of these rights, please contact us using the details below. We may need to request specific information from you to help us confirm your identity.</p>
          </section>

          <section id="cookies">
            <h2>9. Cookies and Tracking Technologies</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-4" role="alert">
              <div className="flex">
                <div className="py-1"><Info className="h-6 w-6 text-blue-500 mr-3" /></div>
                <div>
                  <p className="font-bold">Our Use of Cookies and Local Storage</p>
                  <p className="text-sm">We use cookies and local storage for essential functional purposes. For example, we use local storage to remember information you've entered into our contact form so you don't lose it if you navigate away and come back. This is considered a functional use to improve your experience. We do not currently use cookies for analytical or advertising tracking without your explicit consent where required by law. You can manage your consent for non-essential cookies via our cookie consent banner.</p>
                </div>
              </div>
            </div>
            <p>Our website may use cookies (small text files placed on your device) and similar tracking technologies like local storage to enhance your browsing experience, remember your preferences, analyse website traffic (if consent is given for analytics cookies), and for marketing purposes (if consent is given for marketing cookies).</p>
            <p><strong>Types of Cookies We May Use:</strong></p>
            <ul>
                <li><strong>Essential/Functional Cookies:</strong> These are necessary for the website to function properly. They include, for example, cookies that enable you to log into secure areas or use a shopping cart. We also use local storage for functional purposes like remembering data you enter into forms. You cannot opt out of strictly necessary cookies, but you can manage local storage by clearing your browser data.</li>
                <li><strong>Analytical/Performance Cookies:</strong> These allow us to recognise and count the number of visitors and see how visitors move around our website. This helps us improve the way our website works. We would only use these with your consent.</li>
                <li><strong>Marketing Cookies:</strong> These cookies record your visit to our website, the pages you have visited, and the links you have followed. We might use this information to make our website and any advertising displayed on it more relevant to your interests. We would only use these with your consent.</li>
            </ul>
            <p><strong>Managing Cookies:</strong></p>
            <p>You can manage your cookie preferences through the cookie consent banner provided on our website. Most web browsers also allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.</p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>Our services are often used by children (under 18). We collect personal data about children only with the consent of their parent or legal guardian. We are committed to protecting children's privacy and comply with applicable laws such as the Children's Code (Age Appropriate Design Code) in the UK.</p>
          </section>
          
          <section>
            <h2>11. International Data Transfers</h2>
            <p>Your information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction. If we transfer your personal data out of the UK, we ensure a similar degree of protection is afforded to it by ensuring at least one of the following safeguards is implemented:
              <ul>
                <li>We will only transfer your personal data to countries that have been deemed to provide an adequate level of protection for personal data by the UK.</li>
                <li>Where we use certain service providers, we may use specific contracts approved by the UK which give personal data the same protection it has in the UK.</li>
              </ul>
            </p>
          </section>

          <section>
            <h2>12. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our data protection practices, or if you wish to exercise your rights, please contact us:</p>
            <p>Data Protection Officer / Legal Team</p>
            <p>Email: info@tutornearby.co.uk (Subject: Data Protection Query)</p>
            <p>Address: Unit 1, Parliament Business Centre, Commerce Way, Liverpool, L8 7BL</p>
            <p>You also have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK supervisory authority for data protection issues (www.ico.org.uk).</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;