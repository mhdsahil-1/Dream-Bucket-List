// --- Element Selectors ---
const timeDisplay = document.getElementById('time-display');
const dateDisplay = document.getElementById('date-display');
const themeBtn = document.getElementById('theme-btn');

// --- Clock Logic ---
function updateClock() {
    const now = new Date();
    
    // Format the time (e.g., 14:05:09)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    // Format the date (e.g., Monday, October 23, 2023)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString(undefined, options);
}

// Start the clock immediately, then update every 1000 milliseconds (1 second)
updateClock();
setInterval(updateClock, 1000);

// --- Theme Toggle Logic ---
themeBtn.addEventListener('click', () => {
    // Toggle the 'dark-mode' class on the body tag
    document.body.classList.toggle('dark-mode');
    
    // Update the button text based on the current mode
    if (document.body.classList.contains('dark-mode')) {
        themeBtn.textContent = 'Toggle Light Mode';
    } else {
        themeBtn.textContent = 'Toggle Dark Mode';
    }
});