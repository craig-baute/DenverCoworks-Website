import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import SpaceSubmissionForm from './SpaceSubmissionForm';
import { Plus, LayoutGrid, Clock, CheckCircle, XCircle, LogOut, TrendingUp, MousePointer2, Eye } from 'lucide-react';

interface SpaceUserDashboardProps {
    onLogout: () => void;
}

const SpaceUserDashboard: React.FC<SpaceUserDashboardProps> = ({ onLogout }) => {
    const { user, profile, signOut } = useAuth();
    const { spaces } = useData();
    const [showForm, setShowForm] = useState(false);

    const isSuperAdmin = profile?.role === 'super_admin';

    const mySpaces = spaces.filter(s => s.ownerId === user?.id);

    const handleLogout = async () => {
        await signOut();
        onLogout();
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 py-4 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="font-heavy uppercase text-xl mr-2">Space Partner Portal</h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">Beta</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500 hidden md:inline">Logged in as {user?.email}</span>
                        <button onClick={handleLogout} className="text-sm font-bold uppercase hover:text-neutral-600 flex items-center">
                            <LogOut className="w-4 h-4 mr-1" /> Logout
                        </button>
                    </div>
                </div>
            </header >

            <main className="max-w-7xl mx-auto p-6">

                {!showForm ? (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-heavy uppercase">My Spaces</h2>
                                <p className="text-neutral-500">Manage your listings and view their status.</p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-black text-white px-6 py-3 font-bold uppercase rounded hover:bg-neutral-800 transition-all flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Add New Space
                            </button>
                        </div>

                        {mySpaces.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-neutral-200 rounded-lg p-12 text-center flex flex-col items-center">
                                <div className="bg-neutral-100 p-4 rounded-full mb-4">
                                    <LayoutGrid className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">No Spaces Found</h3>
                                <p className="text-neutral-500 max-w-sm mb-6">You haven't submitted any spaces yet. Click the button above to list your coworking space on the alliance.</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="text-blue-600 font-bold uppercase hover:underline"
                                >
                                    Create your first listing
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mySpaces.map(space => (
                                    <div key={space.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="h-48 relative bg-neutral-100">
                                            <img src={space.imageUrl} alt={space.name} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2">
                                                {space.status === 'approved' && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3" /> Live</span>}
                                                {space.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"><Clock className="w-3 h-3" /> Pending Review</span>}
                                                {space.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"><XCircle className="w-3 h-3" /> Rejected</span>}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold uppercase text-lg mb-1">{space.name}</h3>
                                            <p className="text-sm text-neutral-500 mb-4">{space.neighborhood}</p>

                                            {space.status === 'approved' && isSuperAdmin && (
                                                <div className="grid grid-cols-2 gap-2 mb-4 animate-fade-in">
                                                    <div className="bg-neutral-50 border border-neutral-100 p-3 rounded text-center">
                                                        <div className="flex justify-center mb-1"><Eye className="w-4 h-4 text-blue-500" /></div>
                                                        <p className="text-xl font-heavy leading-none">142</p>
                                                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 tracking-tighter">Page Views</p>
                                                    </div>
                                                    <div className="bg-neutral-50 border border-neutral-100 p-3 rounded text-center">
                                                        <div className="flex justify-center mb-1"><MousePointer2 className="w-4 h-4 text-green-500" /></div>
                                                        <p className="text-xl font-heavy leading-none">28</p>
                                                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 tracking-tighter">Web Clicks</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-400 border-t pt-4">
                                                <span>{space.address || 'Address Pending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                ) : (
                    <div>
                        <button onClick={() => setShowForm(false)} className="mb-6 flex items-center text-neutral-500 hover:text-black font-bold uppercase text-sm">
                            &larr; Back to Dashboard
                        </button>
                        <SpaceSubmissionForm onSuccess={() => setShowForm(false)} />
                    </div>
                )}

            </main>
        </div >
    );
};

export default SpaceUserDashboard;
