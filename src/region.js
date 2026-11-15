import { useEffect, useState } from 'react';

/*
  Which country's listings to show: cinemas, opening dates, age ratings and
  streaming services all follow it. Indonesia by default; remembered per device.
*/
export const REGIONS = {
    ID: { code: 'ID', name: 'Indonesia', short: 'Indonesia', board: 'LSF' },
    US: { code: 'US', name: 'the United States', short: 'United States', board: 'MPA' },
};
const KEY = 'adits-cinema-region';
const EVENT = 'adits-cinema-region';

const read = () => {
    try { const r = localStorage.getItem(KEY); return REGIONS[r] ? r : 'ID'; } catch (e) { return 'ID'; }
};

export const useRegion = () => {
    const [region, setState] = useState(read);
    useEffect(() => {
        const sync = () => setState(read());
        window.addEventListener(EVENT, sync);
        window.addEventListener('storage', sync);
        return () => { window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync); };
    }, []);
    const setRegion = (r) => {
        try { localStorage.setItem(KEY, r); } catch (e) { /* private mode */ }
        setState(r);
        window.dispatchEvent(new Event(EVENT));
    };
    return [region, setRegion];
};

/* The age rating and cinema release date for a region, from TMDb's release_dates. */
export const regionalRelease = (movie, region) => {
    const all = movie?.release_dates?.results || [];
    const pick = (code) => {
        const dates = all.find((r) => r.iso_3166_1 === code)?.release_dates || [];
        const theatrical = dates.filter((d) => d.type === 2 || d.type === 3).sort((a, b) => a.release_date.localeCompare(b.release_date))[0];
        return { cert: dates.find((d) => d.certification)?.certification || null, date: theatrical?.release_date?.slice(0, 10) || null };
    };
    const here = pick(region);
    const fallback = region === 'US' ? here : pick('US');
    return {
        date: here.date,
        cert: here.cert || fallback.cert,
        certRegion: here.cert ? region : fallback.cert ? 'US' : null,
    };
};
