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
        whackamoleGame.style.display = 'block';
    });
}
if (wmClose && whackamoleGame) {
    wmClose.addEventListener('click', () => {
        whackamoleGame.style.display = 'none';
        wmGameActive = false;
        wmStart.disabled = false;
        if (wmTimeout) clearTimeout(wmTimeout);
        wmHoles.forEach(h => { h.innerHTML = ''; h.classList.remove('active'); });
    });
}
if (wmStart) {
    wmStart.addEventListener('click', startWhackamole);
}
// Treasure chest popup logic
const treasureChest = document.querySelector('.treasure-chest');
const treasurePopup = document.getElementById('treasurePopup');
const closeTreasure = document.getElementById('closeTreasure');
if (treasureChest && treasurePopup && closeTreasure) {
    treasureChest.addEventListener('click', () => {
        treasurePopup.style.display = 'block';
    });
    treasureChest.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            treasurePopup.style.display = 'block';
        }
    });
    closeTreasure.addEventListener('click', () => {
        treasurePopup.style.display = 'none';
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
    "https://www.nationalgeographickids.com/",
    "https://www.funbrain.com/",
    "https://www.sesamestreet.org/",
    "https://www.starfall.com/",
    "https://www.switchzoo.com/",
    "https://pointerpointer.com/",
    "https://www.rainymood.com/",
    "https://www.theuselessweb.com/",
    "https://www.koalastothemax.com/",
    "https://www.bouncingdvdlogo.com/",
    "https://www.zoomquilt.org/",
    "https://www.fallingfalling.com/",
    "https://www.rrrgggbbb.com/",
    "https://www.eyebleach.me/",
    "https://www.drawastickman.com/",
    "https://www.thatsthefinger.com/",
    "https://www.froggyandthebull.com/",
    "https://www.rrrgggbbb.com/",
    "https://www.ouaismaisbon.ch/",
    "https://www.veryverynice.com/",
    "https://www.ouaismaisbon.ch/",
    "https://www.koalastothemax.com/",
    "https://www.rrrgggbbb.com/",
    "https://www.silkmoth.club/",
    "https://www.bouncingdvdlogo.com/",
    "https://www.zoomquilt.org/",
    "https://www.pointerpointer.com/",
    "https://www.fallingfalling.com/",
    "https://www.catslap.com/",
    "https://www.eyebleach.me/",
    "https://www.drawastickman.com/"
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

// Assign a random site to each button and display it
const assignedSites = Array.from({length: buttons.length}, () => kidSites[Math.floor(Math.random() * kidSites.length)]);
siteLabels.forEach((label, i) => {
    label.textContent = assignedSites[i];
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
