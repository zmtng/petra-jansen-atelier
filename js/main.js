/**
 * main.js - Optimierte Steuerung für Art by Petra Jansen
 * Unterstützt dynamisches Nachladen von Inhalten (Firebase)
 */

window.initAppLogic = () => {
    
    // ==========================================
    // 1. THEME & SICHTBARKEIT (OBSERVER)
    // ==========================================
    // Ein einziger Observer für alle jetzigen und zukünftigen Slides
    if (!window.globalSlideObserver) {
        window.globalSlideObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const theme = entry.target.getAttribute('data-theme');
                    if (theme) {
                        document.body.className = `scroll-snap-container ${theme}`;
                    }
                    // Slide sichtbar machen (Animation)
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.4 });
    }

    // Funktion, um neue Slides zu registrieren
    const refreshObservers = () => {
        const allSlides = document.querySelectorAll('.presentation-slide');
        allSlides.forEach(slide => window.globalSlideObserver.observe(slide));
        
        // Ersten Slide sofort aktivieren
        if (allSlides.length > 0 && !allSlides[0].classList.contains('is-visible')) {
            allSlides[0].classList.add('is-visible');
        }
    };

    refreshObservers();

    // ==========================================
    // 2. SCROLL-STEUERUNG (REAKTIV)
    // ==========================================
    const container = document.querySelector('.scroll-snap-container');
    
    if (container && !window.isScrollLogicActive) {
        window.isScrollLogicActive = true;
        let currentSlideIndex = 0;
        let isAnimating = false;

        // Hilfsfunktion: Findet heraus, welcher Slide gerade wirklich im Blickfeld ist
        const updateIndexFromScroll = () => {
            const currentSlides = document.querySelectorAll('.presentation-slide');
            currentSlides.forEach((slide, index) => {
                const rect = slide.getBoundingClientRect();
                if (rect.top >= -window.innerHeight / 2 && rect.top <= window.innerHeight / 2) {
                    currentSlideIndex = index;
                }
            });
        };

        const goToSlide = (index) => {
            const currentSlides = document.querySelectorAll('.presentation-slide');
            if (index < 0 || index >= currentSlides.length) return;
            
            isAnimating = true;
            currentSlideIndex = index;
            
            currentSlides[index].scrollIntoView({ behavior: 'smooth' });
            
            // Verhindert zu schnelles Scrollen
            setTimeout(() => { isAnimating = false; }, 800);
        };

        // Mausrad-Event
        window.addEventListener('wheel', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) return;
            
            e.preventDefault();
            if (isAnimating) return;
            
            updateIndexFromScroll();
            if (e.deltaY > 0) {
                goToSlide(currentSlideIndex + 1);
            } else if (e.deltaY < 0) {
                goToSlide(currentSlideIndex - 1);
            }
        }, { passive: false });

        // Touch-Event (Handy)
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) return;
            e.preventDefault(); 
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) return;
            if (isAnimating) return;
            
            const diff = touchStartY - e.changedTouches[0].clientY;
            updateIndexFromScroll();
            
            if (diff > 50) {
                goToSlide(currentSlideIndex + 1);
            } else if (diff < -50) {
                goToSlide(currentSlideIndex - 1);
            }
        });
    }

    // ==========================================
    // 3. LIGHTBOX (EVENT DELEGATION)
    // ==========================================
    if (!window.isLightboxActive) {
        window.isLightboxActive = true;
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.lightbox-close');

        if (lightbox) {
            // Wir hören auf Klicks im gesamten Dokument (Delegation)
            document.body.addEventListener('click', (e) => {
                const item = e.target.closest('.gallery-showcase-item, .insta-item, .artwork-card');
                if (item) {
                    const fullUrl = item.getAttribute('data-full');
                    if (lightboxImg) lightboxImg.src = fullUrl;
                    lightbox.classList.add('active');
                }
            });

            const closeLightbox = () => {
                lightbox.classList.remove('active');
                setTimeout(() => { if(lightboxImg) lightboxImg.src = ''; }, 300);
            };

            if (closeBtn) closeBtn.onclick = closeLightbox;
            lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
            document.onkeydown = (e) => { if (e.key === 'Escape') closeLightbox(); };
        }
    }
};

// Start-Trigger
document.addEventListener('DOMContentLoaded', () => {
    // Wenn delayInit aktiv ist, wartet die Seite (Galerie), 
    // ansonsten (Home/Kontakt) startet sie sofort.
    if (!window.delayInit) {
        window.initAppLogic();
    }
});