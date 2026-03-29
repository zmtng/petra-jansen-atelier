/**
 * main.js - Zentrale Steuerung für Art by Petra Jansen
 * Optimiert für inkrementelles Laden aus Firebase.
 */

window.initAppLogic = () => {
    
    // ==========================================
    // 1. SCROLL-ANIMATIONEN & OBSERVER
    // ==========================================
    // Wir deklarieren den Observer nur einmal global, um Performance zu sparen
    if (!window.activeSlideObserver) {
        window.activeSlideObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const theme = entry.target.getAttribute('data-theme');
                    if (theme) document.body.className = `scroll-snap-container ${theme}`;
                    
                    // Bild/Text weich einblenden
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.3 });
    }

    // Wir beobachten alle aktuell vorhandenen Slides
    const slides = document.querySelectorAll('.presentation-slide');
    slides.forEach(slide => window.activeSlideObserver.observe(slide));
    
    // Die erste Folie sofort scharf schalten
    if(slides.length > 0 && !slides[0].classList.contains('is-visible')) {
        slides[0].classList.add('is-visible');
    }

    // ==========================================
    // 2. DYNAMISCHE 1-SLIDE-PRO-SCROLL LOGIK
    // ==========================================
    const container = document.querySelector('.scroll-snap-container');
    
    if (container && slides.length > 0 && !window.isScrollLogicActive) {
        window.isScrollLogicActive = true;
        let currentSlideIndex = 0;
        let isAnimating = false;

        // Hilfsfunktion: Ermittelt die aktuell sichtbare Folie basierend auf der Scroll-Position
        const updateCurrentIndex = () => {
            const currentSlides = document.querySelectorAll('.presentation-slide');
            currentSlides.forEach((slide, index) => {
                const rect = slide.getBoundingClientRect();
                if (rect.top >= -100 && rect.top <= 100) currentSlideIndex = index;
            });
        };

        const goToSlide = (index) => {
            const currentSlides = document.querySelectorAll('.presentation-slide'); // Wichtig: Immer neu abfragen!
            if (index < 0 || index >= currentSlides.length) return;
            
            isAnimating = true;
            currentSlideIndex = index;
            currentSlides[index].scrollIntoView({ behavior: 'smooth' });
            
            setTimeout(() => { isAnimating = false; }, 1000);
        };

        // Mausrad-Steuerung
        window.addEventListener('wheel', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) return;
            
            e.preventDefault();
            if (isAnimating) return;
            
            updateCurrentIndex();
            if (e.deltaY > 0) goToSlide(currentSlideIndex + 1);
            else if (e.deltaY < 0) goToSlide(currentSlideIndex - 1);
        }, { passive: false });

        // Touch-Steuerung für Handys
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: false });
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
            updateCurrentIndex();
            if (diff > 50) goToSlide(currentSlideIndex + 1);
            else if (diff < -50) goToSlide(currentSlideIndex - 1);
        });
    }

    // ==========================================
    // 3. LIGHTBOX LOGIK (Event Delegation)
    // ==========================================
    if (!window.isLightboxActive) {
        window.isLightboxActive = true;
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');

        if (lightbox) {
            // Event Delegation: Wir hören auf Klicks im gesamten Body.
            // So funktionieren auch Bilder, die erst nach 10 Minuten geladen werden.
            document.body.addEventListener('click', (e) => {
                const item = e.target.closest('.insta-item, .artwork-card, .gallery-showcase-item');
                if (item) {
                    const fullImageUrl = item.getAttribute('data-full');
                    let titleText = '';
                    
                    // Titel aus den verschiedenen Formaten auslesen
                    const titleEl = item.querySelector('.gallery-title, .artwork-title, h3');
                    if (titleEl) titleText = titleEl.innerText;

                    if (lightboxImg) lightboxImg.src = fullImageUrl;
                    if (lightboxCaption) lightboxCaption.innerText = titleText;
                    lightbox.classList.add('active');
                }
            });

            const closeLightbox = () => {
                lightbox.classList.remove('active');
                setTimeout(() => { if(lightboxImg) lightboxImg.src = ''; }, 300);
            };

            if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
        }
    }
};

// Automatischer Start auf allen Seiten, die NICHT die Galerie sind
document.addEventListener('DOMContentLoaded', () => {
    if (!window.delayInit) {
        window.initAppLogic();
    }
});