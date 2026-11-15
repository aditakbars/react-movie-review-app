import React, { useEffect, useState } from 'react';
import '../App.css';

/* Shown only while the sleeping reviews server wakes and nothing is cached yet. */
const WarmingUp = () => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => window.clearInterval(t);
    }, []);
    return (
        <div className="warmup" role="status" aria-live="polite">
            <div className="warmup__lamp" aria-hidden="true"><span /></div>
            <div className="warmup__text">
                <p className="warmup__title">The projectionist is warming up the lamp</p>
                <p>The reviews server naps when nobody's around and takes up to a minute to wake. This only happens on a first visit; after that, the reviews open instantly.</p>
                <p className="warmup__time num" aria-hidden="true">{seconds}s</p>
            </div>
        </div>
    );
};

export default WarmingUp;
