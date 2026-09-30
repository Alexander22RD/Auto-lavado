document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. VARIABLES & ELEMENT SELECTION
       ========================================================================== */
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Gallery elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    
    // Booking Form & Modal elements
    const bookingForm = document.getElementById('booking-form');
    const dateInput = document.getElementById('date');
    const bookingModal = document.getElementById('booking-modal');
    const modalSummary = document.getElementById('modal-summary');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const myBookingsList = document.getElementById('my-bookings-list');
    
    // Testimonials Carousel elements
    const reviewsTrack = document.getElementById('reviews-track');
    const reviewSlides = document.querySelectorAll('.review-slide');
    const prevReviewBtn = document.getElementById('prev-review');
    const nextReviewBtn = document.getElementById('next-review');
    
    // Pre-fill service buttons
    const serviceReserveBtns = document.querySelectorAll('.service-link');

    /* ==========================================================================
       2. HEADER SCROLL & MOBILE NAVIGATION
       ========================================================================== */
    // Change header appearance on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile nav menu toggle
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Active link highlighting via Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '-80px 0px -20% 0px',
        threshold: 0.15
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('section').forEach(section => observer.observe(section));


    /* ==========================================================================
       3. PRE-FILL SERVICE SELECTOR FROM CARD CLICK
       ========================================================================== */
    serviceReserveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedService = btn.getAttribute('data-service');
            const serviceSelect = document.getElementById('service');
            
            if (selectedService && serviceSelect) {
                serviceSelect.value = selectedService;
            }
        });
    });


    /* ==========================================================================
       4. GALLERY FILTERS & LIGHTBOX MODAL
       ========================================================================== */
    // Category filtering logic
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and add to clicked
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // Add fade-out visual class for animation, then hide
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hide');
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.classList.add('hide');
                    }, 300);
                }
            });
        });
    });

    // Lightbox open
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const imgAlt = item.querySelector('img').alt;
            
            lightboxImg.src = imgSrc;
            lightboxImg.alt = imgAlt;
            lightbox.classList.add('active');
        });
    });

    // Lightbox close helpers
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeBookingModal();
        }
    });


    /* ==========================================================================
       5. TESTIMONIALS CAROUSEL
       ========================================================================== */
    let currentReviewIndex = 0;
    const reviewCount = reviewSlides.length;

    const updateCarousel = () => {
        reviewsTrack.style.transform = `translateX(-${currentReviewIndex * 100}%)`;
    };

    const nextSlide = () => {
        currentReviewIndex = (currentReviewIndex + 1) % reviewCount;
        updateCarousel();
    };

    const prevSlide = () => {
        currentReviewIndex = (currentReviewIndex - 1 + reviewCount) % reviewCount;
        updateCarousel();
    };

    // Auto-advance every 6 seconds
    let autoPlayInterval = setInterval(nextSlide, 6000);

    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 6000);
    };

    nextReviewBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    prevReviewBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });


    /* ==========================================================================
       6. APPOINTMENT SYSTEM (CITAS) & LOCALSTORAGE
       ========================================================================== */
    // Set date input min value to tomorrow to prevent booking in the past
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowISO = tomorrow.toISOString().split('T')[0];
    dateInput.min = tomorrowISO;
    dateInput.value = tomorrowISO; // Pre-select tomorrow by default

    // Helper: Load bookings from LocalStorage
    const getBookings = () => {
        const bookings = localStorage.getItem('apex_bookings');
        return bookings ? JSON.parse(bookings) : [];
    };

    // Helper: Save bookings to LocalStorage
    const saveBookings = (bookings) => {
        localStorage.setItem('apex_bookings', JSON.stringify(bookings));
    };

    // Render bookings dashboard
    const renderBookings = () => {
        const bookings = getBookings();
        myBookingsList.innerHTML = '';

        if (bookings.length === 0) {
            myBookingsList.innerHTML = `<p class="text-muted" style="font-size: 0.9rem; font-style: italic;">No tiene citas agendadas actualmente.</p>`;
            return;
        }

        bookings.forEach(booking => {
            
            // Format Date for cleaner display (es-ES)
            const dateParts = booking.date.split('-');
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

            const card = document.createElement('div');
            card.className = 'booking-item-card';
            card.innerHTML = `
                <div class="booking-item-details">
                    <h5>${booking.service}</h5>
                    <p><i class="fa-solid fa-car-side" style="margin-right: 4px;"></i> ${booking.vehicle}</p>
                    <p><i class="fa-solid fa-calendar" style="margin-right: 4px;"></i> ${formattedDate} a las ${booking.time}</p>
                </div>
                <button class="cancel-booking-btn" data-id="${booking.id}" title="Cancelar esta cita" aria-label="Cancelar esta cita">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            myBookingsList.appendChild(card);
        });

        // Add event listeners to newly generated Cancel buttons
        const cancelButtons = myBookingsList.querySelectorAll('.cancel-booking-btn');
        cancelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = btn.getAttribute('data-id');
                cancelBooking(bookingId);
            });
        });
    };

    // Cancel appointment
    const cancelBooking = (id) => {
        if (confirm('¿Está seguro de que desea cancelar su cita programada?')) {
            let bookings = getBookings();
            bookings = bookings.filter(b => b.id !== id);
            saveBookings(bookings);
            renderBookings();
        }
    };

    // Close Booking Confirmation Modal
    const closeBookingModal = () => {
        bookingModal.classList.remove('active');
    };

    modalCloseBtn.addEventListener('click', closeBookingModal);
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });

    // Form Submission & Validation Handler
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Custom validation check
        const inputs = bookingForm.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = 'var(--glass-border)';
            }
        });

        // Email regex check
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailRegex.test(emailInput.value)) {
            isValid = false;
            emailInput.style.borderColor = '#ef4444';
            alert('Por favor ingrese un correo electrónico válido.');
            return;
        }

        if (!isValid) {
            alert('Por favor complete todos los campos obligatorios indicados con (*).');
            return;
        }

        // Gather form fields
        const bookingData = {
            id: 'BK-' + Math.floor(Math.random() * 900000 + 100000), // Random unique reference id
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: emailInput.value.trim(),
            vehicle: document.getElementById('vehicle').value.trim(),
            service: document.getElementById('service').value,
            date: dateInput.value,
            time: document.getElementById('time').value,
            notes: document.getElementById('notes').value.trim(),
            timestamp: new Date().toISOString()
        };

        // Save appointment to LocalStorage
        const bookings = getBookings();
        bookings.push(bookingData);
        saveBookings(bookings);

        // Update dashboard view immediately
        renderBookings();

        // Format Date for summary
        const dateParts = bookingData.date.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

        // Populate Booking Confirmation Modal
        modalSummary.innerHTML = `
            <div class="summary-row">
                <span class="summary-label">Ref. de Reserva:</span>
                <span class="summary-value" style="color: var(--accent-color);">${bookingData.id}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Cliente:</span>
                <span class="summary-value">${bookingData.name}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Vehículo:</span>
                <span class="summary-value">${bookingData.vehicle}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Servicio:</span>
                <span class="summary-value">${bookingData.service}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Fecha:</span>
                <span class="summary-value">${formattedDate}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Hora:</span>
                <span class="summary-value">${bookingData.time}</span>
            </div>
        `;

        // Open Confirmation Modal
        bookingModal.classList.add('active');

        // Reset form to defaults
        bookingForm.reset();
        dateInput.value = tomorrowISO; // Reset date back to tomorrow
    });

    // Render bookings initially on load
    renderBookings();
});
