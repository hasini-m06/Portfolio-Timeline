// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0, parallaxOffset = 0;
let isWalleSpeaking = false;
let activeBubble = null;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animCursor() {
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

// Starfield
const sc = document.getElementById('starfield');
const sx = sc.getContext('2d');
function resizeStar() { sc.width = window.innerWidth; sc.height = window.innerHeight; }
resizeStar(); window.addEventListener('resize', resizeStar);
const stars = Array.from({length: 200}, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.2 + 0.2,
  a: Math.random(),
  s: Math.random() * 0.003 + 0.001
}));
function drawStars() {
  sx.clearRect(0, 0, sc.width, sc.height);
  stars.forEach(s => {
    s.a += s.s; if (s.a > 1) s.a = 0;
    sx.beginPath();
    sx.arc(s.x * sc.width, s.y * sc.height, s.r, 0, Math.PI * 2);
    sx.fillStyle = `rgba(232,201,154,${s.a * 0.8})`;
    sx.fill();
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// WALL-E animation using image sprite
const wc = document.getElementById('walle-canvas');
const wx = wc.getContext('2d');
wc.width = window.innerWidth; wc.height = 240;
window.addEventListener('resize', () => { wc.width = window.innerWidth; });

const walleSprite = document.getElementById('walle-sprite');

let walleX = -80, walleDir = 1;
const walleSpeed = 0.8;

function drawWalle() {
  wc.width = window.innerWidth;
  wx.clearRect(0, 0, wc.width, wc.height);

  // Background junk hills (parallax-like depth)
  wx.fillStyle = 'rgba(25,15,5,0.5)';
  for (let i = 0; i < wc.width; i += 200) {
    wx.beginPath();
    wx.moveTo(i, wc.height - 120);
    wx.lineTo(i + 100, wc.height - 150);
    wx.lineTo(i + 200, wc.height - 120);
    wx.fill();
  }

  // Ground debris (junk silhouettes)
  wx.fillStyle = 'rgba(44,31,10,0.6)';
  for (let i = 0; i < wc.width; i += 120) {
    wx.fillRect(i + 10, wc.height - 120, 30, 20);
    wx.fillRect(i + 60, wc.height - 116, 20, 16);
    wx.fillRect(i + 90, wc.height - 123, 15, 23);
  }

  // Ground with gradient for depth
  const groundGradient = wx.createLinearGradient(0, wc.height - 120, 0, wc.height);
  groundGradient.addColorStop(0, 'rgba(35,22,8,1)');
  groundGradient.addColorStop(1, 'rgba(15,10,5,1)');
  
  wx.fillStyle = groundGradient;
  wx.fillRect(0, wc.height - 120, wc.width, 120);

  // Dust particles
  wx.fillStyle = 'rgba(200,150,80,0.15)';
  for (let i = 0; i < 20; i++) {
    const px = (walleX - 40 + i * 8 + Date.now() * 0.02 * walleDir) % wc.width;
    wx.beginPath();
    wx.arc(px, wc.height - 126 - Math.sin(i) * 5, 1, 0, Math.PI * 2);
    wx.fill();
  }

  // Move the DOM element
  walleSprite.style.left = walleX + 'px';
  const flip = walleDir < 0 ? 'scaleX(-1)' : 'scaleX(1)';
  walleSprite.style.transform = `${flip} translateY(${parallaxOffset}px)`;

  // Update speech bubble position
  if (activeBubble) {
    const rect = walleSprite.getBoundingClientRect();
    activeBubble.style.left = `${rect.left + 40}px`;
    activeBubble.style.top = `${rect.top - 40}px`;
  }

  // Animate
  walleX += walleSpeed * walleDir;
  if (walleX > wc.width + 80) walleDir = -1;
  if (walleX < -80) walleDir = 1;

  requestAnimationFrame(drawWalle);
}

drawWalle();

// Scroll reveal milestones
const milestones = document.querySelectorAll('.milestone');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
        // Add a slight delay before adding visible class for better effect
        setTimeout(() => e.target.classList.add('visible'), 100);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

milestones.forEach(m => observer.observe(m));

// Expandable Content Logic
milestones.forEach(m => {
    m.addEventListener('click', (e) => {
        // Ignore clicks on tags or links inside the milestone
        if (e.target.closest('.milestone-tag') || e.target.tagName.toLowerCase() === 'a') return;
        
        // Toggle the expanded class
        m.classList.toggle('expanded');
    });
});

// Filter Logic
const filterTags = document.querySelectorAll('.filter-tag');
filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
        // Update active state on filter tags
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');

        const filterValue = tag.getAttribute('data-filter');

        milestones.forEach(m => {
            if (filterValue === 'all') {
                m.classList.remove('filtered-out');
            } else {
                const tags = m.getAttribute('data-tags') || '';
                if (tags.includes(filterValue)) {
                    m.classList.remove('filtered-out');
                } else {
                    m.classList.add('filtered-out');
                    m.classList.remove('expanded'); // collapse if filtered out
                }
            }
        });
    });
});

