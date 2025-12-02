
import React, { useState } from 'react';
import { useData } from './DataContext';

const ContactForm: React.FC = () => {
  const { addLead } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    buildingSize: '',
    type: 'landlord',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addLead({
        ...formData,
        timestamp: new Date().toISOString()
      });
      
      alert("Thanks for reaching out! We've received your message and will be in touch shortly.");
      
      setFormData({ 
        name: '', 
        email: '', 
        phone: '',
        address: '',
        buildingSize: '',
        type: 'landlord', 
        message: '' 
      });
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

  return (
    <section className="py-24 bg-neutral-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white p-8 md:p-16 shadow-2xl border-2 border-black relative">
          {/* Decorative heavy block */}
          <div className="absolute -top-4 -left-4 w-full h-full bg-black -z-10"></div>
          
          <h2 className="text-4xl md:text-5xl font-heavy uppercase mb-2 text-center">Start the Conversation</h2>
          <p className="text-center text-neutral-600 mb-10 max-w-lg mx-auto">
            Tell us about your building or space. Our alliance experts are ready to help you generate revenue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Name & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="name" className="font-bold uppercase text-xs mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-neutral-100 border border-neutral-300 p-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="type" className="font-bold uppercase text-xs mb-2">I am a...</label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-neutral-100 border border-neutral-300 p-4 appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                  >
                    <option value="landlord">Building Owner / Landlord</option>
                    <option value="operator">Coworking Operator</option>
                    <option value="other">Community Expert / Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="email" className="font-bold uppercase text-xs mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-neutral-100 border border-neutral-300 p-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                  placeholder="jane@example.com"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="phone" className="font-bold uppercase text-xs mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-neutral-100 border border-neutral-300 p-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Row 3: Building Specifics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="address" className="font-bold uppercase text-xs mb-2">Address of Building</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-neutral-100 border border-neutral-300 p-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                  placeholder="123 Main St, Denver, CO"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="buildingSize" className="font-bold uppercase text-xs mb-2">Size of Building (Sq Ft)</label>
                <input
                  type="text"
                  id="buildingSize"
                  name="buildingSize"
                  value={formData.buildingSize}
                  onChange={handleChange}
                  className="bg-neutral-100 border border-neutral-300 p-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                  placeholder="e.g. 5,000"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col">
              <label htmlFor="message" className="font-bold uppercase text-xs mb-2">How can we help?</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                className="bg-neutral-100 border border-neutral-300 p-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                placeholder="Tell us about your goals..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white font-heavy uppercase py-5 tracking-widest hover:bg-neutral-800 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
