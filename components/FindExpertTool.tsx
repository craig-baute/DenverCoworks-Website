
import React, { useState } from 'react';
import { Building2, Store, Warehouse, ArrowRight, Check, RefreshCcw, User, Mail, MapPin, Ruler } from 'lucide-react';
import { useData } from './DataContext';

type BuildingType = 'office' | 'retail' | 'warehouse' | null;
type GoalType = 'revenue' | 'community' | 'marketing' | null;

const FindExpertTool: React.FC = () => {
  const { addLead } = useData();
  
  const [step, setStep] = useState(1);
  const [buildingType, setBuildingType] = useState<BuildingType>(null);
  const [goal, setGoal] = useState<GoalType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    size: ''
  });

  const handleBuildingSelect = (type: BuildingType) => {
    setBuildingType(type);
    setStep(2);
  };

  const handleGoalSelect = (g: GoalType) => {
    setGoal(g);
    setStep(3);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Construct a message that includes their tool choices
      const detailedMessage = `
        INTERACTIVE TOOL RESULTS:
        Asset Type: ${buildingType?.toUpperCase()}
        Primary Goal: ${goal?.toUpperCase()}
      `;

      await addLead({
        name: formData.name,
        email: formData.email,
        type: 'expert-finder-tool',
        address: formData.address,
        buildingSize: formData.size,
        message: detailedMessage,
        timestamp: new Date().toISOString()
      });

      setStep(4); // Move to Success Screen
    } catch (error) {
      console.error("Error saving lead", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTool = () => {
    setStep(1);
    setBuildingType(null);
    setGoal(null);
    setFormData({ name: '', email: '', address: '', size: '' });
  };

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-3xl md:text-4xl font-heavy uppercase mb-8 text-center">Step 1: Select Your Asset Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => handleBuildingSelect('office')}
          className="group border-2 border-neutral-200 p-8 hover:border-black transition-all hover:bg-neutral-50 text-left flex flex-col items-center text-center"
        >
          <Building2 className="w-16 h-16 mb-6 text-neutral-400 group-hover:text-black transition-colors" />
          <span className="text-xl font-bold uppercase">Office Building</span>
          <span className="text-sm text-neutral-500 mt-2">Existing office stock or floors</span>
        </button>
        <button 
          onClick={() => handleBuildingSelect('retail')}
          className="group border-2 border-neutral-200 p-8 hover:border-black transition-all hover:bg-neutral-50 text-left flex flex-col items-center text-center"
        >
          <Store className="w-16 h-16 mb-6 text-neutral-400 group-hover:text-black transition-colors" />
          <span className="text-xl font-bold uppercase">Retail Space</span>
          <span className="text-sm text-neutral-500 mt-2">Storefronts and malls</span>
        </button>
        <button 
          onClick={() => handleBuildingSelect('warehouse')}
          className="group border-2 border-neutral-200 p-8 hover:border-black transition-all hover:bg-neutral-50 text-left flex flex-col items-center text-center"
        >
          <Warehouse className="w-16 h-16 mb-6 text-neutral-400 group-hover:text-black transition-colors" />
          <span className="text-xl font-bold uppercase">Warehouse</span>
          <span className="text-sm text-neutral-500 mt-2">Industrial and flex space</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-center mb-8 gap-2">
        <button onClick={resetTool} className="text-xs font-bold uppercase text-neutral-400 hover:text-black flex items-center">
           <RefreshCcw className="w-3 h-3 mr-1" /> Restart
        </button>
       </div>
      <h3 className="text-3xl md:text-4xl font-heavy uppercase mb-8 text-center">Step 2: What is your primary goal?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => handleGoalSelect('revenue')}
          className="group border-2 border-neutral-200 p-8 hover:border-black transition-all hover:bg-neutral-50 flex flex-col items-center text-center"
        >
          <span className="text-4xl font-heavy mb-4 text-neutral-300 group-hover:text-black transition-colors">$</span>
          <span className="text-xl font-bold uppercase">Max Revenue</span>
          <span className="text-sm text-neutral-500 mt-2">Prioritize cash flow efficiency</span>
        </button>
        <button 
          onClick={() => handleGoalSelect('community')}
          className="group border-2 border-neutral-200 p-8 hover:border-black transition-all hover:bg-neutral-50 flex flex-col items-center text-center"
        >
          <span className="text-4xl font-heavy mb-4 text-neutral-300 group-hover:text-black transition-colors">♥</span>
          <span className="text-xl font-bold uppercase">Activation</span>
          <span className="text-sm text-neutral-500 mt-2">Bring life and foot traffic</span>
        </button>
        <button 
          onClick={() => handleGoalSelect('marketing')}
          className="group border-2 border-neutral-200 p-8 hover:border-black transition-all hover:bg-neutral-50 flex flex-col items-center text-center"
        >
          <span className="text-4xl font-heavy mb-4 text-neutral-300 group-hover:text-black transition-colors">★</span>
          <span className="text-xl font-bold uppercase">Quick Fill</span>
          <span className="text-sm text-neutral-500 mt-2">Solve vacancy immediately</span>
        </button>
      </div>
    </div>
  );

  // NEW STEP 3: Data Collection
  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
       <div className="flex items-center justify-center mb-8 gap-2">
        <button onClick={resetTool} className="text-xs font-bold uppercase text-neutral-400 hover:text-black flex items-center">
           <RefreshCcw className="w-3 h-3 mr-1" /> Restart
        </button>
       </div>
      <h3 className="text-3xl md:text-4xl font-heavy uppercase mb-2 text-center">Step 3: Property Details</h3>
      <p className="text-center text-neutral-500 mb-8">
        To match you with the right expert for <span className="font-bold text-black">{buildingType}</span> properties, we need a few details.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-50 p-8 border border-neutral-200">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Your Name</label>
               <div className="relative">
                  <User className="absolute top-3.5 left-3 w-5 h-5 text-neutral-400" />
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-neutral-300 focus:border-black focus:outline-none"
                    placeholder="John Smith"
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Email Address</label>
               <div className="relative">
                  <Mail className="absolute top-3.5 left-3 w-5 h-5 text-neutral-400" />
                  <input 
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-neutral-300 focus:border-black focus:outline-none"
                    placeholder="john@company.com"
                  />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Building Address</label>
               <div className="relative">
                  <MapPin className="absolute top-3.5 left-3 w-5 h-5 text-neutral-400" />
                  <input 
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-neutral-300 focus:border-black focus:outline-none"
                    placeholder="123 Main St, Denver"
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Size of Space (SqFt)</label>
               <div className="relative">
                  <Ruler className="absolute top-3.5 left-3 w-5 h-5 text-neutral-400" />
                  <input 
                    required
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-3 border border-neutral-300 focus:border-black focus:outline-none"
                    placeholder="e.g. 5,000"
                  />
               </div>
            </div>
         </div>

         <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white font-heavy uppercase py-4 text-lg tracking-widest hover:bg-neutral-800 transition-colors mt-4 disabled:opacity-70"
         >
            {isSubmitting ? 'Analyzing...' : 'Find My Expert'}
         </button>
      </form>
    </div>
  );

  // NEW STEP 4: Success / Match
  const renderSuccess = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-black text-white p-8 md:p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-white"></div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-block p-4 rounded-full bg-white text-black mb-6 animate-bounce">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-3xl md:text-5xl font-heavy uppercase mb-4">Match Identified</h3>
        <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
          Thank you, {formData.name}. We have identified <strong>3 experts</strong> in the alliance who specialize in converting 
          <span className="text-white font-bold mx-1 border-b border-white">{buildingType}</span> 
          spaces for 
          <span className="text-white font-bold mx-1 border-b border-white">{goal === 'revenue' ? 'max revenue' : goal === 'community' ? 'community activation' : 'rapid occupancy'}</span>.
        </p>
        
        <div className="bg-neutral-900 p-6 border border-neutral-800 mb-8">
           <p className="text-sm text-neutral-400 uppercase tracking-widest font-bold mb-2">What happens next?</p>
           <p className="text-white">We have sent your property details to these experts. Expect an introduction via email within 24 hours.</p>
        </div>

        <button onClick={resetTool} className="text-sm text-neutral-500 hover:text-white underline">
           Start New Search
        </button>
      </div>
    </div>
  );

  return (
    <section id="expert-tool" className="py-24 bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
            Interactive Tool
          </span>
          <h2 className="text-4xl font-heavy uppercase">Find Your Expert</h2>
        </div>
        
        <div className="bg-white shadow-2xl border border-neutral-100 p-6 md:p-12 min-h-[400px] flex flex-col justify-center relative">
           {/* Progress Bar */}
           <div className="absolute top-0 left-0 h-1 bg-neutral-100 w-full">
              <div 
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
           </div>

           {step === 1 && renderStep1()}
           {step === 2 && renderStep2()}
           {step === 3 && renderStep3()}
           {step === 4 && renderSuccess()}
        </div>
      </div>
    </section>
  );
};

export default FindExpertTool;
