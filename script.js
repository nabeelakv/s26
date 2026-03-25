document.addEventListener('DOMContentLoaded', () => {
    // Scroll Sequence Logic
    const canvas = document.getElementById("hero-canvas");
    if (canvas) {
        const context = canvas.getContext("2d");
        
        // Initial dimensions for the canvas context drawing area
        // High res based on the provided images
        canvas.width = 1920; 
        canvas.height = 1080;

        const frameCount = 144;
        const currentFrame = index => (
            `images/soa/Smartphone_exploded_view_202603251258__1__${index.toString().padStart(3, '0')}.png`
        );

        const images = [];

        // Preload all frames sequentially to avoid blocking immediately, but ensure first is ready
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }

        // Draw the first image as soon as it loads
        images[0].onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
        };

        const heroSection = document.querySelector('.hero-seq-container');
        
        let targetScrollFraction = 0;
        let currentScrollFraction = 0;
        
        window.addEventListener('scroll', () => {
            if(!heroSection) return;
            const { top, height } = heroSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            if (top <= 0) {
                const scrolled = -top;
                const scrollableDistance = height - viewportHeight;
                targetScrollFraction = Math.max(0, Math.min(1, scrolled / scrollableDistance));
            }
        });

        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        })

        // Initialize continuous loop for smooth lerping
        function renderLoop(time) {
            lenis.raf(time);
            
            // Lerp current fraction towards target fraction for smoothness
            // 0.08 is the easing factor (closer to 0 is smoother/slower)
            currentScrollFraction += (targetScrollFraction - currentScrollFraction) * 0.08;
            
            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(currentScrollFraction * frameCount)
            );
            
            // Update canvas
            if (images[frameIndex] && images[frameIndex].complete) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
            }
            
            // Update Texts
            updateTexts(currentScrollFraction);
            
            requestAnimationFrame(renderLoop);
        }
        
        // Start loop
        requestAnimationFrame(renderLoop);

        function updateTexts(fraction) {
            const text1 = document.querySelector('.seq-text-1');
            const text2 = document.querySelector('.seq-text-2');
            const text3 = document.querySelector('.seq-text-3');
            
            if(text1) text1.style.opacity = (fraction >= 0 && fraction < 0.1) ? 1 - (fraction / 0.1) : 0;
            
            if(text2) {
                if(fraction >= 0.2 && fraction < 0.45) {
                    text2.style.opacity = Math.min(1, (fraction - 0.2) / 0.1);
                }
                else if(fraction >= 0.45 && fraction < 0.6) {
                    text2.style.opacity = Math.max(0, 1 - ((fraction - 0.45) / 0.1));
                }
                else {
                    text2.style.opacity = 0;
                }
            }
            
            if(text3) {
                if(fraction >= 0.65 && fraction <= 0.95) {
                    text3.style.opacity = Math.min(1, (fraction - 0.65) / 0.1);
                }
                else if (fraction > 0.95) {
                    text3.style.opacity = Math.max(0, 1 - ((fraction - 0.95) / 0.05));
                }
                else {
                    text3.style.opacity = 0;
                }
            }
        }
    }

    // Initial Load Animations
    setTimeout(() => {
        const hiddenElements = document.querySelectorAll('.hidden-onload');
        hiddenElements.forEach(el => {
            el.classList.add('on-load');
        });
    }, 100);

    // Scroll reveal animations using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed if you only want the animation to happen once
                // observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Optional: Parallax effect for the background glow
    const heroGlow = document.querySelector('.hero-glow');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if(heroGlow && scrolled < window.innerHeight) {
            heroGlow.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.4}px))`;
        }
    });
});
