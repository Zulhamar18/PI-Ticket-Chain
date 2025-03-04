// Konstanta untuk URL backend
const API_BASE_URL = "https://pi-ticket-chain-backend.vercel.app";

// Inisialisasi Pi SDK
document.addEventListener("DOMContentLoaded", () => {
    try {
        if (typeof window.Pi !== "undefined") {
            window.Pi.init({ sandbox: true, version: "2.0" });
        } else {
            console.error("Pi SDK failed to load.");
        }
    } catch (error) {
        console.error("Error initializing Pi SDK:", error);
    }
});

// Fungsi untuk menangani otentikasi pengguna
async function authenticateUser() {
    try {
        if (typeof window.Pi === "undefined") {
            alert("Pi SDK is not loaded. Please refresh the page.");
            return;
        }

        const scopes = ["username", "wallet_address"];
        const onIncompletePaymentFound = (payment) => {
            console.warn("Incomplete payment found:", payment);
        };

        // Otentikasi dengan Pi Network
        const authRes = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
        const { user, accessToken } = authRes;

        if (!user || !accessToken) {
            throw new Error("Authentication response is incomplete.");
        }

        console.log("User authenticated:", user);

        // Kirim data autentikasi ke backend untuk verifikasi
        const authResponse = await axios.post(`${API_BASE_URL}/auth`, { access_token: accessToken });

        if (!authResponse.data || !authResponse.data.user) {
            throw new Error("Authentication failed on backend.");
        }

        const verifiedUser = authResponse.data.user;
        console.log("User verified by backend:", verifiedUser);

        // Simpan user data di localStorage
        localStorage.setItem("user", JSON.stringify({
            username: verifiedUser.username,
            uid: verifiedUser.uid,
            wallet: verifiedUser.wallet_address,
        }));
        localStorage.setItem("accessToken", accessToken);

        alert(`Welcome, ${verifiedUser.username}! You are now logged in.`);
        window.location.href = "dashboard.html"; // Redirect ke dashboard
    } catch (error) {
        console.error("Authentication failed:", error);
        alert("Login failed. Please try again.");
    }
}

// Fungsi untuk mendapatkan data user dari localStorage
function getUser() {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
    }
}

// Event listener untuk tombol "Login with Pi"
document.getElementById("loginButton")?.addEventListener("click", authenticateUser);

// Event listener untuk tombol "Explore Now"
document.getElementById("startButton")?.addEventListener("click", () => {
    const user = getUser();
    if (user) {
        window.location.href = "dashboard.html";
    } else {
        alert("Welcome to Ticket-Chain! Please log in to explore all features.");
    }
});

// Event listener untuk tombol "Buy Ticket"
document.getElementById("buyTicketButton")?.addEventListener("click", async () => {
    const user = getUser();
    if (!user || !user.uid || !user.wallet) {
        alert("Please log in to buy a ticket.");
        return;
    }

    try {
        // Tampilkan loading sebelum request
        document.getElementById("buyTicketButton").innerText = "Processing...";
        document.getElementById("buyTicketButton").disabled = true;

        const paymentData = {
            amount: 1, // Jumlah Pi
            memo: "Ticket Purchase",
            metadata: { ticketType: "General Admission" },
            uid: user.uid // UID pengguna dari Pi Network
        };

        // Kirim permintaan pembayaran ke backend
        const response = await axios.post(`${API_BASE_URL}/payments`, paymentData);
        console.log("Payment created:", response.data);
        alert("Payment initiated successfully! Please complete the transaction.");
    } catch (error) {
        console.error("Payment failed:", error);
        alert("Failed to initiate payment. Please try again.");
    } finally {
        // Kembalikan tombol ke kondisi semula
        document.getElementById("buyTicketButton").innerText = "Buy Ticket";
        document.getElementById("buyTicketButton").disabled = false;
    }
});

// Event listener untuk tombol "Watch Rewarded Ad"
document.getElementById("watchAdButton")?.addEventListener("click", async () => {
    const user = getUser();
    if (!user) {
        alert("Please log in to watch a rewarded ad.");
        return;
    }

    try {
        const showAdResponse = await window.Pi.Ads.showAd("rewarded");
        console.log("Ad Response:", showAdResponse);

        if (showAdResponse.result === "AD_REWARDED") {
            const adId = showAdResponse.adId;

            // Verifikasi status iklan dengan backend
            const adStatusResponse = await axios.get(`${API_BASE_URL}/ads/status/${adId}`);
            const adStatus = adStatusResponse.data;

            if (adStatus.mediator_ack_status === "granted") {
                alert("You have been rewarded for watching the ad!");
            } else {
                alert("Reward verification failed. Please try again.");
            }
        } else {
            alert("Ad was not rewarded. Please try again.");
        }
    } catch (error) {
        console.error("Rewarded ad failed:", error);
        alert("Failed to show rewarded ad. Please try again.");
    }
});
