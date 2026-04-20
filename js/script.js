// ============ MOBILE MENU ============
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("active");
}

// Close menu when a link is clicked
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("navLinks").classList.remove("active");
  });
});

// ============ SMOOTH SCROLLING ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============ FORM HANDLING ============
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const students = document.getElementById('students').value;
    const message = document.getElementById('message').value.trim();
    
    // Enhanced validation
    if (!name || !email || !phone || !students) {
      showFormStatus('Please fill all required fields', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormStatus('Please enter a valid email address', 'error');
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9\s\-\+\(\)]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      showFormStatus('Please enter a valid phone number', 'error');
      return;
    }
    
    // Simulate form submission
    showFormStatus('Submitting your request...', 'info');
    
    setTimeout(() => {
      showFormStatus('✓ Thank you! Our team will contact you within 24 hours.', 'success');
      contactForm.reset();
      
      // Optional: Log form data (for backend integration)
      console.log('Form submitted:', {
        name, email, phone, students, message,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  });
}

function showFormStatus(message, type) {
  const formStatus = document.getElementById('formStatus');
  if (formStatus) {
    formStatus.textContent = message;
    formStatus.className = 'form-note ' + type;
    
    // Auto-hide success messages after 4 seconds
    if (type === 'success') {
      setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'form-note';
      }, 4000);
    }
  }
}

// ============ NAVBAR EFFECTS ============
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
    } else {
      navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      navbar.style.backgroundColor = 'white';
    }
  }
});

// ============ SCROLL ANIMATIONS ============
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .module-card, .testimonial-card, .stat').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ============ CTA BUTTON TRACKING ============
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    // Log CTA interactions
    console.log('CTA clicked:', {
      text: this.textContent,
      href: this.href || 'no link',
      timestamp: new Date().toISOString()
    });
  });
});

// ============ INITIALIZE ON LOAD ============
document.addEventListener('DOMContentLoaded', function() {
  console.log('Campus Logic ERP - Ready to enhance your school operations!');
  
  // Check form visibility
  if (document.getElementById('contactForm')) {
    console.log('Contact form is ready');
  }
});