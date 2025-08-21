import React, { useEffect } from 'react';

const AdsenseWidget: React.FC = () => {
    useEffect(() => {
        try {
            // The `adsbygoogle` object is loaded from the script in index.html
            // We push an empty object to this array to tell AdSense to initialize an ad unit.
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
            console.error("Adsense error: ", e);
        }
    }, []);

    return (
        <div className="my-4 text-center">
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-0776870820469795"
                data-ad-slot="7322087591"
                data-ad-format="autorelaxed"
                data-full-width-responsive="true"></ins>
        </div>
    );
};

export default AdsenseWidget;