// Cassette Navigation Logic
const cassettes = document.querySelectorAll('.cassette');

// Scroll to target on click
cassettes.forEach(c => {
    c.addEventListener('click', () => {
        const targetId = c.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});

// Highlight active cassette on scroll
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const targetId = entry.target.id;
            // Only update if the intersecting element has a corresponding cassette
            const targetCassette = document.querySelector(`.cassette[data-target="${targetId}"]`);
            
            if (targetCassette) {
                cassettes.forEach(c => c.classList.remove('active'));
                targetCassette.classList.add('active');
            }
        }
    });
}, { 
    threshold: 0,
    rootMargin: '-45% 0px -45% 0px' // Focus on the center 10% of the viewport
});

// Add observer to hero section for the first cassette
const hero = document.querySelector('.hero');
if(hero) scrollObserver.observe(hero); // Using the section itself

milestones.forEach(m => scrollObserver.observe(m));

// Embed photo handling (graceful fallback for missing images)
const photoCards = document.querySelectorAll('.photo-card');
photoCards.forEach(card => {
  const img = card.querySelector('img');
  const caption = card.querySelector('.photo-caption')?.innerText || '📸 IMAGE UNAVAILABLE';
  const altText = img?.getAttribute('alt') || 'Missing photo';
  
  if (img) {
    const showFallback = () => {
      card.innerHTML = `
        <div style="background:#1A1208;padding:2rem;text-align:center;">
          <p style="font-size:0.7rem;color:#6B5230;letter-spacing:0.1em">${caption}</p>
          <p style="font-size:0.65rem;color:#4A3820;margin-top:0.5rem">${altText}</p>
        </div>
      `;
    };

    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    } else {
      img.onerror = showFallback;
    }
  }
});
// Immersive Enhancements

// 1. Boot Sequence Logic
const bootScreen = document.getElementById('boot-screen');
if (bootScreen) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            bootScreen.classList.add('hidden');
        }, 3000); // Hide after 3 seconds
    });
}

// 2. Sound Effects System
const soundToggle = document.getElementById('sound-toggle');
let soundEnabled = false;
let hasPlayedBoot = false;

// We'll use a centralized playSound function
const playSound = (type) => {
    if (!soundEnabled) return;
    
    let audioPath = '';
    switch(type) {
        case 'click': audioPath = 'click.mp3'; break;
        case 'hover': audioPath = 'click.mp3'; break; 
        case 'boot': audioPath = 'boot.mp3'; break;
        case 'walle': audioPath = 'walle-voice.mp3'; break;
    }
    
    console.log(`Attempting to play sound: ${audioPath}`);
    const audio = new Audio(audioPath);
    audio.volume = 0.6;
    audio.play().then(() => {
        console.log(`Successfully playing: ${audioPath}`);
    }).catch(err => {
        console.warn(`Failed to play sound ${audioPath}:`, err);
    });
};

