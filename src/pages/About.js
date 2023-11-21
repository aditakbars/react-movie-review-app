import '../App.css';

import { FaInstagram, FaLinkedin, FaYoutube, FaSpotify, FaGithub } from 'react-icons/fa';
import { SiLetterboxd } from "react-icons/si";

//Component
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    return (
        <div>
        <NavBar/>
            <main>
                <div id="content">
                    <article className="card" id='about'>
                    <h2>About This Website</h2>
                    <p>
                        Welcome to my movie review website! This platform is crafted using the power of React and adheres to the Progressive Web App (PWA) standards. 
                        Utilizing the robust capabilities of the TMDb API (The Movie Database), this website provides real-time information on currently playing movies, trending films, 
                        and allows you to explore an extensive database for your favorite titles.
                        In contrast to my earlier version built with good old HTML and CSS, this iteration marks a significant upgrade. 
                        The adoption of React not only enhances the user interface but also introduces dynamic functionalities, making the overall experience more seamless.
                    </p>
                    <p>
                        Ok, So this site? Yeah, it's just a casual passion project.
                        But if you're curious about the person behind the pixels, check out those social media icons below (or on the right).
                        Let's stay cool and connected!
                    </p>
                    </article>
                </div>
                <aside>
                    <article className="card-profile">
                    <header>
                        <h2>🎬</h2>
                        <article className="moviecard" id="profile-pic">
                            <div className="postercard">
                            <img src="https://storage.googleapis.com/profile-page-nih.appspot.com/profile.png" alt="profile"/>
                            </div>
                        </article>
                    </header>
                    </article>
                    <article className="card" id="socmed">
                        <div className="box-0-0-1 row-0-0-4 icons-0-0-779" id="socmed-icon">
                            <a href="https://instagram.com/adit.akbarr" target="_blank" rel='noreferrer'>
                                <FaInstagram size={30}/>
                            </a>
                            <a href="https://linkedin.com/in/aditakbars" target="_blank" rel='noreferrer'>
                                <FaLinkedin size={30}/>
                            </a>
                            <a href="https://www.youtube.com/channel/UCJCjiREopSD0-Av186mz_yA" target="_blank" rel='noreferrer'>
                                <FaYoutube size={30}/>
                            </a>
                                <a href="https://sptfy.com/inimah" target="_blank" rel='noreferrer'>
                                <FaSpotify size={30}/>
                            </a>
                            <a href="https://letterboxd.com/aditjh/" target="_blank" rel='noreferrer'>
                                <SiLetterboxd size={30}/>
                            </a>
                            <a href="https://github.com/aditakbars" target="_blank" rel='noreferrer'>
                                <FaGithub size={30}/>
                            </a>
                        </div>
                    </article>
                </aside>
            </main>
        <Footer/>
        </div>
    );
};

export default About;