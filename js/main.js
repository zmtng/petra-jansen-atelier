document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Elemente einsammeln - Jetzt suchen wir nach BEIDEN Typen von Kunstwerken
    // Der Komma-Separator im Selector funktioniert wie ein "ODER"
    const galleryItems = document.querySelectorAll('.insta-item, .artwork-card');
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!lightbox) return;

    // 2. Klick-Events für alle gefundenen Werke
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const fullImageUrl = item.getAttribute('data-full');
            
            // WICHTIG: Wir müssen prüfen, von welchem Typ das geklickte Element ist,
            // um den richtigen Titel zu finden.
            let titleText = '';
            
            if (item.classList.contains('insta-item')) {
                // Logik für Galerie-Seite
                titleText = item.querySelector('.artwork-title').innerText;
            } else if (item.classList.contains('artwork-card')) {
                // Logik für Startseite (holt den Text aus dem h3)
                titleText = item.querySelector('.artwork-info h3').innerText;
            }

            // Lightbox befüllen und öffnen
            lightboxImg.src = fullImageUrl;
            lightboxCaption.innerText = titleText;
            lightbox.classList.add('active');
        });
    });

    // --- Ab hier bleibt die Logik zum Schließen gleich ---
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});