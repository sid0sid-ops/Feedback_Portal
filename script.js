// Background Animation (Curving RNA Helix representation - Light Theme Mac Version)
function drawBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let time = 0;

    // Config
    const helixRadius = 130; // wider curve
    const pairsCount = window.innerWidth < 768 ? 20 : 40;
    const verticalGap = 25;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Colors mapping to purely Mac/Apple light theme
        const color1 = 'rgba(0, 102, 204, 0.15)'; // Mac Blue
        const color2 = 'rgba(88, 86, 214, 0.12)'; // Apple Indigo
        const lineColor = 'rgba(0, 0, 0, 0.03)';

        // Base X position centered in the middle right
        const centerX = canvas.width * 0.85;
        // Float the entire helix up and down slightly for a slow soothing feel
        time += 0.005;
        const offsetY = Math.sin(time) * 50;

        for (let i = 0; i < pairsCount; i++) {
            // Calculate base Y position for this pair
            let yPos = (i * verticalGap + (time * 50)) % (canvas.height + 200) - 100 + offsetY;

            // Calculate 3D rotation angle for this specific pair
            let angle = (i * 0.25) + time;

            // Project 3D to 2D using sine/cosine
            let x1 = centerX + Math.cos(angle) * helixRadius;
            let z1 = Math.sin(angle); // depth factor

            let x2 = centerX + Math.cos(angle + Math.PI) * helixRadius;
            let z2 = Math.sin(angle + Math.PI);

            const scale1 = (z1 + 2) * 2;
            const scale2 = (z2 + 2) * 2;

            if (yPos > -50 && yPos < canvas.height + 50) {
                // Background connection line
                ctx.beginPath();
                ctx.moveTo(x1, yPos);
                ctx.lineTo(x2, yPos);
                ctx.lineWidth = 1;
                ctx.strokeStyle = lineColor;
                ctx.stroke();

                // Draw Node 1
                ctx.beginPath();
                ctx.arc(x1, yPos, scale1, 0, Math.PI * 2);
                ctx.fillStyle = color1;
                ctx.fill();

                // Draw Node 2
                ctx.beginPath();
                ctx.arc(x2, yPos, scale2, 0, Math.PI * 2);
                ctx.fillStyle = color2;
                ctx.fill();
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Canvas only
    drawBackground();

    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('submitBtn');
            const statusDiv = document.getElementById('formStatus');
            const originalBtnHtml = btn.innerHTML;

            const formData = new FormData(feedbackForm);

            // Join Checkbox string
            const sessions = formData.getAll('sessions').join(', ');
            formData.set('sessions', sessions);

            const dataPayload = Object.fromEntries(formData);

            // Validation Check
            if (!dataPayload.lecture_rating || !dataPayload.handson_rating || !dataPayload.clarity_rating || !dataPayload.overall_rating) {
                showStatus(statusDiv, 'error', 'Please complete all numerical evaluation questions.');
                return;
            }

            // Explicit Email Verification
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(dataPayload.email)) {
                showStatus(statusDiv, 'error', 'Please enter a properly formatted email address.');
                return;
            }

            // Disable button
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';
            statusDiv.classList.add('hidden');

            // Set deployment ID here
            const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpeod6Y9q6I1GllS1AEBYblICR2yyuBPBVJa-D5HV5oo37rYOn0OWKPWu6cqQVd_Xq/exec";

            try {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(dataPayload)
                });

                feedbackForm.reset();
                showStatus(statusDiv, 'success', 'Your submission is complete!!');

                // Uniquely smooth scrollTo top of form
                document.querySelector('main').scrollIntoView({ behavior: 'smooth', block: 'start' });

            } catch (error) {
                console.error("Error submitting form:", error);
                showStatus(statusDiv, 'error', 'A network connection error occurred. Please try again.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalBtnHtml;
            }
        });
    }
});

function showStatus(element, type, message) {
    element.textContent = '';
    element.className = 'mt-6 p-4 rounded-xl text-center font-medium animate-fade-in text-[14px] flex items-center justify-center gap-2 block bg-white border';

    if (type === 'success') {
        element.classList.add('text-[#0066cc]', 'border-[#0066cc]/20', 'shadow-[0_4px_12px_rgba(0,102,204,0.08)]');
        element.innerHTML = '<i class="fa-solid fa-circle-check text-lg"></i> ' + message;
    } else {
        element.classList.add('text-[#ff3b30]', 'border-[#ff3b30]/20', 'shadow-[0_4px_12px_rgba(255,59,48,0.08)]');
        element.innerHTML = '<i class="fa-solid fa-circle-exclamation text-lg"></i> ' + message;
    }

    element.classList.remove('hidden');
}
