import '../App.css';
import { FaInstagram, FaLinkedin, FaYoutube, FaSpotify, FaGithub } from 'react-icons/fa';
import { SiLetterboxd } from 'react-icons/si';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTitle } from '../hooks';

const LINKS = [
    { href: 'https://letterboxd.com/aditjh/', label: 'Letterboxd', Icon: SiLetterboxd },
    { href: 'https://instagram.com/adit.akbarr', label: 'Instagram', Icon: FaInstagram },
    { href: 'https://linkedin.com/in/aditakbars', label: 'LinkedIn', Icon: FaLinkedin },
    { href: 'https://www.youtube.com/channel/UCJCjiREopSD0-Av186mz_yA', label: 'YouTube', Icon: FaYoutube },
    { href: 'https://sptfy.com/inimah', label: 'Spotify', Icon: FaSpotify },
    { href: 'https://github.com/aditakbars', label: 'GitHub', Icon: FaGithub },
];

const About = () => {
    useTitle('About');
    return (
    <div>
        <NavBar />
        <main id="main" className="wrap">
            <article className="profile">
                <div className="profile__photo">
                    <img src="/images/adit-akbars.webp" srcSet="/images/adit-akbars-600.webp 600w, /images/adit-akbars.webp 900w" sizes="(max-width: 1023px) 300px, 360px" width="900" height="1200" fetchpriority="high" alt="Adit Akbars" />
                </div>
                <div className="profile__text">
                    <h1>About this cinema</h1>
                    <div className="prose">
                        <p>
                            Adit's Cinema is a one-person passion project: my reviews, set beside live listings from the
                            TMDb API for what's showing, what opens soon and what audiences rate highest. It's built in
                            React and replaces an older version I wrote in plain HTML and CSS.
                        </p>
                        <p>The person behind the programme is easiest to find here:</p>
                    </div>
                    <ul className="elsewhere">
                        {LINKS.map(({ href, label, Icon }) => (
                            <li key={label}>
                                <a href={href} target="_blank" rel="noreferrer"><Icon aria-hidden="true" /> {label}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </article>
        </main>
        <Footer />
    </div>
);
};

export default About;
