import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Footer = () => (
    <footer className="colophon">
        <div className="wrap colophon__inner">
            <p className="colophon__mark">Adit's Cinema</p>
            <ul className="colophon__links">
                <li><Link to="/">Films</Link></li>
                <li><Link to="/reviews">Reviews</Link></li>
                <li><Link to="/diary">Diary</Link></li>
                <li><Link to="/about">About</Link></li>
            </ul>
            <p className="colophon__note">
                Hand-painted, more or less. Reviews by Adit Akbars, © 2026. Film data and images from TMDb;
                this site is not endorsed or certified by TMDb. Streaming listings by JustWatch. Diary from Letterboxd.
            </p>
        </div>
    </footer>
);

export default Footer;
