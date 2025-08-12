import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Facebook, Instagram, Twitter, Youtube, Mail, ChevronDown } from 'lucide-react';

const TrialSignupStep2: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    postalCode: '',
    consent: false
  });

  // Complete list of countries from the reference
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica',
    'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
    'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Bouvet Island', 'Brazil', 'British Indian Ocean Territory',
    'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
    'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands',
    'Colombia', 'Comoros', 'Congo', 'Congo, The Democratic Republic of the', 'Cook Islands', 'Costa Rica',
         'Cote D\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
    'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
    'Ethiopia', 'Falkland Islands (Malvinas)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana',
    'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
    'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea',
    'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard Island and McDonald Islands', 'Holy See (Vatican City State)',
    'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran, Islamic Republic Of', 'Iraq',
    'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya',
         'Kiribati', 'Korea People\'s Democratic Republic', 'Republic of Korea', 'Kuwait', 'Kyrgyzstan', 'Land Islands',
         'Lao People\'s Democratic Republic', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libyan Arab Jamahiriya',
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'North Macedonia', 'Madagascar', 'Malawi', 'Malaysia',
    'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte',
    'Mexico', 'Federated States of Micronesia', 'Moldova, Republic of', 'Monaco', 'Mongolia', 'Montenegro',
    'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia',
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands',
    'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestinian Territory, Occupied', 'Panama', 'Papua New Guinea',
    'Paraguay', 'Peru', 'Philippines', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion',
    'Romania', 'Russian Federation', 'Rwanda', 'Saint Helena', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
    'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'Spain',
    'Sri Lanka', 'Sudan', 'Suriname', 'Svalbard and Jan Mayen', 'Eswatini', 'Sweden', 'Switzerland',
    'Syrian Arab Republic', 'Taiwan', 'Tajikistan', 'Tanzania, United Republic of', 'Thailand', 'Timor-Leste',
    'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands',
    'Tuvalu', 'Uganda', 'UK', 'Ukraine', 'United Arab Emirates', 'United States', 'United States Minor Outlying Islands',
    'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Virgin Islands, British', 'Virgin Islands, U.S.',
    'Wallis and Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to confirmation page
    navigate('/trial-signup-confirmation');
  };

  const handlePrev = () => {
    // Navigate back to step 1
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-900 p-4 flex items-center justify-center">
        <div className="flex items-center space-x-3">
                     <div className="relative">
             <div className="w-10 h-10 rounded-full border-2 border-blue-200 overflow-hidden">
               {/* Character illustration - replace with actual image */}
               <img
                 src="/mr-grow-your-business-character.png"
                 alt="Mr. Grow Your Business Character"
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   // Fallback to placeholder if image fails to load
                   const target = e.target as HTMLImageElement;
                   target.style.display = 'none';
                   target.nextElementSibling?.classList.remove('hidden');
                 }}
               />
               {/* Fallback placeholder */}
               <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center hidden">
                 <span className="text-white font-bold text-base">M</span>
               </div>
             </div>
             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-900"></div>
           </div>
          <span className="text-white font-semibold text-base">Mr. Grow Your Business</span>
        </div>
      </div>

             {/* Main Content */}
       <div className="flex-1 flex items-center justify-center px-4 py-6">
         <div className="w-full max-w-md">
           {/* Form Card */}
           <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Create Your Account And Get Started In Less Than 60 Seconds
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name Field */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Last Name Field */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
                  I Consent to Receive SMS Notifications, Alerts & Occasional Marketing Communication from company. Message frequency varies. Message & data rates may apply. Text HELP to (XXX) XXX-XXXX for assistance. You can reply STOP to unsubscribe at any time.
                </label>
              </div>

              {/* Country Field */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <div className="relative">
                                     <select
                     id="country"
                     name="country"
                     value={formData.country}
                     onChange={handleInputChange}
                     className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none"
                     required
                   >
                     <option value="">Country</option>
                     {countries.map((country, index) => (
                       <option key={index} value={country}>
                         {country}
                       </option>
                     ))}
                   </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Postal Code Field */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal Code"
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </form>

            {/* Legal Links */}
            <div className="mt-6 text-center">
              <div className="flex justify-center space-x-4 text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Privacy Policy
                </a>
                <span className="text-gray-400">|</span>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar with Footer */}
      <div className="bg-blue-900 text-white">
        {/* Navigation Bar */}
        <div className="p-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>PREV</span>
            </button>

                         {/* Progress Indicator */}
             <div className="flex items-center space-x-4">
               <span className="text-sm">Showing 1 of 2</span>
               <div className="w-32 bg-blue-800 rounded-full h-2 relative">
                 <div className="bg-blue-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                 <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
               </div>
             </div>

                         {/* Continue Button */}
             <button
               onClick={handleSubmit}
               className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
             >
               CONTINUE
             </button>
          </div>
        </div>

                 {/* Footer - Social Media Icons and Brand */}
         <div className="p-4 border-t border-blue-800">
           <div className="max-w-md mx-auto text-center">
                                          {/* Social Media Icons */}
               <div className="flex justify-center space-x-6 mb-6">
                 <a href="https://www.facebook.com/chrismateo2" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
                   <Facebook size={20} />
                 </a>
                 <a href="https://www.instagram.com/mrgrowyourbusiness__/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
                   <Instagram size={20} />
                 </a>
                 <a href="https://x.com/motivational_cm?lang=en" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
                   <Twitter size={20} />
                 </a>
                 <a href="https://www.youtube.com/@Mrgrowyourbusiness/featured" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
                   <Youtube size={20} />
                 </a>
                 <a href="mailto:ceo@cmateo.com" className="text-white hover:text-blue-200 transition-colors">
                   <Mail size={20} />
                 </a>
               </div>
             
                                          {/* Brand Image */}
               <div className="flex justify-center mb-6">
                <div className="relative inline-block">
                                     <div className="w-16 h-16 rounded-full border-2 border-blue-200 overflow-hidden">
                     {/* Character illustration - replace with actual image */}
                     <img
                       src="/mr-grow-your-business-character.png"
                       alt="Mr. Grow Your Business Character"
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         // Fallback to placeholder if image fails to load
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         target.nextElementSibling?.classList.remove('hidden');
                       }}
                     />
                     {/* Fallback placeholder */}
                     <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center hidden">
                       <span className="text-white font-bold text-xl">M</span>
                     </div>
                   </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-blue-900"></div>
                </div>
              </div>
              
                             {/* Legal Links */}
               <div className="flex justify-center items-center space-x-4 text-sm">
                 <a href="#" className="text-yellow-300 hover:text-yellow-200 transition-colors">
                   Terms and conditions
                 </a>
                 <span className="text-yellow-300">•</span>
                 <a href="#" className="text-yellow-300 hover:text-yellow-200 transition-colors">
                   Privacy Policy
                 </a>
               </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default TrialSignupStep2; 