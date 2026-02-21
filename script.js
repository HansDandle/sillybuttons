// --- Supabase Configuration ---
const SUPABASE_URL = 'https://ozpwwxbfmgxbitbzhsae.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UFlEyPnpOTYr9zEqiQiqjA_UEBHHmLL';

let supabaseClient;

// Wait for Supabase SDK to be available
function initSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
}

// Try to initialize immediately, or wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}

// --- Birthday Countdown Timer ---
function updateBirthdayCountdown() {
    const today = new Date();
    const currentYear = today.getFullYear();
    let birthday = new Date(currentYear, 4, 16); // May 16 (month is 0-indexed)
    
    // If birthday has already passed this year, count to next year's birthday
    if (today > birthday) {
        birthday = new Date(currentYear + 1, 4, 16);
    }
    
    // Check if today is the birthday
    if (today.getMonth() === 4 && today.getDate() === 16) {
        // Show birthday message and GIF
        const countdownDiv = document.getElementById('birthdayCountdown');
        if (countdownDiv) countdownDiv.style.display = 'none';
        
        const birthdayModal = document.getElementById('birthdayModal');
        if (birthdayModal) {
            birthdayModal.style.display = 'block !important';
            // Create overlay for the modal
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:3000;';
            overlay.id = 'birthdayOverlay';
            if (!document.getElementById('birthdayOverlay')) {
                document.body.appendChild(overlay);
            }
        }
    } else {
        // Calculate time remaining
        const timeRemaining = birthday - today;
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        const countdownText = document.getElementById('countdownText');
        if (countdownText) {
            countdownText.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
        
        // Make sure countdown is visible
        const countdownDiv = document.getElementById('birthdayCountdown');
        if (countdownDiv) countdownDiv.style.display = 'block';
        
        // Hide birthday modal if it was shown
        const birthdayModal = document.getElementById('birthdayModal');
        if (birthdayModal) birthdayModal.style.display = 'none';
        
        const overlay = document.getElementById('birthdayOverlay');
        if (overlay) overlay.remove();
    }
}

// Initialize countdown when page loads
document.addEventListener('DOMContentLoaded', async () => {
    updateBirthdayCountdown();
    setInterval(updateBirthdayCountdown, 1000); // Update every second
    
    // Load custom links from Supabase REST API
    try {
        const supabaseLinks = await loadCustomLinksFromSupabase();
        if (supabaseLinks && supabaseLinks.length > 0) {
            localStorage.setItem('customItems', JSON.stringify(supabaseLinks));
        }
    } catch (e) {
        // Silently fail, use localStorage
    }
    
    // Always render, whether from Supabase or localStorage
    renderCustomItems();
});

// --- Custom Items (localStorage + Supabase) logic ---
async function loadCustomLinksFromSupabase() {
    try {
        const response = await fetch(
            'https://ozpwwxbfmgxbitbzhsae.supabase.co/rest/v1/custom_links?select=*&order=created_at.desc',
            {
                headers: {
                    'apikey': 'sb_publishable_UFlEyPnpOTYr9zEqiQiqjA_UEBHHmLL',
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            console.error('Error loading from Supabase:', response.status);
            return [];
        }
        
        const data = await response.json();
        return data || [];
    } catch (e) {
        return [];
    }
}

function renderCustomItems() {
    let items = JSON.parse(localStorage.getItem('customItems') || '[]');
    
    // Add buttons
    const container = document.querySelector('.container.abstract-layout');
    if (container) {
        // Remove old custom buttons
        container.querySelectorAll('.custom-button-link-pair').forEach(el => el.remove());
        items.filter(i => i.type === 'button').forEach((i, idx) => {
            const div = document.createElement('div');
            div.className = 'button-link-pair custom-button-link-pair';
            div.innerHTML = `<div class="sound-label">Custom</div><button class="sillyButton">${i.label}</button><div class="button-link"><span>Destination: </span><span class="site-label">${i.url}</span></div><button class="delete-btn" data-index="${idx}" style="margin-top:0.5rem; padding:0.3rem 0.8rem; font-size:0.9rem; background:#ff6b6b; color:white; border:none; border-radius:6px; cursor:pointer;">Delete</button>`;
            container.appendChild(div);
            // Add click handler to custom button
            const btn = div.querySelector('.sillyButton');
            if (btn) {
                btn.addEventListener('click', () => {
                    window.location.href = i.url;
                });
            }
            // Add delete handler
            const deleteBtn = div.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${i.label}"?`)) {
                        deleteCustomLink(idx, i);
                    }
                });
            }
        });
    }
    // Add treasure links
    const treasureList = document.querySelector('.treasure-popup ul');
    if (treasureList) {
        // Remove old custom links
        treasureList.querySelectorAll('.custom-treasure-link').forEach(el => el.remove());
        items.filter(i => i.type === 'treasure').forEach((i, idx) => {
            const li = document.createElement('li');
            li.className = 'custom-treasure-link';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.paddingRight = '10px';
            const link = document.createElement('a');
            link.href = i.url;
            link.target = '_blank';
            link.textContent = `✨ ${i.label}`;
            li.appendChild(link);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✕';
            deleteBtn.style.cssText = 'background:#ff6b6b; color:white; border:none; border-radius:4px; padding:0.2rem 0.4rem; cursor:pointer; font-size:0.9rem;';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm(`Are you sure you want to delete "${i.label}"?`)) {
                    deleteCustomLink(idx, i);
                }
            });
            li.appendChild(deleteBtn);
            treasureList.appendChild(li);
        });
    }
}

// Delete custom link function
function deleteCustomLink(index, linkData) {
    // Delete from localStorage
    let items = JSON.parse(localStorage.getItem('customItems') || '[]');
    items.splice(index, 1);
    localStorage.setItem('customItems', JSON.stringify(items));
    
    // Try to delete from Supabase API (on production)
    const password = document.getElementById('adminPassword')?.value;
    if (password && linkData.id) {
        fetch('/api/delete-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, linkId: linkData.id })
        })
            .then(response => {
                if (!response.ok) {
                    console.warn('Could not delete from database');
                }
                return response.json().catch(() => null);
            })
            .catch(e => {
                console.warn('Database delete failed (OK on localhost):', e.message);
            });
    }
    
    renderCustomItems();
}

// Whack-a-Sea-Creature game logic
const whackamoleGame = document.getElementById('whackamole-game');
const openWhackamole = document.getElementById('openWhackamole');
const wmStart = document.getElementById('wm-start');
const wmClose = document.getElementById('wm-close');
const wmScore = document.getElementById('wm-score');
const wmHoles = whackamoleGame ? whackamoleGame.querySelectorAll('.wm-hole') : [];
let wmGameActive = false;
let wmScoreValue = 0;
let wmCurrent = -1;
let wmTimeout = null;

function showCreature() {
    wmHoles.forEach(h => h.innerHTML = '');
    wmHoles.forEach(h => h.classList.remove('active'));
    wmCurrent = Math.floor(Math.random() * wmHoles.length);
    const hole = wmHoles[wmCurrent];
    hole.classList.add('active');
    const creature = document.createElement('div');
    creature.className = 'wm-creature';
    creature.title = 'Whack me!';
    creature.onclick = () => {
        if (!wmGameActive) return;
        wmScoreValue++;
        wmScore.textContent = wmScoreValue;
        creature.remove();
        hole.classList.remove('active');
    };
    hole.appendChild(creature);
    wmTimeout = setTimeout(() => {
        if (wmGameActive) showCreature();
    }, 900);
}

function startWhackamole() {
    wmGameActive = true;
    wmScoreValue = 0;
    wmScore.textContent = '0';
    showCreature();
    wmStart.disabled = true;
    setTimeout(() => {
        wmGameActive = false;
        wmStart.disabled = false;
        wmHoles.forEach(h => { h.innerHTML = ''; h.classList.remove('active'); });
        alert('Game over! Your score: ' + wmScoreValue);
    }, 20000); // 20 seconds
}

if (openWhackamole && whackamoleGame) {
    openWhackamole.addEventListener('click', () => {
        whackamoleGame.style.setProperty('display', 'block', 'important');
    });
}
if (wmClose && whackamoleGame) {
    wmClose.addEventListener('click', () => {
        whackamoleGame.style.setProperty('display', 'none', 'important');
        wmGameActive = false;
        wmStart.disabled = false;
        if (wmTimeout) clearTimeout(wmTimeout);
        wmHoles.forEach(h => { h.innerHTML = ''; h.classList.remove('active'); });
    });
}
if (wmStart) {
    wmStart.addEventListener('click', startWhackamole);
}

