import './Footer.css'

function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-top">
        <div className="footer-column">
          <h4>POPULAR LOCATIONS</h4>
          <ul>
            <li>Kolkata</li>
            <li>Mumbai</li>
            <li>Chennai</li>
            <li>Pune</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>TRENDING LOCATIONS</h4>
          <ul>
            <li>Bhubaneshwar</li>
            <li>Hyderabad</li>
            <li>Chandigarh</li>
            <li>Nashik</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>ABOUT US</h4>
          <ul>
            <li>Contact Us</li>
            <li>Careers</li>
            <li>OLX People</li>
            <li>Waah Jobs</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>OLX</h4>
          <ul>
            <li>Help</li>
            <li>Sitemap</li>
            <li>Legal & Privacy information</li>
            <li>Vulnerability Disclosure Program</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <span>Help - Sitemap</span>
          <span>All rights reserved © 2006-2026 OLX</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
