
import React, { useState } from 'react';
import { useData } from './DataContext';
import { CheckCircle2, ArrowRight, Building, MapPin, User, Ruler } from 'lucide-react';

const ApplyPage: React.FC = () => {
  const { addLead } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    spaceName: '',
    role: 'Owner',
    address: '',
    size: '',
    description: '',
    website: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formData.website) {
        console.warn("Bot detected via honeypot");
        setIsSubmitting(false);
        return;
      }

      const identifier = formData.email;
      const validationUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-submission`;

      const validationResponse = await fetch(validationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          actionType: 'apply',
          formData: {
            name: formData.name,
            email: formData.email,
            description: formData.description,
          },
          honeypot: formData.website,
        }),
      });

      const validationResult = await validationResponse.json();

      if (!validationResult.valid) {
        if (validationResult.blocked) {
          alert(validationResult.reason || 'Too many application attempts. Please try again later.');
        } else {
          alert(validationResult.reason || 'Unable to submit application. Please check your input.');
        }
        setIsSubmitting(false);
        return;
      }

      // We bundle the specific fields into the message for the admin panel to see easily
      // without needing to refactor the entire Lead interface right now.
      const detailedMessage = `
        APPLICATION DETAILS:
        Space Name: ${formData.spaceName}
        Role: ${formData.role}
        Description: ${formData.description}
      `;

      await addLead({
        name: formData.name,
        email: formData.email,
        type: 'membership-application',
        address: formData.address,
        buildingSize: formData.size,
        message: detailedMessage,
        timestamp: new Date().toISOString()
      });

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting application", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-5xl md:text-7xl font-heavy uppercase mb-6">Application Received</h1>
        <p className="text-xl text-neutral-600 max-w-2xl mb-12 leading-relaxed">
          Thank you for your interest in the Denver Coworks Alliance. <br/>
          The board reviews applications weekly. We will reach out to <strong>{formData.email}</strong> with next steps shortly.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-black text-white px-10 py-4 font-bold uppercase hover:bg-neutral-800 tracking-widest"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* Left Side: Visual & Manifesto */}
        <div className="bg-black text-white p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80" 
              alt="Community collaboration" 
              className="w-full h-full object-cover grayscale"
            />
          </div>
          <div className="relative z-10">
            <span className="bg-blue-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-widest mb-8 inline-block">
              Membership Application
            </span>
            <h1 className="text-6xl md:text-8xl font-heavy uppercase leading-none mb-6">
              Join The<br/>Alliance.
            </h1>
            <p className="text-xl text-neutral-300 max-w-md leading-relaxed">
              Connect with the best operators in Denver. Share insights, solve problems, and grow your business with a support network that actually cares.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 hidden lg:block">
            <div className="border-l-2 border-white pl-6">
              <p className="italic text-neutral-400 text-sm mb-4">"A rising tide lifts all boats."</p>
              <p className="font-bold uppercase text-sm">Est. 2012</p>
            </div>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="p-8 md:p-16 lg:p-24 bg-neutral-50 flex flex-col justify-center">
          <div className="max-w-xl mx-auto w-full">
             <h2 className="text-3xl font-heavy uppercase mb-8 flex items-center">
               Tell us about your space <ArrowRight className="ml-3 w-6 h-6" />
             </h2>
             
             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Your Name</label>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Email Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                      placeholder="jane@workspace.com"
                    />
                  </div>
                </div>

                {/* Space Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Name of Space</label>
                    <div className="relative">
                      <Building className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                      <input
                        required
                        name="spaceName"
                        value={formData.spaceName}
                        onChange={handleChange}
                        className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                        placeholder="The Hive"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Your Role</label>
                    <div className="relative">
                      <User className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors appearance-none"
                      >
                        <option value="Owner">Owner / Founder</option>
                        <option value="Property Owner">Property Owner</option>
                        <option value="Community Manager">Community Manager</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Address</label>
                    <div className="relative">
                      <MapPin className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                      <input
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                        placeholder="123 Main St"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Size of Space (SqFt)</label>
                    <div className="relative">
                      <Ruler className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                      <input
                        required
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                        placeholder="e.g. 5,000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Describe the space quickly</label>
                   <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors resize-none"
                      placeholder="Industrial chic in RiNo with 20 offices and event space..."
                   ></textarea>
                </div>

                {/* Honeypot - Hidden from real users */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <button
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-blue-600 text-white font-heavy uppercase py-5 text-lg tracking-widest hover:bg-blue-700 transition-colors shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
                
                <p className="text-xs text-center text-neutral-400 mt-4">
                   By submitting, you agree to be contacted by the alliance board members for vetting purposes.
                </p>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
