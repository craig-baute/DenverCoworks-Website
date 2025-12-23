
import React, { useEffect } from 'react';
import { supabase } from './supabase';

const AnalyticsLoader: React.FC = () => {
    useEffect(() => {
        const fetchAnalyticsAndLoad = async () => {
            try {
                const { data, error } = await supabase
                    .from('admin_tokens')
                    .select('ga4_measurement_id, clarity_project_id')
                    .eq('token_type', 'site_config')
                    .maybeSingle();

                if (error || !data) return;

                // 1. Load GA4
                if (data.ga4_measurement_id && !document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${data.ga4_measurement_id}"]`)) {
                    const gaScript = document.createElement('script');
                    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${data.ga4_measurement_id}`;
                    gaScript.async = true;
                    document.head.appendChild(gaScript);

                    const gaInit = document.createElement('script');
                    gaInit.innerHTML = `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${data.ga4_measurement_id}');
                    `;
                    document.head.appendChild(gaInit);
                }

                // 2. Load Microsoft Clarity
                if (data.clarity_project_id && !document.querySelector(`script[src*="clarity.ms/tag/"]`)) {
                    const clarityScript = document.createElement('script');
                    clarityScript.innerHTML = `
                        (function(c,l,a,r,i,t,y){
                            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                        })(window, document, "clarity", "script", "${data.clarity_project_id}");
                    `;
                    document.head.appendChild(clarityScript);
                }
            } catch (err) {
                console.error('Failed to load Analytics scripts:', err);
            }
        };

        fetchAnalyticsAndLoad();
    }, []);

    return null;
};

export default AnalyticsLoader;
