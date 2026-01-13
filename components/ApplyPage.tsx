import React, { useState } from 'react';
import { supabase } from './supabase';
import { CheckCircle2, ArrowRight, Building, MapPin, User, Mail, Briefcase } from 'lucide-react';

const ApplyPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    spaceName: '',
    spaceAddress: '',
    applicantName: '',
    applicantEmail: '',
    roleInCompany: 'Owner' as 'Owner' | 'Manager',
    honeypot: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check honeypot
      if (formData.honeypot) {
        console.warn("Bot detected via honeypot");
        setIsSubmitting(false);
        return;
      }

      const { data, error: functionError } = await supabase.functions.invoke('handle-application', {
        body: {
          spaceName: formData.spaceName,
          spaceAddress: formData.spaceAddress,
          applicantName: formData.applicantName,
          applicantEmail: formData.applicantEmail,
          roleInCompany: formData.roleInCompany
        }
      });

      if (functionError) throw functionError;

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Error submitting application", error);
      alert(error.message || "Something went wrong. Please try again.");
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
          Thank you for your interest in the Denver Coworks Alliance. <br />
          We've sent a confirmation email to <strong>{formData.applicantEmail}</strong>.<br />
          Our team will review your application and reach out with next steps shortly.
        </p>
        <button
          onClick={() => window.location.href = '/'}
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
              Join The<br />Alliance.
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
            <h2 className="text-3xl font-heavy uppercase mb-4 flex items-center">
              Apply to Join <ArrowRight className="ml-3 w-6 h-6" />
            </h2>
            <p className="text-neutral-600 mb-8">
              Fill out this quick form to get started. Once approved, you'll create your account and complete your space profile.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Space Information */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Space Name</label>
                <div className="relative">
                  <Building className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                  <input
                    required
                    name="spaceName"
                    value={formData.spaceName}
                    onChange={handleChange}
                    className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                    placeholder="Denver Creative Hub"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Space Address</label>
                <div className="relative">
                  <MapPin className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                  <input
                    required
                    name="spaceAddress"
                    value={formData.spaceAddress}
                    onChange={handleChange}
                    className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                    placeholder="456 Broadway, Denver, CO 80203"
                  />
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Your Name</label>
                  <div className="relative">
                    <User className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                    <input
                      required
                      name="applicantName"
                      value={formData.applicantName}
                      onChange={handleChange}
                      className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                    <input
                      required
                      type="email"
                      name="applicantEmail"
                      value={formData.applicantEmail}
                      onChange={handleChange}
                      className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                      placeholder="jane@workspace.com"
                    />
                  </div>
                </div>
              </div>

              {/* Role in Company */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Your Role</label>
                <div className="relative">
                  <Briefcase className="absolute top-4 left-4 w-5 h-5 text-neutral-400" />
                  <select
                    required
                    name="roleInCompany"
                    value={formData.roleInCompany}
                    onChange={handleChange}
                    className="w-full p-4 pl-12 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors appearance-none"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              {/* Honeypot - Hidden from real users */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="honeypot"
                  value={formData.honeypot}
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
                By submitting, you agree to be contacted by the alliance for vetting purposes.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
