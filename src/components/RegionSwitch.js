import React from 'react';
import { REGIONS, useRegion } from '../region';
import '../App.css';

/* Two painted tabs: whose cinemas, ratings and streaming services to show. */
const RegionSwitch = ({ label = 'Listings for' }) => {
    const [region, setRegion] = useRegion();
    return (
        <div className="region" role="group" aria-label={label}>
            <span className="region__label" aria-hidden="true">{label}</span>
            {Object.values(REGIONS).map((r) => (
                <button key={r.code} type="button" aria-pressed={region === r.code} onClick={() => setRegion(r.code)}>
                    {r.short}
                </button>
            ))}
        </div>
    );
};

export default RegionSwitch;
