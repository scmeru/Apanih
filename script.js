const colors = ['#ff69b4', '#7fccde', '#ffd700', '#90EE90', '#ff9ecd']; 
const BLOW_THRESHOLD = 85; // Threshold for detecting a blow. Turunkan untuk lebih sensitif, naikkan untuk kurang sensitif.
let blowDetected = false; // Flag to ensure one-time events happen only once

// Confetti defaults, defined globally
const confettiDefaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, colors: colors, particleCount: 50 };

// Function to launch confetti in bursts to prevent lag
async function launchConfettiInBursts() {
    while (true) {
        const promise1 = confetti({ ...confettiDefaults, origin: { x: Math.random(), y: Math.random() } });
        const promise2 = confetti({ ...confettiDefaults, origin: { x: Math.random(), y: Math.random() } });
        await Promise.all([promise1, promise2]);
        await new Promise(resolve => setTimeout(resolve, 1200));
    }
}
// Function to create flags
function createFlags() {
    const container = document.querySelector('.flags-container');
    const flagCount = 12; // Number of flags

    // Only create flags if they haven't been created yet or if needed
    if (container.children.length === 0) {
        for (let i = 0; i < flagCount; i++) {
            const flag = document.createElement('div');
            flag.className = 'flag';
            flag.style.backgroundColor = colors[i % colors.length];
            container.appendChild(flag);
        }
    }
}

const micButton = document.getElementById('micButton');
const musicButton = document.getElementById('musicButton');
const hbdSong = document.getElementById('hbdSong');
const blowPrompt = document.getElementById('blow-prompt'); // Get the blow prompt element

// Define audio-related variables in a higher scope
let analyser;
let dataArray;
let bufferLength;

// Handle music button click
musicButton.addEventListener('click', () => {
    hbdSong.play();
    // Set the song to loop
    hbdSong.loop = true;


    // First, transition the background from black to the first party color
    document.body.style.backgroundColor = '#fdf2d4';

    // After the initial transition (2s), start the looping animation
    setTimeout(() => {
        document.body.classList.add('animated-background');
    }, 2000); // This should match the 'transition-duration' on the body

    // Fade out the main container (buttons)
    const mainContainer = document.getElementById('main-container');
    mainContainer.style.opacity = '0';
    setTimeout(() => {
        mainContainer.classList.add('hidden');
    }, 500); // Match this duration with the CSS transition for opacity

    const cakeContainer = document.getElementById('cake-container');
    cakeContainer.style.visibility = 'visible';
    cakeContainer.style.opacity = '1';
    
    // Show the blow prompt
    blowPrompt.classList.remove('hidden');

    // Start sound detection only after music button is clicked
    if (typeof detectBlow === 'function') {
        detectBlow();
    }

    // Debug image loading
    console.log('Cake container displayed');
    const cakeOn = document.getElementById('cake-on');
    const cakeOff = document.getElementById('cake-off');
    console.log('Cake on image:', cakeOn);
    console.log('Cake off image:', cakeOff);
    
});



// Handle microphone button click
micButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });        
        console.log('Microphone access granted');

        // Hide mic button and show music button
        micButton.classList.add('hidden'); // Menggunakan class untuk konsistensi
        musicButton.classList.remove('hidden'); // Show music button
        
        // Create audio context and analyzer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser(); // Assign to the global analyser variable
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        // Configure analyzer
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    } catch (error) {
        console.error('Error accessing microphone:', error);
        micButton.textContent = 'Mic Error!';
    }
});

// Function to detect sound level, defined globally
function detectBlow() {
    // Ensure analyser is ready before proceeding
    if (!analyser) {
        requestAnimationFrame(detectBlow); // Wait for analyser to be initialized
        return;
    }

    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    let avg = sum / bufferLength;
    
    console.log('Current sound level:', avg);
    
    // Check if sound is loud enough AND it's the first blow
    if (avg > BLOW_THRESHOLD && !blowDetected) {
        console.log('First blow detected!');
        blowDetected = true; // Set flag to true
        
        // Switch cake images
        document.querySelector('.cake-wrapper').classList.add('blown');
        
        // Create flags only when blow is detected
        createFlags();

        // --- Confetti Logic ---
        // Initial burst of confetti
        for (let i = 0; i < 10; i++) {
            confetti({ ...confettiDefaults, origin: { x: Math.random(), y: Math.random() } });
        }

        // Start continuous confetti
        launchConfettiInBursts();

        // Find the balloon and make it fly
        const balloon = document.getElementById('balloon');
        if (balloon) {
            blowPrompt.classList.add('hidden');
            balloon.classList.add('flying');
        }

        // Show Happy Birthday message after animation
        setTimeout(() => {
            const msg = document.getElementById('message');
            msg.style.opacity = '1';
            
            const lines = msg.querySelectorAll('p');
            
            lines.forEach((line, index) => {
                setTimeout(() => {
                    anime({
                        targets: line,
                        opacity: 1,
                        maxWidth: '100%',
                        easing: 'easeInOutExpo',
                        duration: 4500,
                        begin: function(anim) {
                            line.style.opacity = '0';
                            line.style.maxWidth = '0';
                        },
                        complete: function(anim) {
                            line.style.overflow = 'visible';
                        }
                    });
                }, index * 3500);
            });
        }, 2000);

    }
    
    // Continue monitoring only if not yet blown
    if (!blowDetected) {
        requestAnimationFrame(detectBlow);
    }
}