// Archery game logic
function initArcheryGame() {
    const canvas = document.getElementById('archery-canvas');
    const levelSpan = document.getElementById('archery-level');
    const feedbackEl = document.getElementById('archery-feedback');
    if (!canvas || !levelSpan || !feedbackEl) return;

    const ctx = canvas.getContext('2d');
    const startX = canvas.width / 2;
    const startY = canvas.height - 120;   // bow at bottom with more padding
    const topY = 40;
    const bullRadius = 20;
    
    // Load images
    const castleImg = new Image();
    castleImg.src = 'images/Castle.jpg';
    const knightImg = new Image();
    knightImg.src = 'images/knight.png';
    const dragonImg = new Image();
    dragonImg.src = 'images/dragon.gif';
    
    const targets = [
        { x: canvas.width * 0.2, y: topY, hit: false },
        { x: canvas.width * 0.5, y: topY, hit: false },
        { x: canvas.width * 0.8, y: topY, hit: false }
    ];
    
    // Dragon specific state
    let dragon = {
        x: canvas.width * 0.5,
        y: topY,
        hitsRemaining: 3,
        moveTimer: 0,
        width: 100,
        height: 80
    };
    
    let dragonVelX = 0;
    let dragonVelY = 0;
    let dragging = false;
    let pullX = startX;
    let pullY = startY;
    let animating = false;
    let level = 1;
    let tries = 5;
    let targetsHit = 0;
    let gameActive = false;
    let totalArrowsShot = 0;
    let totalHits = 0;

    function getTheme() {
        if (level <= 5) return { name: 'Training', story: 'Archery Training' };
        if (level <= 10) return { name: 'Castle', story: 'Defend the Castle from Knights!' };
        return { name: 'Dragon', story: 'Face the Dragon!' };
    }

    function drawScene() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        const theme = getTheme();
        
        // draw theme-based background and targets
        if (theme.name === 'Castle' && castleImg.complete) {
            // Draw large castle background filling top 3/5ths of canvas
            const castleHeight = Math.floor(canvas.height * 0.6);
            ctx.drawImage(castleImg, 0, 10, canvas.width, castleHeight);
            
            // Draw knight targets on top of castle
            targets.forEach(t => {
                if (knightImg.complete) {
                    ctx.globalAlpha = t.hit ? 0.3 : 1.0;
                    ctx.drawImage(knightImg, t.x - 20, t.y - 30, 40, 60);
                    ctx.globalAlpha = 1.0;
                }
            });
        } else if (theme.name === 'Dragon' && dragonImg.complete) {
            // Draw moving dragon (movement is handled in mainLoop)
            ctx.drawImage(dragonImg, dragon.x - dragon.width/2, dragon.y - dragon.height/2, dragon.width, dragon.height);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#d32f2f';
            ctx.textAlign = 'center';
            ctx.fillText(`Hits: ${3 - dragon.hitsRemaining}`, dragon.x, dragon.y + dragon.height/2 + 20);
            ctx.textAlign = 'left';
        } else if (theme.name === 'Victory') {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⭐', canvas.width / 2, topY - 20);
            ctx.textAlign = 'left';
        } else {
            // Training levels - simple circles
            targets.forEach(t => {
                ctx.fillStyle = t.hit ? '#999' : 'red';
                ctx.beginPath();
                ctx.arc(t.x, t.y, bullRadius, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = t.hit ? '#ccc' : 'white';
                ctx.beginPath();
                ctx.arc(t.x, t.y, bullRadius/2, 0, Math.PI*2);
                ctx.fill();
            });
        }
        
        // draw start instruction if game not active
        if (!gameActive && ((theme.name !== 'Dragon' && tries === 5 && targetsHit === 0) || (theme.name === 'Dragon' && tries === 5 && dragon.hitsRemaining === 3))) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(theme.story, canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('Click and drag the bow to start', canvas.width / 2, canvas.height / 2 + 10);
            ctx.textAlign = 'left';
        }
        
        // draw bow at bottom horizontally with downward flex at ends
        const bend = Math.min(60, pullY - startY);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(startX - 80, startY + bend);
        ctx.quadraticCurveTo(startX, startY, startX + 80, startY + bend);
        ctx.stroke();

        // draw pull string & crosshair
        if (dragging) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(pullX, pullY);
            ctx.stroke();

            const dy = pullY - startY;
            if (dy > 1) {
                const slope = (startX - pullX) / dy;
                // Crosshair starts at mid-target height, moves UP based on pull distance
                const maxPull = 150;
                const pullFraction = Math.min(1, dy / maxPull);
                const baseY = 140;  // Starting position lower on screen
                const impactY = baseY - (pullFraction * 180);  // Moves UP up to 180 pixels
                let xPred = startX + slope * (startY - impactY);
                xPred = Math.max(0, Math.min(canvas.width, xPred));
                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath();
                ctx.moveTo(xPred - 10, impactY + 10);
                ctx.lineTo(xPred + 10, impactY + 10);
                ctx.moveTo(xPred, impactY + 20);
                ctx.lineTo(xPred, impactY);
                ctx.stroke();
            }
        }
    }

    function arrowColor() {
        if (level <= 5) return '#000';
        if (level <= 10) return '#ff4500';
        return '#800080';
    }

    function showExplosion(x,y) {
        let radius = 0;
        function anim() {
            ctx.save();
            ctx.globalAlpha = 1 - radius/60;
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
            radius += 3;
            if (radius < 60) requestAnimationFrame(anim);
            else drawScene();
        }
        anim();
    }

    function respawnTargets() {
        // For dragon levels, reset hits
        const theme = getTheme();
        if (theme.name === 'Dragon') {
            dragon.hitsRemaining = 3;
            dragon.x = canvas.width / 2 + (Math.random() - 0.5) * 100;
            dragon.y = topY + (Math.random() - 0.5) * 100;
            dragonVelX = 0;
            dragonVelY = 0;
            dragon.moveTimer = 0;
        } else {
            // For castle and training levels, place targets with minimum spacing
            const positions = [];
            const minSpacing = 80;
            for (let i = 0; i < targets.length; i++) {
                let x;
                let validPosition = false;
                while (!validPosition) {
                    x = Math.random() * (canvas.width - 100) + 50;
                    validPosition = positions.every(pos => Math.abs(x - pos) >= minSpacing);
                }
                positions.push(x);
                targets[i].x = x;
                // For castle and training levels, position targets with varied heights
                if (theme.name === 'Castle') {
                    targets[i].y = 80 + Math.random() * 140;  // Random y between 80-220 (on the castle)
                } else {
                    targets[i].y = topY + (Math.random() - 0.5) * 80;  // Vary y from topY ±40
                }
                targets[i].hit = false;
            }
        }
    }

    function resetLevel() {
        // Stay on same level, reset targets
        tries = 5;
        targetsHit = 0;
        gameActive = false;
        respawnTargets();
        drawScene();
    }

    function completeLevelRound() {
        const theme = getTheme();
        // Check if player succeeded
        let success = false;
        if (theme.name === 'Dragon') {
            success = dragon.hitsRemaining === 0;
        } else {
            success = targets.every(t => t.hit);
        }
        
        if (success) {
            // Special message for defeating the final dragon
            if (level === 15 && theme.name === 'Dragon') {
                feedbackEl.textContent = '🎉 CONGRATULATIONS! YOU\'VE SLAYED THE DRAGON! 🎉 Well Done, Legend!';
                levelSpan.textContent = level;
                setTimeout(() => {
                    level = 1;
                    tries = 5;
                    targetsHit = 0;
                    gameActive = false;
                    respawnTargets();
                    levelSpan.textContent = level;
                    feedbackEl.textContent = '';
                    drawScene();
                }, 3000);
                return;
            } else {
                feedbackEl.textContent = 'Well done Archer!';
                level++;
                if (level > 15) level = 1;
                tries = 5;
                targetsHit = 0;
                gameActive = false;
                respawnTargets();
                levelSpan.textContent = level;
            }
        } else {
            // Not successful - show score and reset same level
            if (theme.name === 'Dragon') {
                feedbackEl.textContent = `Valiant effort! ${3 - dragon.hitsRemaining} of 3 hits. Try Again!`;
            } else {
                feedbackEl.textContent = `Valiant effort! ${targetsHit} of 3 targets. Try Again!`;
            }
            setTimeout(resetLevel, 2000);
            return;
        }
        drawScene();
    }
    
    function finishShot(finalX, finalY, hitTarget) {
        tries--;
        totalArrowsShot++;
        const theme = getTheme();
        
        if (theme.name === 'Dragon') {
            // Check if hit the dragon (generous hit radius)
            const distToDragon = Math.hypot(finalX - dragon.x, finalY - dragon.y);
            if (distToDragon < dragon.width/2 + 30) {
                hitTarget = true;
                dragon.hitsRemaining--;
                totalHits++;
            }
            
            if (hitTarget) {
                feedbackEl.textContent = `Hit! Hits remaining: ${dragon.hitsRemaining}, Tries left: ${tries}`;
                if (level > 10) showExplosion(finalX, finalY);
            } else {
                feedbackEl.textContent = `Miss! Tries left: ${tries}`;
            }
        } else {
            // Regular target hit detection (training and castle levels)
            if (hitTarget) {
                totalHits++;
                feedbackEl.textContent = `Hit! Tries left: ${tries}`;
                if (level > 10) showExplosion(finalX, finalY);
                // mark the closest target as hit
                let closestTarget = null;
                let closestDist = 30;
                targets.forEach(t => {
                    const dist = Math.hypot(t.x - finalX, t.y - finalY);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestTarget = t;
                    }
                });
                if (closestTarget) closestTarget.hit = true;
                targetsHit++;
            } else {
                feedbackEl.textContent = `Miss! Tries left: ${tries}`;
            }
        }
        
        animating = false;
        
        // Check if level is complete
        if (theme.name === 'Dragon') {
            if (dragon.hitsRemaining === 0 || tries === 0) {
                setTimeout(completeLevelRound, 1500);
            } else {
                drawScene();
            }
        } else {
            if (targets.every(t => t.hit) || tries === 0) {
                setTimeout(completeLevelRound, 1500);
            } else {
                drawScene();
            }
        }
    }

    function shootArrow() {
        const dx = pullX - startX;
        const dy = pullY - startY;
        const speed = Math.min(20, dy / 2);
        const slope = -dx / dy;
        let arrowX = startX;
        let arrowY = startY;
        
        // Calculate where arrow should stop based on pull distance
        const maxPull = 150;
        const pullFraction = Math.min(1, dy / maxPull);
        const baseY = 140;
        const targetY = baseY - (pullFraction * 180);
        
        animating = true;
        function animate() {
            if (!animating) return;
            arrowY -= speed;
            arrowX += speed * slope;
            drawScene();
            // draw arrow pointing up
            ctx.strokeStyle = arrowColor();
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY+10);
            ctx.lineTo(arrowX, arrowY);
            ctx.stroke();
            ctx.fillStyle = arrowColor();
            ctx.beginPath();
            ctx.moveTo(arrowX-3, arrowY);
            ctx.lineTo(arrowX+3, arrowY);
            ctx.lineTo(arrowX, arrowY-6);
            ctx.closePath();
            ctx.fill();

            // flame trail
            if (level > 5 && level <= 10) {
                ctx.fillStyle = 'rgba(255,165,0,0.7)';
                ctx.beginPath();
                ctx.arc(arrowX, arrowY+8, 6, 0, Math.PI*2);
                ctx.fill();
            }

            // Check for hits during arrow flight (not just at end)
            const theme = getTheme();
            let hitTarget = false;
            
            if (theme.name === 'Dragon') {
                // Check if arrow hit the moving dragon
                const distToDragon = Math.hypot(arrowX - dragon.x, arrowY - dragon.y);
                hitTarget = distToDragon < dragon.width/2 + 30;
            } else {
                // Check regular targets (training and castle levels)
                hitTarget = targets.some(t => Math.abs(arrowX - t.x) <= 25 && Math.abs(arrowY - t.y) <= 25);
            }
            
            if (hitTarget) {
                // Hit detected - stop animation and process
                finishShot(arrowX, arrowY, true);
            } else if (arrowY <= targetY) {
                // Arrow reached predicted impact distance
                finishShot(arrowX, arrowY, false);
            } else if (arrowY < 0) {
                // Arrow went off screen (shouldn't happen with targetY check)
                finishShot(arrowX, arrowY, false);
            } else {
                requestAnimationFrame(animate);
            }
        }
        animate();
    }

    canvas.addEventListener('pointerdown', e => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (Math.hypot(x-startX, y-startY) < 50 && !animating) {
            gameActive = true;
            dragging = true;
            pullX = x;
            pullY = y;
            drawScene();
        }
    });
    canvas.addEventListener('pointermove', e => {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if (y < startY) y = startY;
        pullX = x;
        pullY = y;
        drawScene();
    });
    canvas.addEventListener('pointerup', e => {
        if (!dragging) return;
        dragging = false;
        const dy = pullY - startY;
        if (dy > 5 && !animating) {
            shootArrow();
        }
        pullX = startX;
        pullY = startY;
        drawScene();
    });
    canvas.addEventListener('pointerleave', e => {
        if (dragging) {
            dragging = false;
            pullX = startX;
            pullY = startY;
            drawScene();
        }
    });

    levelSpan.textContent = level;
    drawScene();
    
    // Continuous animation loop for dragon movement and scene updates
    function mainLoop() {
        const theme = getTheme();
        if (theme.name === 'Dragon' && gameActive && !animating) {
            // Move dragon independently during dragon levels when not actively animating
            dragon.moveTimer++;
            // Speed increases with level: level 11 is slowest, level 15 is fastest
            const speedFactor = (level - 10) / 5;  // 0.2 to 1.0 for levels 11-15
            const maxVel = 1.5 * speedFactor;
            
            if (dragon.moveTimer > 20) {
                // Move on both x and y axes
                dragonVelX = (Math.random() - 0.5) * maxVel * 2;
                dragonVelY = (Math.random() - 0.5) * maxVel * 2;
                dragon.moveTimer = 0;
            }
            dragon.x += dragonVelX;
            dragon.y += dragonVelY;
            
            // Keep dragon in bounds (both axes)
            if (dragon.x < 70) { dragon.x = 70; dragonVelX *= -1; }
            if (dragon.x > canvas.width - 70) { dragon.x = canvas.width - 70; dragonVelX *= -1; }
            if (dragon.y < 50) { dragon.y = 50; dragonVelY *= -1; }
            if (dragon.y > canvas.height - 150) { dragon.y = canvas.height - 150; dragonVelY *= -1; }
            
            drawScene();
        }
        requestAnimationFrame(mainLoop);
    }
    mainLoop();
    
    // Level picker for testing
    const levelPicker = document.getElementById('level-picker');
    const levelDisplay = document.getElementById('level-display');
    const resetLevelBtn = document.getElementById('reset-level-btn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    function setLevel(newLevel) {
        level = Math.max(1, Math.min(20, newLevel));
        tries = 5;
        targetsHit = 0;
        gameActive = false;
        animating = false;
        pullX = startX;
        pullY = startY;
        dragging = false;
        respawnTargets();
        levelSpan.textContent = level;
        levelPicker.value = level;
        levelDisplay.textContent = level;
        feedbackEl.textContent = '';
        drawScene();
    }
    
    if (levelPicker) {
        levelPicker.addEventListener('input', (e) => {
            setLevel(parseInt(e.target.value));
        });
    }
    
    if (resetLevelBtn) {
        resetLevelBtn.addEventListener('click', () => {
            setLevel(level);
        });
    }
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setLevel(parseInt(btn.getAttribute('data-level')));
        });
    });
}

