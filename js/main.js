// Wir packen die Logik in eine globale Funktion, damit wir sie 
// neu starten können, nachdem Firebase die Bilder geladen hat.
window.initAppLogic = () => {
    
    // ==========================================
    // SCROLL-PRÄSENTATIONS-LOGIK
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
                document.body.className = `scroll-snap-container ${theme}`;
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

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

        // Bestehende Event Listener entfernen, falls Funktion doppelt aufgerufen wird
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
    // LIGHTBOX LOGIK
    // ==========================================
    const galleryItems = document.querySelectorAll('.insta-item, .artwork-card, .gallery-showcase-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && galleryItems.length > 0) {
        // Alte Listener entfernen (Klon-Trick), um doppelte Klicks zu vermeiden
        galleryItems.forEach(oldItem => {
            const item = oldItem.cloneNode(true);
            oldItem.parentNode.replaceChild(item, oldItem);
            
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

// Standard-Start für alle normalen Seiten (Startseite, Kontakt, etc.)
document.addEventListener('DOMContentLoaded', () => {
    // Wenn 'delayInit' true ist (wie in der Galerie), startet das Skript erst später manuell
    if (!window.delayInit) {
        window.initAppLogic();
    }
});