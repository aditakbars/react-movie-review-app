import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../App.css';

const month = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });

const NavBar = () => (
    <header className="bar">
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="wrap bar__inner">
            <Link to="/" className="bar__brand">Adit's Cinema</Link>
            <span className="bar__issue">Programme for {month}</span>
            <nav aria-label="Main">
                <ul className="bar__links">
                    <li><NavLink to="/" end>Programme</NavLink></li>
                    <li><NavLink to="/reviews">Reviews</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>
                </ul>
            </nav>
        </div>
    </header>
);

export default NavBar;
