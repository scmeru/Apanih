const colors = ['#ff69b4', '#7fccde', '#ffd700', '#90EE90', '#ff9ecd']; 
const BLOW_THRESHOLD = 70; // Threshold for detecting a blow. Turunkan untuk lebih sensitif, naikkan untuk kurang sensitif.
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
    detectBlow();

    // Debug image loading
    console.log('Cake container displayed');
    const cakeOn = document.getElementById('cake-on');
    const cakeOff = document.getElementById('cake-off');
    console.log('Cake on image:', cakeOn);
    console.log('Cake off image:', cakeOff);
    
    // Create flags here, only once when the cake scene is visible
    createFlags();
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
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        // Configure analyzer
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Function to detect sound level
        function detectBlow() {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            let avg = sum / bufferLength;
            
            // Hanya update teks tombol mic jika masih terlihat
            if (!micButton.classList.contains('hidden')) {
                micButton.textContent = `Mic Level: ${Math.round(avg)}`;
            }
            console.log('Current sound level:', avg);
            
            // Check if sound is loud enough AND it's the first blow
            if (avg > BLOW_THRESHOLD && !blowDetected) {
                console.log('First blow detected!');
                blowDetected = true; // Set flag to true
                
                // Switch cake images
                document.querySelector('.cake-wrapper').classList.add('blown');
                
                // --- Confetti Logic using canvas-confetti ---
                // --- New Confetti Logic using canvas-confetti ---
                // Initial burst of confetti
                for (let i = 0; i < 10; i++) { // Adjust the number of initial bursts as needed
                    confetti({ ...confettiDefaults, origin: { x: Math.random(), y: Math.random() } });
                }

                // Function to launch confetti in bursts to prevent lag
                // Panggil fungsi yang sudah didefinisikan secara global
                launchConfettiInBursts();

                // Find the balloon and make it fly
                const balloon = document.getElementById('balloon');
                if (balloon) {
                    // Hide the blow prompt once blow is detected
                    blowPrompt.classList.add('hidden');

                    balloon.classList.add('flying');
                }

                // Show Happy Birthday message after animation
                setTimeout(() => {
                    const msg = document.getElementById('message');
                    msg.style.opacity = '1'; // Make the whole message visible
                    
                    // Ambil semua baris pesan
                    const lines = msg.querySelectorAll('p');
                    
                    // Tampilkan satu per satu dengan jeda lembut
                    lines.forEach((line, index) => {
                        setTimeout(() => {
                            anime({
                                targets: line,
                                opacity: 1,
                                maxWidth: '100%',
                                easing: 'easeInOutExpo',
                                duration: 4500, // <-- UBAH INI untuk kecepatan animasi per baris (dalam milidetik)
                                begin: function(anim) {
                                    // Set initial styles before animation
                                    line.style.opacity = '0';
                                    line.style.maxWidth = '0';
                                },
                                complete: function(anim) {
                                    // Set final styles after animation
                                    line.style.overflow = 'visible';
                                }
                            });
                        }, index * 3500); // <-- UBAH INI untuk jeda waktu antar baris (dalam milidetik)
                    });
                }, 2000);

            }
            
            // Continue monitoring
            requestAnimationFrame(detectBlow);
        }
        



    } catch (error) {
        console.error('Error accessing microphone:', error);
        micButton.textContent = 'Mic Error!';
    }
});

