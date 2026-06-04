import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import "../App.css";

const NavBar = () => {
    return (
        <nav>
            <div className="nav-inner">
                <Link to="/" className="nav-brand">🎬 Adit's Cinema</Link>
                <ul>
                    <li><NavLink to="/" end>Home</NavLink></li>
                    <li><NavLink to="/reviews">Reviews</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;
