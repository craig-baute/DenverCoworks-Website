import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { CheckCircle, XCircle, Clock, Mail, Building, MapPin, User, Briefcase, FileText, Calendar } from 'lucide-react';

interface PendingApplication {
    id: string;
    space_name: string;
    space_address: string;
    applicant_name: string;
    applicant_email: string;
    role_in_company: 'Owner' | 'Manager';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    approved_at?: string;
    approved_by?: string;
    rejection_reason?: string;
    notes?: string;
}

interface ApplicationsManagerProps {
    adminId: string;
}

const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({ adminId }) => {
    const [applications, setApplications] = useState<PendingApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedApp, setSelectedApp] = useState<PendingApplication | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('pending_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            alert('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (applicationId: string) => {
        if (!confirm('Are you sure you want to approve this application? This will send a welcome email to the applicant.')) {
            return;
        }

        setIsProcessing(true);
        try {
            // Update notes if provided
            if (notes) {
                await supabase
                    .from('pending_applications')
                    .update({ notes })
                    .eq('id', applicationId);
            }

            // Call the approve-application Edge Function
            const { data, error } = await supabase.functions.invoke('approve-application', {
                body: {
                    applicationId,
                    adminId
                }
            });

            if (error) throw error;

            alert('Application approved! Welcome email sent to applicant.');
            setSelectedApp(null);
            setNotes('');
            fetchApplications();
        } catch (error: any) {
            console.error('Error approving application:', error);
            alert(error.message || 'Failed to approve application');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (applicationId: string) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        if (!confirm('Are you sure you want to reject this application?')) {
            return;
        }

        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('pending_applications')
                .update({
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                    notes: notes || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', applicationId);

            if (error) throw error;

            alert('Application rejected');
            setSelectedApp(null);
            setNotes('');
            setRejectionReason('');
            fetchApplications();
        } catch (error: any) {
            console.error('Error rejecting application:', error);
            alert(error.message || 'Failed to reject application');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300'
        };

        const icons = {
            pending: <Clock className="w-4 h-4" />,
            approved: <CheckCircle className="w-4 h-4" />,
            rejected: <XCircle className="w-4 h-4" />
        };

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold uppercase border-2 ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]}
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-3xl font-heavy uppercase mb-4">Alliance Applications</h2>
                <p className="text-neutral-600 mb-6">
                    Review and manage membership applications from coworking space operators.
                </p>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-neutral-200">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 font-bold uppercase text-sm transition-colors ${filter === f
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-neutral-500 hover:text-black'
                                }`}
                        >
                            {f}
                            {f !== 'all' && (
                                <span className="ml-2 bg-neutral-200 px-2 py-1 rounded-full text-xs">
                                    {applications.filter(a => a.status === f).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-500 text-lg">No {filter !== 'all' ? filter : ''} applications found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-white border-2 border-neutral-200 p-6 rounded-lg hover:border-black transition-colors cursor-pointer"
                            onClick={() => setSelectedApp(app)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">{app.space_name}</h3>
                                        {getStatusBadge(app.status)}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-600">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{app.applicant_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{app.applicant_email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{app.space_address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{app.role_in_company}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-neutral-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(app.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {app.notes && (
                                <div className="mt-3 p-3 bg-neutral-50 rounded border-l-4 border-blue-500">
                                    <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 mt-1 text-blue-600" />
                                        <div>
                                            <p className="text-xs font-bold uppercase text-neutral-500 mb-1">Notes</p>
                                            <p className="text-sm text-neutral-700">{app.notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {app.rejection_reason && (
                                <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-500">
                                    <div className="flex items-start gap-2">
                                        <XCircle className="w-4 h-4 mt-1 text-red-600" />
                                        <div>
                                            <p className="text-xs font-bold uppercase text-neutral-500 mb-1">Rejection Reason</p>
                                            <p className="text-sm text-neutral-700">{app.rejection_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-neutral-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-heavy uppercase mb-2">{selectedApp.space_name}</h3>
                                    {getStatusBadge(selectedApp.status)}
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedApp(null);
                                        setNotes('');
                                        setRejectionReason('');
                                    }}
                                    className="text-neutral-500 hover:text-black"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-500 mb-1">Applicant Name</p>
                                    <p className="text-lg font-medium">{selectedApp.applicant_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-500 mb-1">Email</p>
                                    <p className="text-lg font-medium">{selectedApp.applicant_email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-500 mb-1">Role</p>
                                    <p className="text-lg font-medium">{selectedApp.role_in_company}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-neutral-500 mb-1">Submitted</p>
                                    <p className="text-lg font-medium">{formatDate(selectedApp.created_at)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase text-neutral-500 mb-1">Space Address</p>
                                <p className="text-lg font-medium">{selectedApp.space_address}</p>
                            </div>

                            {selectedApp.status === 'pending' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-neutral-500 mb-2 block">
                                            Admin Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full p-3 border border-neutral-300 rounded focus:border-black focus:outline-none"
                                            rows={3}
                                            placeholder="Add any notes about this application..."
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(selectedApp.id)}
                                            disabled={isProcessing}
                                            className="flex-1 bg-green-600 text-white px-6 py-3 font-bold uppercase hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            {isProcessing ? 'Processing...' : 'Approve Application'}
                                        </button>
                                    </div>

                                    <div className="border-t border-neutral-200 pt-4">
                                        <label className="text-xs font-bold uppercase text-neutral-500 mb-2 block">
                                            Rejection Reason (Required to Reject)
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full p-3 border border-neutral-300 rounded focus:border-black focus:outline-none mb-3"
                                            rows={2}
                                            placeholder="Explain why this application is being rejected..."
                                        />
                                        <button
                                            onClick={() => handleReject(selectedApp.id)}
                                            disabled={isProcessing || !rejectionReason.trim()}
                                            className="w-full bg-red-600 text-white px-6 py-3 font-bold uppercase hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            {isProcessing ? 'Processing...' : 'Reject Application'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {selectedApp.status === 'approved' && selectedApp.approved_at && (
                                <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                                    <p className="text-sm text-green-800">
                                        <strong>Approved on:</strong> {formatDate(selectedApp.approved_at)}
                                    </p>
                                </div>
                            )}

                            {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                                <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
                                    <p className="text-xs font-bold uppercase text-neutral-500 mb-2">Rejection Reason</p>
                                    <p className="text-sm text-red-800">{selectedApp.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationsManager;
