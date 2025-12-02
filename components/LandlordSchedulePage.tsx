
import React, { useState } from 'react';
import { useData } from './DataContext';
import { Calendar, Clock, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';

const LandlordSchedulePage: React.FC = () => {
  const { addLead } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferredTime: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        type: 'landlord-consultation',
        message: `Scheduling Request. Preferred Time: ${formData.preferredTime}. Notes: ${formData.notes}`,
        timestamp: new Date().toISOString()
      });
      
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-5xl font-heavy uppercase mb-6">Request Received!</h1>
        <p className="text-xl text-neutral-600 max-w-2xl mb-12">
          Thanks, {formData.name}. We have received your request for a consultation. One of our alliance experts will reach out to the number provided ({formData.phone}) shortly to confirm your appointment.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-neutral-800"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      {/* Header */}
      <div className="bg-black text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-heavy uppercase mb-4">Schedule a Consultation</h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
          Speak directly with a Denver Coworks expert. No sales pitch—just a feasibility assessment of your space.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 pb-24 relative z-10">
        <div className="bg-white shadow-2xl border border-neutral-200 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-1 space-y-8 border-b lg:border-b-0 lg:border-r border-neutral-100 pb-8 lg:pb-0 lg:pr-8">
             <div>
                <h3 className="font-heavy uppercase text-xl mb-4">What to Expect</h3>
                <ul className="space-y-4 text-sm text-neutral-600">
                   <li className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                      <span>15-minute introductory call</span>
                   </li>
                   <li className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                      <span>Review of your building location</span>
                   </li>
                   <li className="flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-3 mt-0.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                      <span>Assessment of market rates</span>
                   </li>
                </ul>
             </div>
             
             <div className="bg-neutral-50 p-6 border border-neutral-200">
                <p className="font-bold uppercase text-xs text-neutral-400 mb-2">Need immediate help?</p>
                <p className="font-heavy text-lg">info@denvercoworks.org</p>
             </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2">
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col">
                      <label className="font-bold uppercase text-xs mb-2">Full Name</label>
                      <input
                         type="text"
                         name="name"
                         required
                         value={formData.name}
                         onChange={handleChange}
                         className="bg-neutral-50 border border-neutral-300 p-3 font-medium focus:border-black focus:outline-none"
                         placeholder="John Smith"
                      />
                   </div>
                   <div className="flex flex-col">
                      <label className="font-bold uppercase text-xs mb-2">Phone Number</label>
                      <input
                         type="tel"
                         name="phone"
                         required
                         value={formData.phone}
                         onChange={handleChange}
                         className="bg-neutral-50 border border-neutral-300 p-3 font-medium focus:border-black focus:outline-none"
                         placeholder="(303) 555-0123"
                      />
                   </div>
                </div>

                <div className="flex flex-col">
                   <label className="font-bold uppercase text-xs mb-2">Email Address</label>
                   <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-neutral-50 border border-neutral-300 p-3 font-medium focus:border-black focus:outline-none"
                      placeholder="john@property.com"
                   />
                </div>

                <div className="flex flex-col">
                   <label className="font-bold uppercase text-xs mb-2">Building Address / Location</label>
                   <div className="relative">
                      <Building className="absolute top-3.5 left-3 w-5 h-5 text-neutral-400" />
                      <input
                         type="text"
                         name="address"
                         required
                         value={formData.address}
                         onChange={handleChange}
                         className="w-full bg-neutral-50 border border-neutral-300 p-3 pl-10 font-medium focus:border-black focus:outline-none"
                         placeholder="123 Broadway St, Denver"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col">
                      <label className="font-bold uppercase text-xs mb-2">Preferred Date/Time</label>
                      <div className="relative">
                         <Calendar className="absolute top-3.5 left-3 w-5 h-5 text-neutral-400" />
                         <input
                            type="text"
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-neutral-300 p-3 pl-10 font-medium focus:border-black focus:outline-none"
                            placeholder="Tue Mornings / Next Friday"
                         />
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <label className="font-bold uppercase text-xs mb-2">Building Size / Type</label>
                      <input
                         type="text"
                         name="notes"
                         value={formData.notes}
                         onChange={handleChange}
                         className="bg-neutral-50 border border-neutral-300 p-3 font-medium focus:border-black focus:outline-none"
                         placeholder="e.g. 5k sqft Warehouse"
                      />
                   </div>
                </div>

                <button
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-blue-600 text-white font-heavy uppercase py-4 tracking-widest hover:bg-blue-700 transition-colors mt-4 disabled:opacity-50"
                >
                   {isSubmitting ? "Scheduling..." : "Confirm Request"}
                </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordSchedulePage;
