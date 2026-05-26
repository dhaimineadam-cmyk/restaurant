import React from "react";
import "./Footer.css";
import logo from "../Images/Achrafpro.jpg.jpeg";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-section">
          <h4>Restaurant</h4>
          <ul>
            <li><a href="/about">A propos de nous</a></li>
            <li><a href="/careers">Carrieres</a></li>
            <li><a href="/privacy-policy">Politique de confidentialite</a></li>
            <li><a href="/terms">Conditions d'utilisation</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li><a href="/contact">Contactez-nous</a></li>
            <li><a href="/support">Support</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Suivez-nous</h4>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Nos developpeurs</h4>
          <div className="developers flex flex-row gap-x-6 items-center justify-center mt-4">
            <div className="developer flex flex-col items-center">
              <a href="https://www.linkedin.com/in/achraf-fellah-1005012b7" target="_blank" rel="noopener noreferrer">
                <img src={logo} alt="Achraf Fellah" className="developer-image" />
              </a>
              <p>Achraf Fellah</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
