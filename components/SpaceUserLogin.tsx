import React, { useState } from 'react';
import { supabase } from './supabase';
import { User, Mail, Lock, Loader2, ArrowRight, UserPlus, Building, Globe, MapPin, Sparkles } from 'lucide-react';

interface SpaceUserLoginProps {
    onLoginSuccess: () => void;
    mode?: 'login' | 'signup';
}

const SpaceUserLogin: React.FC<SpaceUserLoginProps> = ({ onLoginSuccess, mode: initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Your Name
    const [spaceName, setSpaceName] = useState('');
    const [spaceUrl, setSpaceUrl] = useState('');
    const [spaceAddress, setSpaceAddress] = useState('');
    const [spaceVibe, setSpaceVibe] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { data, error: signupError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                            space_name: spaceName,
                            space_url: spaceUrl,
                            space_address: spaceAddress,
                            space_vibe: spaceVibe,
                            role: 'space_user'
                        }
                    }
                });
                if (signupError) throw signupError;

                if (data.user) {
                    // Create a profile record
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                full_name: name,
                                email: email,
                                role: 'space_user'
                            }
                        ]);
                    if (profileError) console.error('Error creating profile:', profileError);

                    // Trigger the notification function immediately
                    await supabase.functions.invoke('handle-space-submission', {
                        body: {
                            name: spaceName,
                            neighborhood: 'TBD',
                            address: spaceAddress,
                            vibe: spaceVibe,
                            imageUrl: '',
                            description: `Initial signup from ${name}.`,
                            website: spaceUrl,
                            amenities: [],
                            ownerId: data.user.id,
                            userEmail: email
                        }
                    });

                    setMessage("Account created! Please check your email to confirm your account.");
                    setMode('login');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                if (data.user) {
                    onLoginSuccess();
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] max-w-md mx-auto p-6">
            <div className="w-full bg-white border border-neutral-200 shadow-xl p-8 rounded-lg relative overflow-hidden">

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-heavy uppercase tracking-tight mb-2">
                        {mode === 'login' ? 'Space Partner Login' : 'Join the Alliance'}
                    </h2>
                    <p className="text-neutral-500">
                        {mode === 'login'
                            ? 'Manage your space listings and profile.'
                            : 'Create an account to list your space.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {mode === 'signup' && (
                        <>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-neutral-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Building className="absolute left-3 top-3.5 text-neutral-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Space Name"
                                    value={spaceName}
                                    onChange={(e) => setSpaceName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3.5 text-neutral-400 w-5 h-5" />
                                <input
                                    type="url"
                                    placeholder="Space URL / Website"
                                    value={spaceUrl}
                                    onChange={(e) => setSpaceUrl(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 text-neutral-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Space Address"
                                    value={spaceAddress}
                                    onChange={(e) => setSpaceAddress(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Sparkles className="absolute left-3 top-3.5 text-neutral-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Vibe of the Space (e.g. Gritty, Modern)"
                                    value={spaceVibe}
                                    onChange={(e) => setSpaceVibe(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-neutral-400 w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-neutral-400 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold uppercase py-4 rounded hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-neutral-100">
                    <p className="text-neutral-600 text-sm mb-2">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-black font-bold uppercase text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
                    >
                        {mode === 'login' ? (
                            <><UserPlus className="w-4 h-4" /> Create Space Partner Account</>
                        ) : (
                            'Sign In to Existing Account'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SpaceUserLogin;
