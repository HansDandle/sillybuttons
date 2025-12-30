// List of kid-friendly websites
const kidSites = [
    "https://pbskids.org/",
    "https://www.coolmathgames.com/",
    "https://www.nationalgeographickids.com/",
    "https://www.funbrain.com/",
    "https://www.nickjr.com/",
    "https://www.sesamestreet.org/",
    "https://www.starfall.com/",
    "https://www.switchzoo.com/",
    "https://pointerpointer.com/",
    "https://www.kidrex.org/"
];



const buttons = document.querySelectorAll('.sillyButton');
const sound = document.getElementById('sillySound');
const nauticalBg = document.querySelector('.nautical-bg');

// List of available silly sounds
const sillySounds = [
    'sounds/quack_5.mp3',
    'sounds/sponge-bob-mp3-454746.mp3', // SpongeBob strobe
    'sounds/a-few-moments-later-sponge-bob-sfx-fun.mp3',
    'sounds/my-leg-sound-effects.mp3',
    'sounds/spongebob-fail.mp3',
    'sounds/squish-sound-effect.mp3'
];

buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Add a quick spin animation
        button.style.transition = 'transform 0.3s';
        button.style.transform = 'scale(1.2) rotate(12deg)';
        setTimeout(() => {
            button.style.transform = '';
        }, 300);

        // Pick a random silly sound
        const randomSound = sillySounds[Math.floor(Math.random() * sillySounds.length)];
        sound.src = randomSound;
        sound.currentTime = 0;
        sound.play();

        // If SpongeBob sound, strobe the background
        if (randomSound.includes('sponge-bob-mp3-454746')) {
            nauticalBg.classList.add('strobe');
            sound.onended = () => {
                nauticalBg.classList.remove('strobe');
                const randomSite = kidSites[Math.floor(Math.random() * kidSites.length)];
                window.location.href = randomSite;
            };
        } else {
            sound.onended = () => {
                const randomSite = kidSites[Math.floor(Math.random() * kidSites.length)];
                window.location.href = randomSite;
            };
        }
    });
});
