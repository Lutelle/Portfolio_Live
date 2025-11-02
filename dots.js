// --- Configuration Constants ---
const dotContainer = document.getElementById('dot-container');
const CONTENT_MAX_WIDTH = 1200; 
const SCROLLBAR_BUFFER = 20; 
const numDots = 40; 
const mouseRepelDistance = 150; 
const mouseRepelStrength = 0.5; 

let dots = [];
let mouseX = 0;
let mouseY = 0;

let topBoundary = 0;
let bottomBoundary = 0;
let currentHorizontalBounds = null;


// --- 1. Helper Functions to Define Boundaries ---

function calculateContentBoundaries() {
    const firstSection = document.getElementById('about'); 
    const lastSection = document.getElementById('contact'); 

    if (firstSection && lastSection) {
        topBoundary = firstSection.offsetTop;
        bottomBoundary = lastSection.offsetTop + lastSection.offsetHeight;
    } else {
        topBoundary = 0;
        bottomBoundary = document.documentElement.scrollHeight;
    }
    currentHorizontalBounds = calculateMarginBounds();
}

function calculateMarginBounds() {
    const viewportWidth = window.innerWidth;
    const totalMarginWidth = viewportWidth - CONTENT_MAX_WIDTH;
    const margin = totalMarginWidth / 2;

    if (viewportWidth > CONTENT_MAX_WIDTH) {
        const rightConstraintEnd = viewportWidth - SCROLLBAR_BUFFER;
        
        return {
            leftStart: 0,
            leftEnd: margin, 
            
            rightConstraintStart: viewportWidth - margin,
            rightConstraintEnd: rightConstraintEnd,

            hasMargins: true
        };
    } else {
        return { hasMargins: false };
    }
}


// --- 2. Dot Initialization ---

function initializeDots() {
    dotContainer.innerHTML = '';
    dots = [];

    if (!currentHorizontalBounds || !currentHorizontalBounds.hasMargins) {
        return; 
    }

    for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        
        const sizeClasses = ['small', 'medium', 'large'];
        const size = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
        dot.classList.add(size);
        
        let initialX, side;

        if (Math.random() < 0.5) {
            initialX = currentHorizontalBounds.leftStart + Math.random() * (currentHorizontalBounds.leftEnd);
            side = 'left';
        } else {
            initialX = currentHorizontalBounds.rightConstraintStart + Math.random() * (currentHorizontalBounds.rightConstraintEnd - currentHorizontalBounds.rightConstraintStart);
            side = 'right';
        }
        
        dot.x = initialX;
        dot.y = topBoundary + Math.random() * (bottomBoundary - topBoundary);
        dot.originalSide = side;

        dot.offsetX = (Math.random() - 0.5) * 50;
        dot.offsetY = (Math.random() - 0.5) * 50;

        const scrollY = window.scrollY;
        dot.style.transform = `translate(${dot.x}px, ${dot.y - scrollY}px)`;
        
        dots.push(dot);
        dotContainer.appendChild(dot);
    }
}


// --- 3. Track Mouse Movement ---
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});


// --- 4. Animation Loop ---

function animate() {
    const scrollY = window.scrollY; 
    
    if (currentHorizontalBounds && currentHorizontalBounds.hasMargins) {
        
        dots.forEach(dot => {
            let targetX = dot.x + dot.offsetX * 0.005; 
            let targetY = dot.y + dot.offsetY * 0.005;
            
            const dx = mouseX - targetX;
            const dy = mouseY - (targetY - scrollY); 
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseRepelDistance) {
                const repelFactor = 1 - (distance / mouseRepelDistance);
                const repelStrength = repelFactor * mouseRepelStrength * 20; 
                targetX -= (dx / distance) * repelStrength;
                targetY -= (dy / distance) * repelStrength;
            }
            
            targetY = Math.max(topBoundary, Math.min(bottomBoundary, targetY));
            
            if (dot.originalSide === 'left') {
                targetX = Math.max(currentHorizontalBounds.leftStart, Math.min(currentHorizontalBounds.leftEnd, targetX));
            } else {
                targetX = Math.max(currentHorizontalBounds.rightConstraintStart, Math.min(currentHorizontalBounds.rightConstraintEnd, targetX));
            }

            dot.x = targetX;
            dot.y = targetY;
            
            dot.style.transform = `translate(${targetX}px, ${targetY - scrollY}px)`;
        });
    }

    requestAnimationFrame(animate); 
}


// --- 5. Event Listeners ---

function handleLayoutChange() {
    calculateContentBoundaries();
    initializeDots();
}

window.addEventListener('resize', handleLayoutChange);

// --- Start Sequence ---
calculateContentBoundaries();
initializeDots(); 
animate();