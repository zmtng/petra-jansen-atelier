// Wir packen die Logik in eine globale Funktion (window.initAppLogic), 
// damit wir sie manuell aufrufen können, sobald Firebase die Bilder geladen hat.
window.initAppLogic = () => {
    
    // ==========================================
    // 1. SCROLL-PRÄSENTATIONS-LOGIK
    // ==========================================
    const slides = document.querySelectorAll('.presentation-slide');
    
    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.5 
    };

    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const theme = entry.target.getAttribute('data-theme');
                if (theme) {
                    document.body.className = `scroll-snap-container ${theme}`;
                }
                // Aktiviere die Text/Bild-Animation für diesen Slide
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    // Observer auf alle (auch die neu geladenen) Slides anwenden
    slides.forEach(slide => {
        slideObserver.observe(slide);
    });

    if(slides.length > 0) {
        slides[0].classList.add('is-visible');
    }

    // --- STRIKTE 1-SLIDE-PRO-SCROLL LOGIK ---
    const container = document.querySelector('.scroll-snap-container');
    if (container && slides.length > 0) {
        let currentSlideIndex = 0;
        let isAnimating = false;
        const lightbox = document.getElementById('lightbox');

        const goToSlide = (index) => {
            if (index < 0 || index >= slides.length) return;
            isAnimating = true;
            currentSlideIndex = index;
            slides[index].scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { isAnimating = false; }, 1000);
        };

        // Bestehende Event Listener entfernen, falls Funktion nach Datenbank-Laden doppelt aufgerufen wird
        window.onwheel = null;
        window.ontouchstart = null;
        window.ontouchmove = null;
        window.ontouchend = null;

        window.onwheel = (e) => {
            if (lightbox && lightbox.classList.contains('active')) return;
            e.preventDefault();
            if (isAnimating) return;
            if (e.deltaY > 0) goToSlide(currentSlideIndex + 1);
            else if (e.deltaY < 0) goToSlide(currentSlideIndex - 1);
        };

        let touchStartY = 0;
        window.ontouchstart = (e) => { touchStartY = e.touches[0].clientY; };
        window.ontouchmove = (e) => { 
            if (lightbox && lightbox.classList.contains('active')) return;
            e.preventDefault(); 
        };
        window.ontouchend = (e) => {
            if (lightbox && lightbox.classList.contains('active')) return;
            if (isAnimating) return;
            const diff = touchStartY - e.changedTouches[0].clientY;
            if (diff > 50) goToSlide(currentSlideIndex + 1);
            else if (diff < -50) goToSlide(currentSlideIndex - 1);
        };
    }

    // ==========================================
    // 2. LIGHTBOX LOGIK
    // ==========================================
    // Sucht jetzt auch die neu geladenen Bilder (.gallery-showcase-item)
    const galleryItems = document.querySelectorAll('.insta-item, .artwork-card, .gallery-showcase-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && galleryItems.length > 0) {
        // Alte Listener entfernen (Klon-Trick), um doppelte Klicks zu vermeiden
        galleryItems.forEach(oldItem => {
            const item = oldItem.cloneNode(true);
            if (oldItem.parentNode) {
                oldItem.parentNode.replaceChild(item, oldItem);
            }
            
            item.addEventListener('click', () => {
                const fullImageUrl = item.getAttribute('data-full');
            
                if (lightboxImg) {
                    lightboxImg.src = fullImageUrl;
                }
                lightbox.classList.add('active');
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            setTimeout(() => { if(lightboxImg) lightboxImg.src = ''; }, 300);
        };

        if(closeBtn) closeBtn.onclick = closeLightbox;
        
        lightbox.onclick = (e) => {
            if (e.target === lightbox) closeLightbox();
        };

        document.onkeydown = (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        };
    }
};

// ==========================================
// 3. SEITEN-START LOGIK
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Startseiten, Kontakt etc. starten die Logik sofort.
    // In der galerie.html haben wir <script>window.delayInit = true;</script> gesetzt.
    // Daher wartet die Galerie ab jetzt, bis Firebase fertig ist und ruft initAppLogic() dann manuell auf.
    if (!window.delayInit) {
        window.initAppLogic();
    }
});