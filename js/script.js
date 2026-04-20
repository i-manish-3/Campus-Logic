const navLinks = document.getElementById('navLinks');
const menuToggle = document.getElementById('menuToggle');

function closeMenu() {
  if (!navLinks || !menuToggle) {
    return;
  }

  navLinks.classList.remove('active');
  menuToggle.classList.remove('is-active');
  menuToggle.setAttribute('aria-expanded', 'false');
}

function openMenu() {
  if (!navLinks || !menuToggle) {
    return;
  }

  navLinks.classList.add('active');
  menuToggle.classList.add('is-active');
  menuToggle.setAttribute('aria-expanded', 'true');
}

function toggleMenu() {
  if (!navLinks || !menuToggle) {
    return;
  }

  if (navLinks.classList.contains('active')) {
    closeMenu();
    return;
  }

  openMenu();
}

if (menuToggle) {
  menuToggle.addEventListener('click', toggleMenu);
}

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

document.addEventListener('click', (event) => {
  if (!navLinks || !menuToggle || window.innerWidth > 768) {
    return;
  }

  const clickedInsideMenu = navLinks.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggle) {
    closeMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const students = document.getElementById('students').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !phone || !students) {
      showFormStatus('Please fill all required fields', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormStatus('Please enter a valid email address', 'error');
      return;
    }

    const phoneRegex = /^[0-9\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      showFormStatus('Please enter a valid phone number', 'error');
      return;
    }

    showFormStatus('Submitting your request...', 'info');

    setTimeout(() => {
      showFormStatus('Thank you! Our team will contact you within 24 hours.', 'success');
      contactForm.reset();

      console.log('Form submitted:', {
        name,
        email,
        phone,
        students,
        message,
        timestamp: new Date().toISOString(),
      });
    }, 1500);
  });
}

function showFormStatus(message, type) {
  const formStatus = document.getElementById('formStatus');

  if (!formStatus) {
    return;
  }

  formStatus.textContent = message;
  formStatus.className = `form-note ${type}`;

  if (type === 'success') {
    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-note';
    }, 4000);
  }
}

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');

  if (!navbar) {
    return;
  }

  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
  } else {
    navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
  }
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.feature-card, .module-card, .testimonial-card, .stat').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', function () {
    console.log('CTA clicked:', {
      text: this.textContent,
      href: this.href || 'no link',
      timestamp: new Date().toISOString(),
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('Campus Logic ERP - Ready to enhance your school operations!');

  if (document.getElementById('contactForm')) {
    console.log('Contact form is ready');
  }
});
