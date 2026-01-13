import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Building, MapPin, Globe, Image as ImageIcon, Clock, Users } from 'lucide-react';

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'password' | 'profile' | 'complete'>('password');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [profileData, setProfileData] = useState({
        spaceName: '',
        spaceAddress: '',
        website: '',
        description: '',
        imageUrl: '',
        phone: '',
        hours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '10:00', close: '15:00', closed: false },
            sunday: { open: '10:00', close: '15:00', closed: true }
        },
        amenities: [] as string[],
        vibe: '',
        neighborhood: ''
    });

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            // If user already has a password, skip to profile step
            setStep('profile');

            // Pre-fill data from contacts table if available
            const { data: contact } = await supabase
                .from('contacts')
                .select('*')
                .eq('email', user.email)
                .maybeSingle();

            if (contact) {
                setProfileData(prev => ({
                    ...prev,
                    spaceName: contact.space_name || '',
                    spaceAddress: '' // Will be filled by user
                }));
            }
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.password !== passwordData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        if (passwordData.password.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.password
            });

            if (error) throw error;

            setStep('profile');
        } catch (error: any) {
            console.error('Password setup error:', error);
            alert(error.message || 'Failed to set password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!user) throw new Error('No user found');

            // 1. Create the space
            const { data: spaceData, error: spaceError } = await supabase
                .from('spaces')
                .insert([
                    {
                        name: profileData.spaceName,
                        address: profileData.spaceAddress,
                        website: profileData.website,
                        description: profileData.description,
                        image_url: profileData.imageUrl,
                        phone: profileData.phone,
                        hours: profileData.hours,
                        amenities: profileData.amenities,
                        vibe: profileData.vibe,
                        neighborhood: profileData.neighborhood,
                        owner_id: user.id,
                        status: 'active'
                    }
                ])
                .select()
                .single();

            if (spaceError) throw spaceError;

            // 2. Update user profile with space_id
            const { data: contactData } = await supabase
                .from('contacts')
                .select('*')
                .eq('email', user.email)
                .maybeSingle();

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    space_id: spaceData.id,
                    role_in_company: contactData?.role_in_company || 'Owner'
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 3. Update contact tags
            await supabase
                .from('contacts')
                .update({
                    user_id: user.id,
                    tags: ['active_member', 'onboarded']
                })
                .eq('email', user.email);

            setStep('complete');
        } catch (error: any) {
            console.error('Profile setup error:', error);
            alert(error.message || 'Failed to create profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAmenity = (amenity: string) => {
        setProfileData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const commonAmenities = [
        'WiFi', 'Coffee', 'Parking', 'Conference Rooms',
        'Phone Booths', 'Kitchen', 'Printing', '24/7 Access',
        'Mail Service', 'Event Space', 'Outdoor Area', 'Bike Storage'
    ];

    if (step === 'complete') {
        return (
            <div className="min-h-screen bg-white pt-32 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-green-600 text-white rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-5xl md:text-7xl font-heavy uppercase mb-6">Welcome Aboard!</h1>
                <p className="text-xl text-neutral-600 max-w-2xl mb-12 leading-relaxed">
                    Your space profile has been created successfully.<br />
                    You're now part of the Denver Coworks Alliance!
                </p>
                <button
                    onClick={() => navigate('/spaces')}
                    className="bg-black text-white px-10 py-4 font-bold uppercase hover:bg-neutral-800 tracking-widest"
                >
                    Explore Spaces
                </button>
            </div>
        );
    }

    if (step === 'password') {
        return (
            <div className="min-h-screen bg-neutral-50 pt-32 px-6 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 shadow-lg">
                    <h1 className="text-3xl font-heavy uppercase mb-4">Set Your Password</h1>
                    <p className="text-neutral-600 mb-8">
                        Create a secure password for your account.
                    </p>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Password</label>
                            <input
                                required
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                                placeholder="Minimum 8 characters"
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Confirm Password</label>
                            <input
                                required
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                                placeholder="Re-enter your password"
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white font-heavy uppercase py-4 tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Setting Password...' : 'Continue'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Profile step
    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 md:p-12 shadow-lg">
                    <h1 className="text-4xl font-heavy uppercase mb-4">Complete Your Space Profile</h1>
                    <p className="text-neutral-600 mb-8">
                        Tell us about your coworking space so members can discover you.
                    </p>

                    <form onSubmit={handleProfileSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold uppercase text-neutral-800">Basic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                                        <Building className="inline w-4 h-4 mr-2" />
                                        Space Name
                                    </label>
                                    <input
                                        required
                                        value={profileData.spaceName}
                                        onChange={(e) => setProfileData({ ...profileData, spaceName: e.target.value })}
                                        className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                                        placeholder="Denver Creative Hub"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                                        <MapPin className="inline w-4 h-4 mr-2" />
                                        Address
                                    </label>
                                    <input
                                        required
                                        value={profileData.spaceAddress}
                                        onChange={(e) => setProfileData({ ...profileData, spaceAddress: e.target.value })}
                                        className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                                        placeholder="123 Main St, Denver, CO 80202"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                                        <Globe className="inline w-4 h-4 mr-2" />
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={profileData.website}
                                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                        className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                                        placeholder="https://yourspace.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                                        <ImageIcon className="inline w-4 h-4 mr-2" />
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={profileData.imageUrl}
                                        onChange={(e) => setProfileData({ ...profileData, imageUrl: e.target.value })}
                                        className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={profileData.description}
                                    onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                                    className="w-full p-4 bg-white border border-neutral-300 font-medium focus:border-black focus:outline-none transition-colors"
                                    placeholder="Tell us about your space, what makes it unique..."
                                />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold uppercase text-neutral-800">
                                <Users className="inline w-6 h-6 mr-2" />
                                Amenities
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {commonAmenities.map(amenity => (
                                    <button
                                        key={amenity}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`p-3 border-2 font-medium transition-all ${profileData.amenities.includes(amenity)
                                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                : 'border-neutral-300 hover:border-neutral-400'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white font-heavy uppercase py-5 text-lg tracking-widest hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
