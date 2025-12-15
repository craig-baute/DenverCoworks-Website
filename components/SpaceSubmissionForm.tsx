import React, { useState } from 'react';
import { useData, Space } from './DataContext';
import { useAuth } from './AuthContext';
import { Loader2, Upload, X, Check, Image as ImageIcon, AlertTriangle, Plus } from 'lucide-react';

interface SpaceSubmissionFormProps {
    onSuccess: () => void;
}

const SpaceSubmissionForm: React.FC<SpaceSubmissionFormProps> = ({ onSuccess }) => {
    const { user } = useAuth();
    const { addSpace, uploadFile, neighborhoods, addNeighborhood } = useData();

    const [formData, setFormData] = useState({
        name: '',
        neighborhood: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        vibe: '',
        description: '',
        website: '',
        amenities: [] as string[],
        images: [] as string[],
        imageUrl: ''
    });

    const [amenityInput, setAmenityInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Anti-Spam
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [touched, setTouched] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNeighborhood = async () => {
        const name = prompt("Enter new neighborhood name:");
        if (name) {
            await addNeighborhood(name);
        }
    };

    const addAmenity = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && amenityInput.trim()) {
            e.preventDefault();
            setFormData(prev => ({
                ...prev,
                amenities: [...(prev.amenities || []), amenityInput.trim()]
            }));
            setAmenityInput('');
        }
    };

    const removeAmenity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            amenities: (prev.amenities || []).filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if ((formData.images?.length || 0) + files.length > 10) {
            setError("Maximum 10 images allowed.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const newUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const url = await uploadFile(files[i]);
                newUrls.push(url);
            }

            setFormData(prev => ({
                ...prev,
                imageUrl: prev.images?.length === 0 ? newUrls[0] : (prev.imageUrl || newUrls[0]), // First image is main
                images: [...(prev.images || []), ...newUrls]
            }));

        } catch (err: any) {
            console.error("Upload failed", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = (prev.images || []).filter((_, i) => i !== index);
            return {
                ...prev,
                images: newImages,
                imageUrl: index === 0 && newImages.length > 0 ? newImages[0] : (newImages.length === 0 ? '' : prev.imageUrl!)
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Simple verification
        if (captchaAnswer !== '5') {
            setError("Please solve the math problem to prove you are human.");
            return;
        }

        if (!formData.name || !formData.neighborhood || !formData.addressStreet || !formData.addressCity || !formData.addressState || !formData.addressZip) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Construct display address
        const fullAddress = [
            formData.addressStreet,
            formData.addressCity,
            formData.addressState,
            formData.addressZip
        ].filter(Boolean).join(', ');

        try {
            await addSpace({
                name: formData.name!,
                neighborhood: formData.neighborhood!,
                address: fullAddress,
                vibe: formData.vibe || 'Community Focused',
                imageUrl: formData.imageUrl || '',
                description: formData.description,
                images: formData.images,
                website: formData.website,
                amenities: formData.amenities,
                ownerId: user.id,
                status: 'pending',
                addressStreet: formData.addressStreet,
                addressCity: formData.addressCity,
                addressState: formData.addressState,
                addressZip: formData.addressZip
            });
            onSuccess();
        } catch (err: any) {
            setError("Failed to submit space. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 border border-neutral-200 shadow-xl rounded-lg animate-fade-in-up">
            <h2 className="text-3xl font-heavy uppercase mb-6">List Your Space</h2>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-8 text-sm text-blue-800 flex items-start">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p>
                    Your submission will be reviewed by an administrator. Once approved, it will be publicly visible on the Denver Coworks Alliance website.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold uppercase mb-2">Space Name *</label>
                        <input
                            name="name"
                            required
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                            placeholder="e.g. The Hive Denver"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold uppercase mb-2">Neighborhood *</label>
                        <div className="flex gap-2">
                            <select
                                name="neighborhood"
                                required
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                                value={formData.neighborhood}
                                onChange={handleInputChange}
                            >
                                <option value="" disabled>Select Neighborhood</option>
                                {neighborhoods.map(n => (
                                    <option key={n.id} value={n.name}>{n.name}</option>
                                ))}
                            </select>
                            <button type="button" onClick={handleAddNeighborhood} className="bg-neutral-100 border border-neutral-300 px-3 rounded hover:bg-neutral-200 text-xs font-bold uppercase" title="Add Neighborhood">
                                +
                            </button>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Street Address *</label>
                                <input
                                    name="addressStreet"
                                    required
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                                    placeholder="123 Larimer St"
                                    value={formData.addressStreet}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">City *</label>
                                <input
                                    name="addressCity"
                                    required
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                                    placeholder="Denver"
                                    value={formData.addressCity}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">State *</label>
                                <input
                                    name="addressState"
                                    required
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                                    placeholder="CO"
                                    value={formData.addressState}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Zip Code *</label>
                                <input
                                    name="addressZip"
                                    required
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                                    placeholder="80202"
                                    value={formData.addressZip}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold uppercase mb-2">Website</label>
                        <input
                            name="website"
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                            placeholder="https://..."
                            value={formData.website}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold uppercase mb-2">Vibe</label>
                        <select
                            name="vibe"
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors appearance-none"
                            value={formData.vibe}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a Vibe...</option>
                            <option value="Industrial Chic">Industrial Chic</option>
                            <option value="Artistic & Raw">Artistic & Raw</option>
                            <option value="Luxury Professional">Luxury Professional</option>
                            <option value="Startup Energy">Startup Energy</option>
                            <option value="Quiet Focus">Quiet Focus</option>
                            <option value="Community Focused">Community Focused</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold uppercase mb-2">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                        placeholder="Tell us about your space..."
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Amenities */}
                <div>
                    <label className="block text-sm font-bold uppercase mb-2">Amenities</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.amenities?.map((amenity, i) => (
                            <span key={i} className="bg-neutral-200 text-xs font-bold uppercase px-2 py-1 rounded flex items-center">
                                {amenity}
                                <button type="button" onClick={() => removeAmenity(i)} className="ml-2 text-neutral-500 hover:text-black">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded focus:border-black outline-none transition-colors"
                        placeholder="Type amenity and press Enter (e.g. WiFi, Coffee)"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyDown={addAmenity}
                    />
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-bold uppercase mb-2">Photos (Up to 10)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images?.map((url, i) => (
                            <div key={i} className="aspect-square relative group bg-neutral-100 border border-neutral-200 rounded overflow-hidden">
                                <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-4 h-4 text-red-500" />
                                </button>
                                {i === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] uppercase font-bold text-center py-1">
                                        Main Photo
                                    </div>
                                )}
                            </div>
                        ))}

                        {(formData.images?.length || 0) < 10 && (
                            <label className="aspect-square border-2 border-dashed border-neutral-300 rounded cursor-pointer hover:border-black hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center text-neutral-400 hover:text-black">
                                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                                <span className="text-xs font-bold uppercase mt-2">Add Photo</span>
                                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
                            </label>
                        )}
                    </div>
                </div>

                {/* Anti-Spam */}
                <div className="p-4 bg-neutral-100 rounded border border-neutral-200">
                    <label className="block text-sm font-bold uppercase mb-2">Security Check: What is 2 + 3?</label>
                    <input
                        className="w-20 p-2 border border-neutral-300 rounded text-center font-bold"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="?"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="pt-6 border-t border-neutral-200">
                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="w-full bg-black text-white py-4 font-heavy uppercase tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>Submit Space for Approval <Check className="ml-2 w-5 h-5" /></>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default SpaceSubmissionForm;
