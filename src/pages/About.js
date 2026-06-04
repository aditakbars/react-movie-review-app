import '../App.css';
import { FaInstagram, FaLinkedin, FaYoutube, FaSpotify, FaGithub } from 'react-icons/fa';
import { SiLetterboxd } from "react-icons/si";
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    return (
        <div>
            <NavBar />
            <main>
                <div className="about-layout">
                    <div className="about-content">
                        <article className="card" id='about'>
                            <h2>About This Website</h2>
                            <p>
                                Welcome to my movie review website! This platform is built with React and follows
                                Progressive Web App (PWA) standards. It uses the TMDb API to show real-time
                                info on currently playing movies, trending films, and lets you search an
                                extensive movie database.
                            </p>
                            <p>
                                Compared to an earlier version built with plain HTML and CSS, this version
                                introduces dynamic features and a more seamless experience thanks to React.
                            </p>
                            <p>
                                This site is a casual passion project — a love letter to cinema, built one
                                component at a time. If you're curious about the person behind the pixels,
                                check out the social links!
                            </p>
                        </article>
                    </div>

                    <div className="about-sidebar">
                        <div className="profile-card">
                            <h2>🎬</h2>
                            <img
                                className="profile-img"
                                src="https://storage.googleapis.com/profile-page-nih.appspot.com/profile.png"
                                alt="Adit Akbars"
                            />
                            <p style={{ margin: 0, fontFamily: 'Inter', fontSize: '0.95em', color: '#b0c0d0', textAlign: 'center', textIndent: 0 }}>
                                Adit Akbars
                            </p>
                        </div>

                        <article className="card" id="socmed">
                            <div id="socmed-icon">
                                <a href="https://instagram.com/adit.akbarr" target="_blank" rel='noreferrer' title="Instagram">
                                    <FaInstagram size={28} />
                                </a>
                                <a href="https://linkedin.com/in/aditakbars" target="_blank" rel='noreferrer' title="LinkedIn">
                                    <FaLinkedin size={28} />
                                </a>
                                <a href="https://www.youtube.com/channel/UCJCjiREopSD0-Av186mz_yA" target="_blank" rel='noreferrer' title="YouTube">
                                    <FaYoutube size={28} />
                                </a>
                                <a href="https://sptfy.com/inimah" target="_blank" rel='noreferrer' title="Spotify">
                                    <FaSpotify size={28} />
                                </a>
                                <a href="https://letterboxd.com/aditjh/" target="_blank" rel='noreferrer' title="Letterboxd">
                                    <SiLetterboxd size={28} />
                                </a>
                                <a href="https://github.com/aditakbars" target="_blank" rel='noreferrer' title="GitHub">
                                    <FaGithub size={28} />
                                </a>
                            </div>
                        </article>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default About;
