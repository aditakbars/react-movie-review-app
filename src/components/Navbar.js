import React from 'react';
import { Link } from 'react-router-dom';
import "../App.css";

const NavBar = () => {
    return (
        <nav>
        <ul>
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/">REVIEWS</Link></li>
            <li><Link to="/about">ABOUT</Link></li>
        </ul>
        </nav>
    );
}

export default NavBar;