// Treasure chest popup logic
const treasureChest = document.querySelector('.treasure-chest');
const treasurePopup = document.getElementById('treasurePopup');
const closeTreasure = document.getElementById('closeTreasure');
if (treasureChest && treasurePopup && closeTreasure) {
    treasureChest.addEventListener('click', () => {
        renderCustomItems(); // Refresh items before opening
        treasurePopup.style.setProperty('display', 'block', 'important');
    });
    treasureChest.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            renderCustomItems(); // Refresh items before opening
            treasurePopup.style.setProperty('display', 'block', 'important');
        }
    });
    closeTreasure.addEventListener('click', () => {
        treasurePopup.style.setProperty('display', 'none', 'important');
    });
}
// Glitter explosion effect
function glitterExplosion() {
    const container = document.body;
    const glitter = document.createElement('div');
    glitter.className = 'glitter-explosion';
    glitter.style.left = Math.random() * 100 + 'vw';
    glitter.style.top = Math.random() * 100 + 'vh';
    container.appendChild(glitter);
    setTimeout(() => glitter.remove(), 1200);
}

// List of kid-friendly websites
const kidSites = [
    "https://pbskids.org/",
    "https://www.coolmathgames.com/",
    "https://www.funbrain.com/",
    "https://musiclab.chromeexperiments.com/Song-Maker/",
    "https://www.starfall.com/",
    "https://www.switchzoo.com/",
    "https://pointerpointer.com/",
    "https://www.rainymood.com/",
    "https://www.theuselessweb.com/",
    "https://www.zoomquilt.org/",
    "https://www.fallingfalling.com/",
    "https://www.eyebleach.me/",
    "https://www.drawastickman.com/",
    "https://www.youtube.com/@HydraulicPressChannel",
    "https://www.eyebleach.me/",
];



