import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

declare global {
    interface Window {
        google: any;
    }
}

const GoogleMapsLoader: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchAndLoadMaps = async () => {
            if (window.google?.maps) {
                setIsLoaded(true);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('admin_tokens')
                    .select('google_maps_api_key')
                    .eq('token_type', 'google_oauth')
                    .maybeSingle();

                if (error || !data || !data.google_maps_api_key) {
                    console.warn('Google Maps API Key not found in database settings.');
                    return;
                }

                const key = data.google_maps_api_key;

                // Check if script already exists
                if (document.querySelector(`script[src*="maps.googleapis.com"]`)) return;

                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    setIsLoaded(true);
                    // Dispatch custom event for components waiting for maps
                    window.dispatchEvent(new Event('google-maps-loaded'));
                };
                document.head.appendChild(script);
            } catch (err) {
                console.error('Failed to load Google Maps script:', err);
            }
        };

        fetchAndLoadMaps();
    }, []);

    return null; // This component doesn't render anything UI-wise
};

export default GoogleMapsLoader;