if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.querySelector('.icon').innerText = soundEnabled ? '🔊' : '🔇';
        if (soundEnabled) {
            if (!hasPlayedBoot) {
                playSound('boot');
                hasPlayedBoot = true;
            } else {
                playSound('click');
            }
        }
    });
}

// Add hover sounds to interactive elements
const interactiveElements = document.querySelectorAll('.cassette, .milestone-tag, .expand-hint, .btn, .plant-easter-egg');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (soundEnabled) playSound('hover');
    });
    el.addEventListener('click', () => {
        if (soundEnabled) playSound('click');
    });
});

// 3. EVE Cursor Glow Interaction
const cursorEl = document.getElementById('cursor');
const milestonesList = document.querySelectorAll('.milestone');

milestonesList.forEach(m => {
    m.addEventListener('mouseenter', () => {
        if (cursorEl) cursorEl.classList.add('eve-glow');
    });
    m.addEventListener('mouseleave', () => {
        if (cursorEl) cursorEl.classList.remove('eve-glow');
    });
});

// 4. Plant Easter Egg (Life Finds a Way)
const plantEgg = document.getElementById('plant-egg');
if (plantEgg) {
    plantEgg.addEventListener('click', () => {
        document.body.classList.toggle('clean-mode');
        
        const walleSprite = document.getElementById('walle-sprite');
        if (walleSprite) {
            if (document.body.classList.contains('clean-mode')) {
                walleSprite.style.filter = 'sepia(0%) brightness(1.2)';
            } else {
                walleSprite.style.filter = 'sepia(100%) brightness(0.8) hue-rotate(-15deg)';
            }
        }
        
        if (soundEnabled) playSound('click');
    });
}
// 5. Enhanced Scroll Parallax
const groundLine = document.querySelector('.ground');
const walleCanvas = document.getElementById('walle-canvas');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Parallax Starfield (very slow movement)
    if (sc) sc.style.transform = `translateY(${scrollY * 0.1}px)`;
    
    // Calculate offset for ground elements
    parallaxOffset = -scrollY * 0.05;
    
    // Apply parallax to ground line and Wall-E canvas
    if (groundLine) groundLine.style.transform = `translateY(${parallaxOffset}px)`;
    if (walleCanvas) walleCanvas.style.transform = `translateY(${parallaxOffset}px)`;
});
// 6. Wall-E Interaction (Click to Speak)
if (walleSprite) {
    walleSprite.style.pointerEvents = 'auto'; // Make it clickable
    walleSprite.style.cursor = 'pointer';
    walleSprite.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent other clicks
        if (isWalleSpeaking) return; 
        
        console.log("Wall-E clicked!");
        isWalleSpeaking = true;
        
        // Show speech bubble
        activeBubble = document.createElement('div');
        activeBubble.className = 'walle-speech';
        activeBubble.innerText = 'E ah!';
        document.body.appendChild(activeBubble);

        const stopSpeaking = () => {
            if (activeBubble) {
                activeBubble.style.opacity = '0';
                activeBubble.style.transform = 'translateY(-20px)';
                const currentBubble = activeBubble;
                setTimeout(() => {
                    currentBubble.remove();
                }, 500);
                activeBubble = null;
            }
            isWalleSpeaking = false;
        };

        if (soundEnabled) {
            console.log("Playing Wall-E voice...");
            const audio = new Audio('walle-voice.mp3');
            audio.volume = 0.6;
            audio.play().then(() => {
                audio.onended = stopSpeaking;
            }).catch(err => {
                console.warn("Wall-E voice failed:", err);
                setTimeout(stopSpeaking, 2000);
            });
            
            setTimeout(() => { if (isWalleSpeaking) stopSpeaking(); }, 5000);
        } else {
            setTimeout(stopSpeaking, 2000);
        }
    });
}
