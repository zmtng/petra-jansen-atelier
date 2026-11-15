/**
 * main.js - Optimierte Steuerung für Art by Petra Jansen
 * Unterstützt dynamisches Nachladen von Inhalten (Firebase)
 */

window.initAppLogic = () => {

    // ==========================================
    // 0. HEADER-HÖHE ALS CSS-VARIABLE
    // ==========================================
    // Der Header ist fixiert und auf dem Handy unterschiedlich hoch (die
    // Navigation bricht um). Wir schreiben die echte Höhe in --header-h,
    // damit der Ausstellungs-Hinweis auf der Startseite immer sauber darunter passt.
    const setHeaderHeight = () => {
        const header = document.querySelector('.site-header');
        if (header) {
            document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
        }
    };
    setHeaderHeight();
    if (!window.headerHeightBound) {
        window.headerHeightBound = true;
        window.addEventListener('resize', setHeaderHeight);
        window.addEventListener('load', setHeaderHeight);
    }

    // ==========================================
    // 0b. MENÜ-BUTTON FÜR DAS HANDY
    // ==========================================
    // Wird per JS eingefügt, damit nicht jede HTML-Seite angepasst werden muss.
    // Sichtbar ist er nur auf schmalen Bildschirmen (siehe CSS .nav-toggle).
    const header = document.querySelector('.site-header');
    const nav = header && header.querySelector('.main-nav');
    if (header && nav && !header.querySelector('.nav-toggle')) {
        if (!nav.id) nav.id = 'main-nav';
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-controls', nav.id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Menü öffnen');
        toggle.innerHTML = '<span></span><span></span><span></span>';
        header.insertBefore(toggle, nav);

        const setOpen = (open) => {
            header.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
            setHeaderHeight();
        };
        toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')));
        // Klick außerhalb oder Escape schließt das Menü
        document.addEventListener('click', (e) => {
            if (header.classList.contains('nav-open') && !header.contains(e.target)) setOpen(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && header.classList.contains('nav-open')) {
                setOpen(false);
                toggle.focus();
            }
        });
    }

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

        // Tastatur: Pfeiltasten, Bild auf/ab, Leertaste, Pos1/Ende
        window.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) return;
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            const t = e.target;
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

            const count = document.querySelectorAll('.presentation-slide').length;
            let target = null;
            updateIndexFromScroll();
            switch (e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    target = currentSlideIndex + 1; break;
                case ' ':
                    target = currentSlideIndex + (e.shiftKey ? -1 : 1); break;
                case 'ArrowUp':
                case 'PageUp':
                    target = currentSlideIndex - 1; break;
                case 'Home':
                    target = 0; break;
                case 'End':
                    target = count - 1; break;
                default:
                    return;
            }
            e.preventDefault();
            if (!isAnimating) goToSlide(target);
        });

        // Mit Tab angesprungene Links/Buttons in den sichtbaren Slide holen
        document.addEventListener('focusin', (e) => {
            const slide = e.target.closest && e.target.closest('.presentation-slide');
            if (!slide) return;
            const slides = [...document.querySelectorAll('.presentation-slide')];
            const index = slides.indexOf(slide);
            if (index !== -1 && index !== currentSlideIndex) goToSlide(index);
        });

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
                const item = e.target.closest('.grid-img');
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