const buttons = document.querySelectorAll('.sillyButton');
const siteLabels = document.querySelectorAll('.site-label');
const soundLabels = document.querySelectorAll('.sound-label');
const sound = document.getElementById('sillySound');
const nauticalBg = document.querySelector('.nautical-bg');

// List of available silly sounds and their labels
const sillySounds = [
    {file: 'sounds/quack_5.mp3', label: 'Quack'},
    {file: 'sounds/sponge-bob-mp3-454746.mp3', label: 'SpongeBob Strobe'},
    {file: 'sounds/a-few-moments-later-sponge-bob-sfx-fun.mp3', label: 'A Few Moments Later'},
    {file: 'sounds/my-leg-sound-effects.mp3', label: 'My Leg!'},
    {file: 'sounds/spongebob-fail.mp3', label: 'SpongeBob Fail'},
    {file: 'sounds/squish-sound-effect.mp3', label: 'Squish'},
];

// --- Guess the Number Game Logic ---
const guessBtn = document.getElementById('guessBtn');
const guessInput = document.getElementById('guessInput');
const guessResult = document.getElementById('guessResult');
const guessStreak = document.getElementById('guessStreak');
const guessGameContainer = document.getElementById('guess-number-game');

// Correct and incorrect sound files
const guessCorrectSound = 'sounds/spongebob-laugh.mp3';
const guessWrongSounds = [
    'sounds/spongebob-squarepants-wa-wa-wa.mp3',
    'sounds/sponge-bob-disgusting.mp3',
    'sounds/mr-krabss-smallest-violin-voice-only.mp3'
];

let guessStreakValue = 0;

function playGuessSound(src) {
    sound.src = src;
    sound.currentTime = 0;
    sound.play();
}

function playGameSound(type) {
    if (type === 'correct') {
        // For geography game: play ding.mp3
        sound.src = 'sounds/ding.mp3';
    } else if (type === 'wrong') {
        sound.src = guessWrongSounds[Math.floor(Math.random() * guessWrongSounds.length)];
    }
    // Clear any previous onended handlers to prevent silly button redirects
    sound.onended = null;
    sound.currentTime = 0;
    sound.play();
}

if (guessBtn && guessInput && guessResult && guessStreak) {
    guessBtn.addEventListener('click', () => {
        const userGuess = parseInt(guessInput.value, 10);
        if (isNaN(userGuess) || userGuess < 1 || userGuess > 5) {
            guessResult.textContent = 'Please enter a number from 1 to 5.';
            guessResult.style.color = 'red';
            return;
        }
        const randomNum = Math.floor(Math.random() * 5) + 1;
        if (userGuess === randomNum) {
            guessResult.textContent = `Correct! The number was ${randomNum}.`;
            guessResult.style.color = 'green';
            guessStreakValue++;
            guessStreak.textContent = guessStreakValue;
            playGuessSound(guessCorrectSound);
        } else {
            guessResult.textContent = `Wrong! The number was ${randomNum}. Try again.`;
            guessResult.style.color = 'red';
            guessStreakValue = 0;
            guessStreak.textContent = guessStreakValue;
            const wrongSound = guessWrongSounds[Math.floor(Math.random() * guessWrongSounds.length)];
            playGuessSound(wrongSound);
        }
    });
}

// --- Magic Eight Ball Game Logic ---
const eightBallBtn = document.getElementById('eightBallBtn');
const eightBallInput = document.getElementById('eightBallInput');
const eightBallResult = document.getElementById('eightBallResult');

const eightBallResponses = [
    'Yes!',
    'No.',
    'Maybe...NOT!',
    'For Fritz? Anything is possible!',
    'Definitely!',
    'Absolutely not.',
    'It is certain.',
    'Very doubtful.',
    'Not sure, I am ust a computer.',
    'Squirrel!',
    'My sources say yes.',
    'Ask your mom',
    'Brainfart - try again.'
];

