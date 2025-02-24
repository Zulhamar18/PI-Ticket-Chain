// Inisialisasi Pi SDK dalam mode sandbox
window.Pi.init({
    sandbox: true, // Aktifkan mode sandbox
    version: "2.0"
});

// Fungsi untuk menangani otentikasi pengguna
async function authenticateUser() {
    try {
        const scopes = ['username', 'email']; // Scope yang diminta
        const onIncompletePaymentFound = (payment) => {
            console.log('Incomplete payment found:', payment);
        };
        const authRes = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
        const accessToken = authRes.accessToken;

        // Verifikasi token dengan API /me
        const meResponse = await axios.get('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const userData = meResponse.data;
        console.log('User authenticated:', userData);

        // Simpan data pengguna di localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        alert(`Welcome, ${userData.username}! You are now logged in.`);
        window.location.href = 'dashboard.html'; // Redirect ke dashboard
    } catch (error) {
        console.error('Authentication failed:', error);
        alert('Login failed. Please try again.');
    }
}

// Event listener untuk tombol "Login with Pi"
document.getElementById('loginButton')?.addEventListener('click', authenticateUser);

// Event listener untuk tombol "Explore Now"
document.getElementById('startButton')?.addEventListener('click', () => {
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = 'dashboard.html';
    } else {
        alert('Welcome to Ticket-Chain! Please log in to explore all features.');
    }
});

// Event listener untuk tombol "Buy Ticket"
document.getElementById('buyTicketButton')?.addEventListener('click', async () => {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('Please log in to buy a ticket.');
        return;
    }
    try {
        const paymentData = {
            amount: 1, // Jumlah Pi
            memo: "Ticket Purchase",
            metadata: { ticketType: "General Admission" },
            uid: JSON.parse(user).uid // UID pengguna
        };

        // Kirim permintaan pembayaran ke backend Anda
        const response = await axios.post('https://your-backend-domain.com/payments', paymentData);
        console.log('Payment created:', response.data);
        alert('Payment initiated successfully! Please complete the transaction.');
    } catch (error) {
        console.error('Payment failed:', error);
        alert('Failed to initiate payment. Please try again.');
    }
});

// Event listener untuk tombol "Watch Rewarded Ad"
document.getElementById('watchAdButton')?.addEventListener('click', async () => {
    const user = localStorage.getItem('user');
    if (!user) {
        alert('Please log in to watch a rewarded ad.');
        return;
    }
    try {
        const showAdResponse = await window.Pi.Ads.showAd("rewarded");
        if (showAdResponse.result === "AD_REWARDED") {
            const adId = showAdResponse.adId;

            // Verifikasi status iklan menggunakan backend Anda
            const adStatusResponse = await axios.get(`https://your-backend-domain.com/ads/status/${adId}`);
            const adStatus = adStatusResponse.data;
            if (adStatus.mediator_ack_status === "granted") {
                alert('You have been rewarded for watching the ad!');
            } else {
                alert('Reward verification failed. Please try again.');
            }
        } else {
            alert('Ad was not rewarded. Please try again.');
        }
    } catch (error) {
        console.error('Rewarded ad failed:', error);
        alert('Failed to show rewarded ad. Please try again.');
    }
});