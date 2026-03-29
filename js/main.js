document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // SCROLL-PRÄSENTATIONS-LOGIK
    // ==========================================
    const slides = document.querySelectorAll('.presentation-slide');
    
    // Optionen für unseren Beobachter (Observer)
    const observerOptions = {
        root: null, // beobachtet im gesamten Fenster
        rootMargin: '0px',
        threshold: 0.5 // Feuert, wenn 50% der Folie sichtbar sind
    };

    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Welches Theme hat der aktuelle Slide?
                const theme = entry.target.getAttribute('data-theme');
                
                // Ändere die Klasse des Body (das animiert den Farbverlauf!)
                document.body.className = `scroll-snap-container ${theme}`;
                
                // Aktiviere die Text-Animation für diesen Slide
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    // Observer auf alle Slides anwenden
    slides.forEach(slide => {
        slideObserver.observe(slide);
    });

    // Mach den ersten Slide sofort sichtbar (sonst greift die Animation beim Laden nicht richtig)
    if(slides.length > 0) {
        slides[0].classList.add('is-visible');
    }

    // --- STRIKTE 1-SLIDE-PRO-SCROLL LOGIK ---
        const container = document.querySelector('.scroll-snap-container');
        if (container && slides.length > 0) {
            let currentSlideIndex = 0;
            let isAnimating = false;
            const lightbox = document.getElementById('lightbox');

            // Finde den aktuell sichtbaren Slide beim Laden
            slides.forEach((slide, index) => {
                const rect = slide.getBoundingClientRect();
                if (rect.top >= -10 && rect.top <= 10) {
                    currentSlideIndex = index;
                }
            });

            const goToSlide = (index) => {
                if (index < 0 || index >= slides.length) return;
                isAnimating = true;
                currentSlideIndex = index;
                
                slides[index].scrollIntoView({ behavior: 'smooth' });
                
                // Cooldown: Verhindert Mehrfach-Sprünge 
                setTimeout(() => { isAnimating = false; }, 500);
            };

            // Mausrad-Scrollen abfangen
            window.addEventListener('wheel', (e) => {
                // Nicht blockieren, wenn Lightbox offen ist
                if (lightbox && lightbox.classList.contains('active')) return;
                
                e.preventDefault(); // Stoppt das standardmäßige, freie Scrollen
                
                if (isAnimating) return;

                if (e.deltaY > 0) {
                    goToSlide(currentSlideIndex + 1); // Runter scrollen
                } else if (e.deltaY < 0) {
                    goToSlide(currentSlideIndex - 1); // Hoch scrollen
                }
            }, { passive: false });

            // Touch-Wischen (Smartphones) abfangen
            let touchStartY = 0;
            window.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (lightbox && lightbox.classList.contains('active')) return;
                e.preventDefault(); // Stoppt freies Scrollen am Handy
            }, { passive: false });

            window.addEventListener('touchend', (e) => {
                if (lightbox && lightbox.classList.contains('active')) return;
                if (isAnimating) return;
                
                const touchEndY = e.changedTouches[0].clientY;
                const diff = touchStartY - touchEndY;

                if (diff > 50) {
                    goToSlide(currentSlideIndex + 1); // Wisch nach oben -> Nächster Slide
                } else if (diff < -50) {
                    goToSlide(currentSlideIndex - 1); // Wisch nach unten -> Vorheriger Slide
                }
            });
        }


    // ==========================================
    // LIGHTBOX LOGIK
    // ==========================================
    const galleryItems = document.querySelectorAll('.insta-item, .artwork-card, .gallery-showcase-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const fullImageUrl = item.getAttribute('data-full');
                
            // Lightbox befüllen und öffnen
            if (lightboxImg) {
                lightboxImg.src = fullImageUrl;
            }
            lightbox.classList.add('active');
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    };

    closeBtn.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