if (eightBallBtn && eightBallInput && eightBallResult) {
    eightBallBtn.addEventListener('click', () => {
        const question = eightBallInput.value.trim();
        if (!question) {
            eightBallResult.textContent = 'Please ask a yes/no question!';
            eightBallResult.style.color = 'red';
            return;
        }
        const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
        eightBallResult.textContent = response;
        eightBallResult.style.color = '#0077b6';
    });
}

    // --- Knock Knock Joke Generator Logic ---
    const knockKnockBtn = document.getElementById('knockKnockBtn');
    const knockKnockResult = document.getElementById('knockKnockResult');

    const knockKnockJokes = [
        {who: 'Lettuce', punch: 'Lettuce in, it’s cold out here!'},
        {who: 'Tank', punch: 'You’re welcome.'},
        {who: 'Boo', punch: 'Don’t cry, it’s just a joke!'},
        {who: 'Atch', punch: 'Bless you!'},
        {who: 'Harry', punch: 'Harry up and answer the door!'},
        {who: 'Olive', punch: 'Olive you and I miss you!'},
        {who: 'Cow says', punch: 'No, a cow says moooo!'},
        {who: 'Interrupting cow', punch: 'MOO!'},
        {who: 'Dishes', punch: 'Dishes the police, open up!'},
        {who: 'Annie', punch: 'Annie thing you can do, I can do too!'},
        {who: 'Ice cream', punch: 'Ice cream every time I see a scary movie!'},
        {who: 'Broken pencil', punch: 'Never mind, it’s pointless.'},
        {who: 'Spell', punch: 'W-H-O.'},
        {who: 'Nobel', punch: 'No bell, that’s why I knocked!'}
    ];

    if (knockKnockBtn && knockKnockResult) {
        knockKnockBtn.addEventListener('click', () => {
            const joke = knockKnockJokes[Math.floor(Math.random() * knockKnockJokes.length)];
            knockKnockResult.innerHTML = `<div>Knock, knock.<br>Who’s there?<br>${joke.who}.<br>${joke.who} who?<br>${joke.punch}</div>`;
            knockKnockResult.style.color = '#0077b6';
        });
    }

    // --- Word Scramble Game Logic ---

    const scrambleWords = [
        'banana', 'computer', 'silly', 'button', 'ocean', 'jellyfish', 'spongebob', 'krabby', 'treasure', 'whale', 'octopus', 'starfish', 'bubble', 'pirate', 'seashell', 'anchor', 'submarine', 'coral', 'plankton', 'chumbucket'
    ];

    const scrambleDefinitions = {
        banana: 'A long curved fruit with a yellow skin.',
        computer: 'An electronic device for storing and processing data.',
        silly: 'Showing lack of good sense or judgment.',
        button: 'A small disk or knob sewn onto a garment.',
        ocean: 'A large body of salt water that covers most of the Earth.',
        jellyfish: 'A sea creature with a soft, jelly-like body and tentacles.',
        spongebob: 'A famous cartoon sea sponge who lives in a pineapple under the sea.',
        krabby: 'Related to the Krabby Patty, a burger from SpongeBob.',
        treasure: 'A quantity of precious metals, gems, or other valuable objects.',
        whale: 'A very large marine mammal.',
        octopus: 'A sea animal with eight arms.',
        starfish: 'A sea animal with five arms shaped like a star.',
        bubble: 'A thin sphere of liquid enclosing air or gas.',
        pirate: 'A person who attacks and robs ships at sea.',
        seashell: 'The shell of a marine mollusk.',
        anchor: 'A heavy object used to moor a vessel to the sea bottom.',
        submarine: 'A watercraft capable of independent operation underwater.',
        coral: 'A hard, stony substance formed by marine animals.',
        plankton: 'Tiny marine organisms that drift in the sea.',
        chumbucket: 'Plankton\'s restaurant in SpongeBob SquarePants.'
    };

    function shuffleWord(word) {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    const scrambleWordDiv = document.getElementById('scrambleWord');
    const scrambleInput = document.getElementById('scrambleInput');
    const scrambleBtn = document.getElementById('scrambleBtn');
    const scrambleResult = document.getElementById('scrambleResult');

    let currentWord = '';
const scrambleHintBtn = document.getElementById('scrambleHintBtn');
const scrambleHint = document.getElementById('scrambleHint');

    function newScramble() {
        currentWord = scrambleWords[Math.floor(Math.random() * scrambleWords.length)];
        scrambleWordDiv.textContent = shuffleWord(currentWord);
        scrambleInput.value = '';
        scrambleResult.textContent = '';
        if (scrambleHint) scrambleHint.textContent = '';
    }

    if (scrambleBtn && scrambleInput && scrambleWordDiv && scrambleResult) {
        newScramble();
        scrambleBtn.addEventListener('click', () => {
            const guess = scrambleInput.value.trim().toLowerCase();
            if (!guess) {
                scrambleResult.textContent = 'Type your guess!';
                scrambleResult.style.color = 'red';
                return;
            }
            if (guess === currentWord) {
                scrambleResult.textContent = 'Correct!';
                scrambleResult.style.color = 'green';
                setTimeout(newScramble, 1200);
            } else {
                scrambleResult.textContent = 'Try again!';
                scrambleResult.style.color = 'red';
            }
        });
        if (scrambleHintBtn && scrambleHint) {
            scrambleHintBtn.addEventListener('click', () => {
                scrambleHint.textContent = scrambleDefinitions[currentWord] || 'No hint available.';
            });
        }
    }


// Friendly names for common destinations (by hostname)
const friendlyNames = {
    'pbskids.org': 'PBS Kids',
    'coolmathgames.com': 'Cool Math Games',
    'nationalgeographickids.com': 'National Geographic Kids',
    'funbrain.com': 'Funbrain',
    'sesamestreet.org': 'Sesame Street',
    'starfall.com': 'Starfall',
    'switchzoo.com': 'Switch Zoo',
    'pointerpointer.com': 'Pointer Pointer',
    'rainymood.com': 'Rainy Mood',
    'theuselessweb.com': 'The Useless Web',
    'koalastothemax.com': 'Koalas to the Max',
    'bouncingdvdlogo.com': 'Bouncing DVD Logo',
    'zoomquilt.org': 'Zoomquilt',
    'shadyurl.com': 'Shady URL',
    'fallingfalling.com': 'Falling Falling',
    'catslap.com': 'Cat Slap',
    'rrrgggbbb.com': 'RRRGGGBBB',
    'staggeringbeauty.com': 'Staggering Beauty',
    'eyebleach.me': 'Eyebleach',
    'drawastickman.com': 'Draw a Stickman',
    'sanger.dk': 'Sanger.dk',
    'thatsthefinger.com': "That's the Finger",
    'patience-is-a-virtue.org': 'Patience is a Virtue',
    'froggyandthebull.com': 'Froggy and the Bull',
    'ouaismaisbon.ch': 'Ouais Mais Bon',
    'veryverynice.com': 'Very Very Nice',
    'silkmoth.club': 'Silkmoth Club'
};

function getFriendlyName(url) {
    try {
        const host = (new URL(url)).hostname.replace(/^www\./, '');
        return friendlyNames[host] || host;
    } catch (e) {
        return url;
    }
}

// Assign a random site to each button without duplicates
function assignUniqueSites(numButtons) {
    const shuffled = [...kidSites].sort(() => Math.random() - 0.5);
    const assigned = [];
    for (let i = 0; i < numButtons; i++) {
        assigned.push(shuffled[i % shuffled.length]);
    }
    return assigned;
}

const assignedSites = assignUniqueSites(buttons.length);
siteLabels.forEach((label, i) => {
    label.textContent = getFriendlyName(assignedSites[i]);
});
// Set sound label text above each button (for robustness)
soundLabels.forEach((label, i) => {
    label.textContent = sillySounds[i] ? sillySounds[i].label : '';
});

buttons.forEach((button, i) => {
    button.addEventListener('click', () => {
        // Add a quick spin animation
        button.style.transition = 'transform 0.3s';
        button.style.transform = 'scale(1.2) rotate(12deg)';
        setTimeout(() => {
            button.style.transform = '';
        }, 300);

        // Always play the sound for this button
        const soundObj = sillySounds[i];
        if (!soundObj) return;
        sound.src = soundObj.file;
        sound.currentTime = 0;
        sound.play();

        // If SpongeBob sound, strobe the background 7s after sound starts, strobe for 10s, then redirect
        if (soundObj.file.includes('sponge-bob-mp3-454746')) {
            let strobeStarted = false;
            let strobeDone = false;
            let soundDone = false;

            // At 6 seconds, trigger 5 consecutive glitter explosions (100ms apart)
            setTimeout(() => {
                for (let j = 0; j < 5; j++) {
                    setTimeout(glitterExplosion, j * 100);
                }
            }, 6000);

            // Start strobe 7s after sound starts
            setTimeout(() => {
                nauticalBg.classList.add('strobe');
                strobeStarted = true;
                setTimeout(() => {
                    nauticalBg.classList.remove('strobe');
                    strobeDone = true;
                    // Only redirect if sound is also done
                    if (soundDone) {
                        window.location.href = assignedSites[i];
                    }
                }, 10000); // strobe for 10 seconds
            }, 7000); // wait 7 seconds before strobing

            sound.onended = () => {
                soundDone = true;
                // Only redirect if strobe is also done
                if (strobeDone || !strobeStarted) {
                    nauticalBg.classList.remove('strobe');
                    window.location.href = assignedSites[i];
                }
            };
        } else {
            sound.onended = () => {
                window.location.href = assignedSites[i];
            };
        }
    });
});

// --- Admin Login Wheel Button Logic ---
const adminWheelBtn = document.getElementById('adminWheelBtn');
const adminLoginContainer = document.getElementById('adminLoginContainer');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginError = document.getElementById('adminLoginError');

if (adminWheelBtn && adminLoginContainer && adminLoginForm) {
    // Show login form on click or keyboard
    const showLogin = () => {
        adminLoginContainer.style.setProperty('display', 'block', 'important');
        adminLoginError.style.setProperty('display', 'none', 'important');
        // Focus password input for accessibility
        const pwInput = document.getElementById('adminPassword');
        if (pwInput) setTimeout(() => pwInput.focus(), 100);
    };
    adminWheelBtn.addEventListener('click', showLogin);
    adminWheelBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') showLogin();
    });
    // Hide login form on successful login or cancel
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const pw = document.getElementById('adminPassword').value;
        
        let isValid = false;
        
        // Try API endpoint first (for production on Vercel)
        try {
            const response = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pw })
            });
            
            if (response.ok) {
                isValid = true;
            } else {
                // API failed or returned error - try local config.js fallback
                if (typeof CONFIG !== 'undefined' && CONFIG.ADMIN_PASSWORD) {
                    isValid = (pw === CONFIG.ADMIN_PASSWORD);
                }
            }
        } catch (error) {
            // Network error - try local config.js fallback
            if (typeof CONFIG !== 'undefined' && CONFIG.ADMIN_PASSWORD) {
                isValid = (pw === CONFIG.ADMIN_PASSWORD);
            }
        }
        
        if (isValid) {
            adminLoginContainer.style.setProperty('display', 'none', 'important');
            adminLoginError.style.setProperty('display', 'none', 'important');
            // Show admin add form
            const adminFormContainer = document.getElementById('adminFormContainer');
            if (adminFormContainer) adminFormContainer.style.setProperty('display', 'block', 'important');
        } else {
            adminLoginError.textContent = 'Wrong password!';
            adminLoginError.style.setProperty('display', 'block', 'important');
        }
    });
    // Optional: Hide login on outside click
    adminLoginContainer.addEventListener('click', function(e) {
        if (e.target === adminLoginContainer) {
            adminLoginContainer.style.setProperty('display', 'none', 'important');
        }
    });
}

