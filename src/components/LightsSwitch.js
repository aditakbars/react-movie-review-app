import React, { useEffect, useState } from 'react';

const KEY = 'adits-cinema-theme';
const BAR_COLOUR = { dark: '#15110e', light: '#c8281d' };

const currentTheme = () =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

/* House lights: up = light theme (the daytime billboard wall), down = the cinema at night. */
const LightsSwitch = () => {
    const [theme, setTheme] = useState(currentTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', BAR_COLOUR[theme]);
        try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode: still switches */ }
    }, [theme]);

    const toggle = () => {
        const root = document.documentElement;
        root.classList.add('theme-fade');
        setTheme((t) => (t === 'light' ? 'dark' : 'light'));
        window.setTimeout(() => root.classList.remove('theme-fade'), 460);
    };

    const up = theme === 'light';
    return (
        <button type="button" role="switch" aria-checked={up} className="lights" onClick={toggle}
            title={up ? 'Dim the house lights' : 'Raise the house lights'}>
            <span className="lights__track" aria-hidden="true"><span className="lights__knob" /></span>
            <span className="lights__label">House lights</span>
        </button>
    );
};

export default LightsSwitch;
