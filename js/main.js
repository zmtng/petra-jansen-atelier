document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SCROLL-PRÄSENTATIONS-LOGIK (NEU)
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

    // --- NEU: STRIKTE 1-SLIDE-PRO-SCROLL LOGIK ---
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
                
                // Cooldown: Verhindert Mehrfach-Sprünge (1000ms passend zur Scrollzeit)
                setTimeout(() => { isAnimating = false; }, 1000);
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
    // 2. LIGHTBOX LOGIK (BLEIBT ERHALTEN)
    // ==========================================
    const galleryItems = document.querySelectorAll('.insta-item, .artwork-card, .gallery-showcase-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const fullImageUrl = item.getAttribute('data-full');
                let titleText = '';
                
                if (item.classList.contains('insta-item')) {
                // Logik für alte Galerie-Seite (Falls noch irgendwo verwendet)
                titleText = item.querySelector('.artwork-title').innerText;
            } else if (item.classList.contains('artwork-card')) {
                // Logik für Startseite
                titleText = item.querySelector('.artwork-info h3').innerText;
            } else if (item.classList.contains('gallery-showcase-item')) {
                // Logik für NEUE Scroll-Galerie-Seite
                titleText = item.querySelector('.gallery-title').innerText;
            }

            // Lightbox befüllen und öffnen
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
)})}})