// --- Admin Add Button/Link Form Logic ---
const adminFormContainer = document.getElementById('adminFormContainer');
const adminForm = document.getElementById('adminForm');
const adminCancel = document.getElementById('adminCancel');
const adminUrl = document.getElementById('adminUrl');
if (adminFormContainer && adminForm && adminCancel && adminUrl) {
    // Add paste button next to URL input
    if (!document.getElementById('adminPasteBtn')) {
        const pasteBtn = document.createElement('button');
        pasteBtn.type = 'button';
        pasteBtn.id = 'adminPasteBtn';
        pasteBtn.textContent = 'Paste';
        pasteBtn.style.marginLeft = '0.5em';
        adminUrl.parentNode.appendChild(pasteBtn);
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                adminUrl.value = text;
            } catch (err) {
                alert('Could not read clipboard');
            }
        });
    }
    // Hide form on cancel
    adminCancel.addEventListener('click', () => {
        adminFormContainer.style.display = 'none';
    });
    // Handle add
    adminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = document.getElementById('adminType').value;
        const label = document.getElementById('adminLabel').value.trim();
        let url = adminUrl.value.trim();
        // Allow domain-only input
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        // Get password from form
        const password = document.getElementById('adminPassword').value;
        
        // Save to localStorage first
        let items = JSON.parse(localStorage.getItem('customItems') || '[]');
        items.push({ type, label, url });
        localStorage.setItem('customItems', JSON.stringify(items));
        
        // Also save to API (which validates password and saves to Supabase)
        fetch('/api/add-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, label, url, type })
        })
            .then(response => {
                if (!response.ok) {
                    console.warn('API returned error:', response.status);
                    return null;
                }
                return response.json().catch(e => {
                    console.warn('API response not JSON, ignoring');
                    return null;
                });
            })
            .then(async data => {
                if (data && data.error) {
                    console.error('Error:', data.error);
                    alert('Database error: ' + data.error);
                } else if (data) {
                    // Successfully added to Supabase, reload from Supabase
                    if (supabaseClient) {
                        try {
                            const supabaseLinks = await loadCustomLinksFromSupabase();
                            if (supabaseLinks && supabaseLinks.length > 0) {
                                localStorage.setItem('customItems', JSON.stringify(supabaseLinks));
                                renderCustomItems();
                            }
                        } catch (e) {
                            console.log('Could not reload from Supabase:', e);
                        }
                    }
                }
            })
            .catch(e => {
                console.warn('Could not sync to database (this is OK on localhost):', e.message);
            });
        
        renderCustomItems();
        adminFormContainer.style.display = 'none';
        adminForm.reset();
    });
}

// ============================================================================
// US GEOGRAPHY GAME - Two modes: Identify State and Identify Capital
// ============================================================================

