import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/HomepageUniversity.css";

const courses = [
  {
    acronym: "BSA",
    fullname: "Bachelor of Science in Accountancy",
    desc: "Develop expertise in financial reporting, auditing, taxation, and accounting principles for business and government.",
    image: "/assets/BSA.jpg"
  },
  {
    acronym: "BSBA",
    fullname: "Bachelor of Science in Business Administration",
    desc: "Gain a solid foundation in management, marketing, finance, and entrepreneurship to lead organizations effectively.",
    image: "/assets/BSBA.jpg"
  },
  {
    acronym: "BSHM",
    fullname: "Bachelor of Science in Hospitality Management",
    desc: "Prepare for careers in hotels, restaurants, tourism, and events with hands-on training and industry exposure.",
    image: "/assets/BSHM.jpeg"
  },
  {
    acronym: "BSCS",
    fullname: "Bachelor of Science in Computer Science",
    desc: "Master algorithms, software engineering, artificial intelligence, and systems design for the tech industry.",
    image: "/assets/BSCS.jpg"
  },
  {
    acronym: "BSIT",
    fullname: "Bachelor of Science in Information Technology",
    desc: "Build skills in networking, web development, database management, and IT infrastructure for modern organizations.",
    image: "/assets/BSIT.jpg"
  },
];

export default function HomepageUniversity() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="onlium-root">

      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>

        {/* CENTER: nav links */}
        <ul className="nav-links">
          <li><a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a></li>
          <li><a href="#courses" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }}>Courses</a></li>
          <li><a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a></li>
        </ul>

        {/* RIGHT: action buttons */}
        <div className="nav-actions">
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Log in as moderator
          </button>
          <button className="btn-solid" onClick={() => navigate("/register/create")}>
            ENROLL NOW
          </button>
        </div>

      
      </nav>

      <section id="home" className="hero">
        <div className="hero-content">
          <img src="/assets/onliumlogobluematch.png" alt="ONL Logo" className="hero-logo" />
          <h1>Enroll in School<br />the Smart Way</h1>
          <p>
            Start your journey towards a brighter future. Join our school today and
            take the first step towards success with a simple and fast enrollment process.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate("/register/create")}>GET STARTED <span>→</span></button>
            <button className="btn-hero-outline" onClick={() => navigate("/login")}>Log in as moderator</button>
          </div>
        </div>
      </section>

      <div id="courses" className="section-card">
        <h2>Enroll in Onlium the Smart Way</h2>
        <p className="section-subtitle">Choose your college program and take the first step toward your future career.</p>

        <div className="courses-grid">
          {courses.map((course, i) => (
            <div className="course-card" key={i}>
              <div className="course-acronym">{course.acronym}</div>
              <div className="course-fullname">{course.fullname}</div>
              <div className="course-content">
                <img src={course.image} alt={course.acronym} className="course-image" />
                <p className="course-desc">{course.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section id="about" className="section-card-about">
        <h2>About Onlium</h2>
        <p className="section-subtitle">Learn more about our mission and features.</p>

        <div className="about-grid">
          <div className="about-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2544d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </div>
          <div className="about-text">
            Onlium is a centralized online enrollment platform designed to make the enrollment process 
            simpler, faster, and more transparent for students and administrators. Say goodbye to long queues, 
            repeated campus visits, and scattered academic information — Onlium brings everything you need 
            into one place, from enrollment and study loads to school bulletins and LMS access. Built with 
            students in mind, Onlium is here to make your academic journey smoother, wherever you are.
          </div>
          <div className="about-features">
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>Fast Enrollment</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>Study Load Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>School Bulletins</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>LMS Access</span>
            </div>
          </div>
        </div>
      </section>

      <div className="page-bottom" />
    </div>
  );
}