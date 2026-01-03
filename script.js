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
document.addEventListener('DOMContentLoaded', () => {
    updateBirthdayCountdown();
    setInterval(updateBirthdayCountdown, 1000); // Update every second
});

// --- Custom Items (localStorage + Supabase) logic ---
async function loadCustomLinksFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('custom_links')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading from Supabase:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Supabase fetch failed:', e);
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

// Load custom items on startup (from localStorage for now)
renderCustomItems();

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
// Treasure chest popup logic
const treasureChest = document.querySelector('.treasure-chest');
const treasurePopup = document.getElementById('treasurePopup');
const closeTreasure = document.getElementById('closeTreasure');
if (treasureChest && treasurePopup && closeTreasure) {
    treasureChest.addEventListener('click', () => {
        treasurePopup.style.setProperty('display', 'block', 'important');
    });
    treasureChest.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
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
    "https://www.nationalgeographickids.com/",
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
    "https://www.thatsthefinger.com/",
    "https://www.youtube.com/@HydraulicPressChannel",
    "https://www.pointerpointer.com/",
    "https://www.fallingfalling.com/",
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

// Assign a random site to each button and display a friendly name
const assignedSites = Array.from({length: buttons.length}, () => kidSites[Math.floor(Math.random() * kidSites.length)]);
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
            .then(data => {
                if (data && data.error) {
                    console.error('Error:', data.error);
                    alert('Database error: ' + data.error);
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
