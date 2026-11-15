import React, { useEffect, useState } from 'react';
import '../App.css';

/* A strip under the bar while the connection is down. */
const OfflineNotice = () => {
    const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
    useEffect(() => {
        const on = () => setOffline(false);
        const off = () => setOffline(true);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);
    if (!offline) return null;
    return (
        <p className="offline" role="status">
            <span className="wrap">No signal. You're seeing the films and reviews this device has saved; the rest returns when you're back online.</span>
        </p>
    );
};

export default OfflineNotice;