// State data with all 50 US states, capitals, and major cities
const stateData = {
    AL: { name: 'Alabama', capital: 'Montgomery', cities: ['Birmingham', 'Mobile', 'Huntsville'] },
    AK: { name: 'Alaska', capital: 'Juneau', cities: ['Anchorage', 'Fairbanks', 'Ketchikan'] },
    AZ: { name: 'Arizona', capital: 'Phoenix', cities: ['Mesa', 'Tucson', 'Scottsdale'] },
    AR: { name: 'Arkansas', capital: 'Little Rock', cities: ['Fayetteville', 'Fort Smith', 'Jonesboro'] },
    CA: { name: 'California', capital: 'Sacramento', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
    CO: { name: 'Colorado', capital: 'Denver', cities: ['Colorado Springs', 'Aurora', 'Fort Collins'] },
    CT: { name: 'Connecticut', capital: 'Hartford', cities: ['Bridgeport', 'New Haven', 'Waterbury'] },
    DE: { name: 'Delaware', capital: 'Dover', cities: ['Wilmington', 'Newark', 'Middletown'] },
    FL: { name: 'Florida', capital: 'Tallahassee', cities: ['Miami', 'Tampa', 'Orlando'] },
    GA: { name: 'Georgia', capital: 'Atlanta', cities: ['Augusta', 'Savannah', 'Athens'] },
    HI: { name: 'Hawaii', capital: 'Honolulu', cities: ['Hilo', 'Kailua', 'Kaneohe'] },
    ID: { name: 'Idaho', capital: 'Boise', cities: ['Nampa', 'Pocatello', 'Meridian'] },
    IL: { name: 'Illinois', capital: 'Springfield', cities: ['Chicago', 'Aurora', 'Rockford'] },
    IN: { name: 'Indiana', capital: 'Indianapolis', cities: ['Fort Wayne', 'Evansville', 'South Bend'] },
    IA: { name: 'Iowa', capital: 'Des Moines', cities: ['Cedar Rapids', 'Davenport', 'Sioux City'] },
    KS: { name: 'Kansas', capital: 'Topeka', cities: ['Wichita', 'Kansas City', 'Lawrence'] },
    KY: { name: 'Kentucky', capital: 'Frankfort', cities: ['Louisville', 'Lexington', 'Covington'] },
    LA: { name: 'Louisiana', capital: 'Baton Rouge', cities: ['New Orleans', 'Shreveport', 'Lafayette'] },
    ME: { name: 'Maine', capital: 'Augusta', cities: ['Portland', 'Lewiston', 'Bangor'] },
    MD: { name: 'Maryland', capital: 'Annapolis', cities: ['Baltimore', 'Frederick', 'Gaithersburg'] },
    MA: { name: 'Massachusetts', capital: 'Boston', cities: ['Worcester', 'Springfield', 'Cambridge'] },
    MI: { name: 'Michigan', capital: 'Lansing', cities: ['Detroit', 'Grand Rapids', 'Warren'] },
    MN: { name: 'Minnesota', capital: 'Saint Paul', cities: ['Minneapolis', 'Rochester', 'Duluth'] },
    MS: { name: 'Mississippi', capital: 'Jackson', cities: ['Gulfport', 'Biloxi', 'Hattiesburg'] },
    MO: { name: 'Missouri', capital: 'Jefferson City', cities: ['Kansas City', 'Saint Louis', 'Springfield'] },
    MT: { name: 'Montana', capital: 'Helena', cities: ['Billings', 'Missoula', 'Great Falls'] },
    NE: { name: 'Nebraska', capital: 'Lincoln', cities: ['Omaha', 'Bellevue', 'Grand Island'] },
    NV: { name: 'Nevada', capital: 'Carson City', cities: ['Las Vegas', 'Henderson', 'Reno'] },
    NH: { name: 'New Hampshire', capital: 'Concord', cities: ['Manchester', 'Nashua', 'Derry'] },
    NJ: { name: 'New Jersey', capital: 'Trenton', cities: ['Newark', 'Jersey City', 'Paterson'] },
    NM: { name: 'New Mexico', capital: 'Santa Fe', cities: ['Albuquerque', 'Las Cruces', 'Roswell'] },
    NY: { name: 'New York', capital: 'Albany', cities: ['New York City', 'Buffalo', 'Rochester'] },
    NC: { name: 'North Carolina', capital: 'Raleigh', cities: ['Charlotte', 'Greensboro', 'Durham'] },
    ND: { name: 'North Dakota', capital: 'Bismarck', cities: ['Fargo', 'Grand Forks', 'Minot'] },
    OH: { name: 'Ohio', capital: 'Columbus', cities: ['Cleveland', 'Cincinnati', 'Toledo'] },
    OK: { name: 'Oklahoma', capital: 'Oklahoma City', cities: ['Tulsa', 'Norman', 'Broken Arrow'] },
    OR: { name: 'Oregon', capital: 'Salem', cities: ['Portland', 'Eugene', 'Gresham'] },
    PA: { name: 'Pennsylvania', capital: 'Harrisburg', cities: ['Philadelphia', 'Pittsburgh', 'Allentown'] },
    RI: { name: 'Rhode Island', capital: 'Providence', cities: ['Warwick', 'Cranston', 'Pawtucket'] },
    SC: { name: 'South Carolina', capital: 'Columbia', cities: ['Charleston', 'North Charleston', 'Greenville'] },
    SD: { name: 'South Dakota', capital: 'Pierre', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen'] },
    TN: { name: 'Tennessee', capital: 'Nashville', cities: ['Memphis', 'Knoxville', 'Chattanooga'] },
    TX: { name: 'Texas', capital: 'Austin', cities: ['Houston', 'Dallas', 'San Antonio'] },
    UT: { name: 'Utah', capital: 'Salt Lake City', cities: ['Provo', 'West Valley City', 'Orem'] },
    VT: { name: 'Vermont', capital: 'Montpelier', cities: ['Burlington', 'Rutland', 'Barre'] },
    VA: { name: 'Virginia', capital: 'Richmond', cities: ['Virginia Beach', 'Arlington', 'Alexandria'] },
    WA: { name: 'Washington', capital: 'Olympia', cities: ['Seattle', 'Spokane', 'Tacoma'] },
    WV: { name: 'West Virginia', capital: 'Charleston', cities: ['Huntington', 'Parkersburg', 'Morgantown'] },
    WI: { name: 'Wisconsin', capital: 'Madison', cities: ['Milwaukee', 'Green Bay', 'Kenosha'] },
    WY: { name: 'Wyoming', capital: 'Cheyenne', cities: ['Casper', 'Laramie', 'Gillette'] }
};

let geoGameState = {
    currentMode: 'state', // 'state' or 'capital'
    currentState: null,
    svgElement: null,
    originalViewBox: null,
    streak: 0,
    correct: 0,
    answered: false,
    remainingStates: [], // Queue of remaining states to ask
    // Round tracking
    totalAsked: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    missedStates: [], // Store {code, name} of incorrect answers
    // Streak tracking
    currentStreak: 0,
    longestStreak: 0
};

// Utility function: Fisher-Yates shuffle for uniform randomization
function shuffle(array) {
    const arr = [...array]; // Create a copy to avoid mutating original
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Build capital identification choices: correct capital + 2 same-state cities + 1 other capital
function buildCapitalChoices(targetCode) {
    const target = stateData[targetCode];
    
    // Get 2 random cities from same state (excluding capital)
    const sameStateCities = shuffle(target.cities).slice(0, 2);
    
    // Get a random capital from a different state
    const otherStateCodes = Object.keys(stateData).filter(code => code !== targetCode);
    const randomOtherCode = otherStateCodes[Math.floor(Math.random() * otherStateCodes.length)];
    const otherCapital = stateData[randomOtherCode].capital;
    
    // Combine: correct capital + 2 cities + 1 other capital
    const choices = [target.capital, ...sameStateCities, otherCapital];
    
    // Shuffle all 4 choices
    return shuffle(choices);
}

// Initialize or reset the state queue
function resetStateQueue() {
    geoGameState.remainingStates = Object.keys(stateData)
        .sort(() => Math.random() - 0.5);
}

// Get next state from queue, reshuffle if needed
function getNextState() {
    if (geoGameState.remainingStates.length === 0) {
        resetStateQueue();
    }
    return geoGameState.remainingStates.pop();
}

// Load and inject the SVG map
function loadGeographySVG() {
    const container = document.getElementById('geoMapContainer');
    if (!container) return;

    fetch('images/us.svg')
        .then(response => response.text())
        .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svg = svgDoc.documentElement;
            
            // Set SVG dimensions
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svg.style.cursor = 'pointer';
            
            // Add CSS styles for state paths
            if (!document.getElementById('geo-svg-styles')) {
                const style = document.createElement('style');
                style.id = 'geo-svg-styles';
                style.textContent = `
                    #geoMapContainer svg path.state {
                        fill: #e6e6e6 !important;
                        stroke: #555 !important;
                        stroke-width: 0.8 !important;
                        vector-effect: non-scaling-stroke !important;
                        transition: fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease !important;
                    }
                    
                    #geoMapContainer svg path.state.active {
                        fill: #d32f2f !important;
                        stroke: #111 !important;
                        stroke-width: 2 !important;
                    }
                    
                    #geoMapContainer svg path.state.dimmed {
                        fill: #f0f0f0 !important;
                    }
                    
                    #geoMapContainer svg path.state:hover:not(.active) {
                        fill: #c0c0c0 !important;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Store original viewBox for reset
            geoGameState.originalViewBox = svg.getAttribute('viewBox');
            geoGameState.svgElement = svg;
            
            // Set default styling for all state paths
            svg.querySelectorAll('path').forEach(path => {
                const stateCode = path.id;
                if (stateCode in stateData) {
                    // Remove any inline fill attributes
                    path.removeAttribute('fill');
                    path.style.fill = '';
                    
                    // Apply state class for CSS styling
                    path.classList.add('state');
                    
                    // Add click handler for state identification mode
                    path.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        
                        // Only process clicks in "state" identification mode
                        if (geoGameState.currentMode === 'state') {
                            // Check if this is the highlighted state
                            const clickedAnswer = stateData[stateCode].name;
                            checkGeographyAnswer(clickedAnswer);
                        }
                    });
                }
            });
            
            container.innerHTML = '';
            container.appendChild(svg);
            
            // Start first question
            startGeographyQuestion();
        })
        .catch(err => console.error('Error loading SVG:', err));
}

// Determine if a state is small enough to warrant zooming
function shouldZoom(stateEl, svg) {
    const stateBox = stateEl.getBBox();
    const svgBox = svg.viewBox.baseVal;
    
    const stateArea = stateBox.width * stateBox.height;
    const svgArea = svgBox.width * svgBox.height;
    
    // Only zoom if state is less than 1.5% of the total SVG area
    // This captures very small states like RI, CT, MA, NJ, DE, MD
    return (stateArea / svgArea) < 0.015;
}

// Context-preserving zoom for small states
// Keeps nearby states visible while enlarging the small state
function zoomToSmallState(stateEl, svg) {
    const box = stateEl.getBBox();
    
    // Use 2.5x padding (more conservative than 0.4x)
    // This maintains regional context instead of isolating the state
    const paddingX = box.width * 2.5;
    const paddingY = box.height * 2.5;
    
    const newViewBox = `${box.x - paddingX} ${box.y - paddingY} ${box.width + paddingX * 2} ${box.height + paddingY * 2}`;
    svg.setAttribute('viewBox', newViewBox);
}

// Highlight a state and conditionally zoom if it's small enough
function highlightStateGeo(stateCode, gameMode = 'state') {
    if (!geoGameState.svgElement) return;
    
    // Remove active and dimmed classes from all states
    geoGameState.svgElement.querySelectorAll('path').forEach(path => {
        path.classList.remove('active', 'dimmed');
    });
    
    // Highlight current state
    const statePath = document.getElementById(stateCode);
    if (statePath) {
        statePath.classList.add('active');
        
        // Dim all other states slightly for context
        geoGameState.svgElement.querySelectorAll('path').forEach(path => {
            if (path.id !== stateCode) {
                path.classList.add('dimmed');
            }
        });
        
        // Conditionally zoom based on state size
        // Only for 'state' identification mode with very small states
        if (gameMode === 'state' && shouldZoom(statePath, geoGameState.svgElement)) {
            zoomToSmallState(statePath, geoGameState.svgElement);
        } else {
            // Keep full US map in view for context
            geoGameState.svgElement.setAttribute('viewBox', geoGameState.originalViewBox);
        }
    }
}

// Start a new geography question
function startGeographyQuestion() {
    geoGameState.answered = false;
    document.getElementById('geoFeedback').textContent = '';
    document.getElementById('geoFeedback').style.color = '';
    
    // Get next state from queue (no repeats until all 50 exhausted)
    const randomCode = getNextState();
    geoGameState.currentState = { abbr: randomCode, ...stateData[randomCode] };
    
    // Highlight state based on mode
    highlightStateGeo(randomCode, geoGameState.currentMode);
    
    // Set question
    const questionEl = document.getElementById('geoQuestion');
    if (geoGameState.currentMode === 'state') {
        questionEl.textContent = 'What state is this?';
    } else {
        questionEl.textContent = `What is the capital of ${geoGameState.currentState.name}?`;
    }
    
    // Generate answer options (4 random)
    const answers = generateGeographyAnswers();
    renderGeographyAnswers(answers);
}

// Generate 4 answer options
function generateGeographyAnswers() {
    // For state identification: pick 3 random other state names
    if (geoGameState.currentMode === 'state') {
        const allStateNames = Object.values(stateData).map(s => s.name);
        const correctAnswer = geoGameState.currentState.name;
        
        // Remove correct answer from pool
        const otherStates = allStateNames.filter(name => name !== correctAnswer);
        
        // Pick 3 random others
        const wrongAnswers = shuffle(otherStates).slice(0, 3);
        
        // Combine and shuffle
        return shuffle([correctAnswer, ...wrongAnswers]);
    } 
    // For capital identification: use specialized choice builder
    else {
        return buildCapitalChoices(geoGameState.currentState.abbr);
    }
}

// Render answer buttons
function renderGeographyAnswers(answers) {
    const container = document.getElementById('geoAnswers');
    container.innerHTML = '';
    
    answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.style.fontSize = '1.1em';
        btn.style.padding = '1rem';
        btn.style.border = '2px solid #0077b6';
        btn.style.borderRadius = '8px';
        btn.style.background = '#fff';
        btn.style.color = '#0077b6';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'all 0.2s';
        
        btn.addEventListener('mouseover', () => {
            btn.style.background = '#e3f2fd';
            btn.style.transform = 'scale(1.05)';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.background = '#fff';
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => checkGeographyAnswer(answer));
        
        container.appendChild(btn);
    });
}

// Check if answer is correct
function checkGeographyAnswer(answer) {
    if (geoGameState.answered) return;
    geoGameState.answered = true;
    
    const feedbackEl = document.getElementById('geoFeedback');
    const correctAnswer = geoGameState.currentMode === 'state' 
        ? geoGameState.currentState.name 
        : geoGameState.currentState.capital;
    
    if (answer === correctAnswer) {
        feedbackEl.textContent = '✓ Correct!';
        feedbackEl.style.color = '#4caf50';
        geoGameState.streak++;
        geoGameState.correct++;
        geoGameState.correctAnswers++;
        geoGameState.currentStreak++;
        geoGameState.longestStreak = Math.max(geoGameState.longestStreak, geoGameState.currentStreak);
        playGameSound('correct');
    } else {
        feedbackEl.textContent = `✗ Wrong! The answer is ${correctAnswer}`;
        feedbackEl.style.color = '#f44336';
        geoGameState.streak = 0;
        geoGameState.currentStreak = 0;
        geoGameState.incorrectAnswers++;
        // Track missed state
        geoGameState.missedStates.push({
            code: geoGameState.currentState.abbr,
            name: geoGameState.currentState.name
        });
        playGameSound('wrong');
    }
    
    geoGameState.totalAsked++;
    
    // Update stats
    document.getElementById('geoStreak').textContent = geoGameState.streak;
    document.getElementById('geoCorrect').textContent = geoGameState.correct;
    
    // Check if round is complete (all 50 states asked)
    if (geoGameState.totalAsked >= 50) {
        // Show results screen after 2 seconds
        setTimeout(() => {
            showGeographyResults();
        }, 2000);
    } else {
        // Reset map styling and load next question after 2 seconds
        setTimeout(() => {
            // Remove active and dimmed classes from all states
            geoGameState.svgElement.querySelectorAll('path').forEach(path => {
                path.classList.remove('active', 'dimmed');
            });
            // Reset viewBox to full US
            geoGameState.svgElement.setAttribute('viewBox', geoGameState.originalViewBox);
            startGeographyQuestion();
        }, 2000);
    }
}

// Initialize geography game
function initGeographyGame() {
    const stateBtn = document.getElementById('stateIdentifyBtn');
    const capitalBtn = document.getElementById('capitalIdentifyBtn');
    
    if (!stateBtn || !capitalBtn) return;
    
    // Helper function to switch modes and reset progress
    function switchMode(newMode) {
        geoGameState.currentMode = newMode;
        geoGameState.streak = 0;
        geoGameState.correct = 0;
        geoGameState.answered = false;
        
        // Reset and reshuffle state queue
        resetStateQueue();
        
        // Update stats display
        document.getElementById('geoStreak').textContent = 0;
        document.getElementById('geoCorrect').textContent = 0;
        
        // Clear feedback
        const feedbackEl = document.getElementById('geoFeedback');
        feedbackEl.textContent = '';
        feedbackEl.style.color = '';
        
        // Start fresh question
        startGeographyQuestion();
    }
    
    // Mode switching: State mode
    stateBtn.addEventListener('click', () => {
        stateBtn.style.background = '#0077b6';
        stateBtn.style.color = 'white';
        capitalBtn.style.background = '#90caf9';
        capitalBtn.style.color = '#0077b6';
        switchMode('state');
    });
    
    // Mode switching: Capital mode
    capitalBtn.addEventListener('click', () => {
        capitalBtn.style.background = '#0077b6';
        capitalBtn.style.color = 'white';
        stateBtn.style.background = '#90caf9';
        stateBtn.style.color = '#0077b6';
        switchMode('capital');
    });
    
    // Initialize SVG once on page load
    if (!geoGameState.svgElement) {
        loadGeographySVG();
    } else {
        // SVG already loaded, just start game
        resetStateQueue();
        startGeographyQuestion();
    }
}

// Show results screen after all 50 states completed
function showGeographyResults() {
    const gameContainer = document.getElementById('geography-game');
    const accuracy = Math.round((geoGameState.correctAnswers / 50) * 100);
    const mode = geoGameState.currentMode === 'state' ? 'State Identification' : 'Capital Identification';
    
    let missedStatesHtml = '';
    if (geoGameState.missedStates.length > 0) {
        missedStatesHtml = `
            <div class="geo-missed-section">
                <h3>States to Review</h3>
                <ul class="geo-missed-list">
                    ${geoGameState.missedStates.map(state => `<li>${state.name}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    const resultsHtml = `
        <div class="geo-results-screen">
            <h2 class="geo-results-title">Round Complete!</h2>
            <p class="geo-results-mode">Mode: ${mode}</p>
            
            <div class="geo-score-summary">
                <p class="geo-score-line">Correct: <span class="geo-score-correct">${geoGameState.correctAnswers}</span> / <span class="geo-score-total">50</span></p>
                <p class="geo-score-line">Accuracy: <span class="geo-score-accuracy">${accuracy}%</span></p>
                <p class="geo-score-line">Longest Streak: <span class="geo-score-streak">${geoGameState.longestStreak}</span></p>
            </div>
            
            ${missedStatesHtml}
            
            <div class="geo-restart-buttons">
                <button id="geoPlayAgain" class="geo-restart-btn geo-restart-primary">Play Again (Same Mode)</button>
                <button id="geoSwitchMode" class="geo-restart-btn geo-restart-secondary">Switch Game Mode</button>
            </div>
        </div>
    `;
    
    gameContainer.innerHTML = resultsHtml;
    
    // Attach event listeners
    document.getElementById('geoPlayAgain').addEventListener('click', resetGeographyRound);
    document.getElementById('geoSwitchMode').addEventListener('click', showGeographyModeSelection);
}

// Reset and restart current game mode
function resetGeographyRound() {
    geoGameState.totalAsked = 0;
    geoGameState.correctAnswers = 0;
    geoGameState.incorrectAnswers = 0;
    geoGameState.missedStates = [];
    geoGameState.streak = 0;
    geoGameState.correct = 0;
    geoGameState.answered = false;
    geoGameState.currentStreak = 0;
    geoGameState.longestStreak = 0;
    
    // Reshuffle state queue and restart
    resetStateQueue();
    
    // Rebuild game UI
    rebuildGeographyGameUI();
    
    // Start fresh
    startGeographyQuestion();
}

// Show mode selection and reset to choose mode
function showGeographyModeSelection() {
    const gameContainer = document.getElementById('geography-game');
    gameContainer.innerHTML = `
        <h2 style="color:#0077b6;text-align:center;margin-top:0;">US Geography Challenge</h2>
        
        <div id="modeSelector" class="geo-mode-selector" style="margin-top: 3rem;">
            <button id="stateIdentifyBtn" class="geo-mode-btn" data-mode="state" style="font-weight:bold;">Identify the State</button>
            <button id="capitalIdentifyBtn" class="geo-mode-btn" data-mode="capital" style="font-weight:bold;">Identify the Capital</button>
        </div>
    `;
    
    // Re-initialize mode buttons
    const stateBtn = document.getElementById('stateIdentifyBtn');
    const capitalBtn = document.getElementById('capitalIdentifyBtn');
    
    function switchMode(newMode) {
        geoGameState.currentMode = newMode;
        geoGameState.totalAsked = 0;
        geoGameState.correctAnswers = 0;
        geoGameState.incorrectAnswers = 0;
        geoGameState.missedStates = [];
        geoGameState.streak = 0;
        geoGameState.correct = 0;
        geoGameState.answered = false;
        geoGameState.currentStreak = 0;
        geoGameState.longestStreak = 0;
        
        resetStateQueue();
        rebuildGeographyGameUI();
        startGeographyQuestion();
    }
    
    stateBtn.addEventListener('click', () => {
        stateBtn.style.background = '#0077b6';
        stateBtn.style.color = 'white';
        capitalBtn.style.background = '#90caf9';
        capitalBtn.style.color = '#0077b6';
        switchMode('state');
    });
    
    capitalBtn.addEventListener('click', () => {
        capitalBtn.style.background = '#0077b6';
        capitalBtn.style.color = 'white';
        stateBtn.style.background = '#90caf9';
        stateBtn.style.color = '#0077b6';
        switchMode('capital');
    });
}

// Rebuild game UI from scratch (used after results screen)
function rebuildGeographyGameUI() {
    const gameContainer = document.getElementById('geography-game');
    gameContainer.innerHTML = `
        <h2 style="color:#0077b6;text-align:center;margin-top:0;">US Geography Challenge</h2>
        
        <div id="modeSelector" class="geo-mode-selector">
            <button id="stateIdentifyBtn" class="geo-mode-btn" data-mode="state" style="font-weight:bold;">Identify the State</button>
            <button id="capitalIdentifyBtn" class="geo-mode-btn" data-mode="capital" style="font-weight:bold;">Identify the Capital</button>
        </div>

        <div class="geo-main-layout">
            <div class="geo-map-section">
                <div id="geoMapContainer" class="geo-map-container"></div>
            </div>
            
            <div class="geo-controls-section">
                <div id="geoQuestion" class="geo-question"></div>
                <div id="geoAnswers" class="geo-answers"></div>
                <div id="geoFeedback" class="geo-feedback"></div>
                <div class="geo-stats">
                    <span>Streak: <span id="geoStreak">0</span></span>
                    <span>Correct: <span id="geoCorrect">0</span></span>
                </div>
            </div>
        </div>
    `;
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Other initialization code here...
    initGeographyGame();
    initArcheryGame();
});
