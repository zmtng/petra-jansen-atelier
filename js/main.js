window.initAppLogic = () => {
    
    // ==========================================
    // 1. SCROLL-ANIMATIONEN & OBSERVER
    // ==========================================
    const slides = document.querySelectorAll('.presentation-slide');
    
    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const theme = entry.target.getAttribute('data-theme');
                if (theme) document.body.className = `scroll-snap-container ${theme}`;

                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.3 }); // Löst schon aus, wenn das Bild zu 30% sichtbar ist

    slides.forEach(slide => slideObserver.observe(slide));
    if(slides.length > 0) slides[0].classList.add('is-visible');

    // ==========================================
    // 2. STRIKTE 1-SLIDE-PRO-SCROLL LOGIK
    // ==========================================
    const container = document.querySelector('.scroll-snap-container');
    // Die Variable window.isScrollLogicActive verhindert, dass das Skript doppelt lädt
    if (container && slides.length > 0 && !window.isScrollLogicActive) {
        window.isScrollLogicActive = true;
        let currentSlideIndex = 0;
        let isAnimating = false;
        
        slides.forEach((slide, index) => {
            const rect = slide.getBoundingClientRect();
            if (rect.top >= -50 && rect.top <= 50) currentSlideIndex = index;
        });

        const goToSlide = (index) => {
            if (index < 0 || index >= slides.length) return;
            isAnimating = true;
            currentSlideIndex = index;
            slides[index].scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { isAnimating = false; }, 500);
        };

        window.addEventListener('wheel', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) return;
            e.preventDefault();
            if (isAnimating) return;
            if (e.deltaY > 0) goToSlide(currentSlideIndex + 1);
            else if (e.deltaY < 0) goToSlide(currentSlideIndex - 1);
        }, { passive: false });

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
            if (diff > 50) goToSlide(currentSlideIndex + 1);
            else if (diff < -50) goToSlide(currentSlideIndex - 1);
        });
    }

    // ==========================================
    // 3. LIGHTBOX LOGIK (Vergrößern bei Klick)
    // ==========================================
    if (!window.isLightboxActive) {
        window.isLightboxActive = true;
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.lightbox-close');

        if (lightbox) {
            // "Event Delegation": Erlaubt das Klicken auf Bilder, auch wenn sie aus einer Datenbank kommen!
            document.body.addEventListener('click', (e) => {
                const item = e.target.closest('.insta-item, .artwork-card, .gallery-showcase-item');
                if (item) {
                    const fullImageUrl = item.getAttribute('data-full');
                    
                    if (lightboxImg) lightboxImg.src = fullImageUrl;
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

// Startet die Logik automatisch, AUßER auf der Galerie-Seite (da warten wir auf Firebase)
document.addEventListener('DOMContentLoaded', () => {
    if (!window.delayInit) {
        window.initAppLogic();
    }
});