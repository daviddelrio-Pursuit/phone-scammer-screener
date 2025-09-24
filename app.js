// Scam number entry structure
class ScamEntry {
    constructor(number, category = 'Unknown', description = '', timestamp = new Date()) {
        this.number = number;
        this.category = category;
        this.description = description;
        this.timestamp = timestamp;
    }
}

// Initialize our database with default scam numbers and any stored reports
const defaultScams = [
    new ScamEntry("800-111-0000", "Toll-free", "Common toll-free scam pattern"),
    new ScamEntry("888-123-4567", "Tech Support", "Tech support scam"),
    new ScamEntry("877-999-9999", "IRS", "IRS scam pattern"),
    new ScamEntry("866-419-0123", "Tech Support", "Tech support scam"),
    new ScamEntry("855-555-1234", "Government", "Government agency scam"),
    new ScamEntry("900-555-0199", "Premium", "Premium rate number scam"),
    new ScamEntry("844-777-8888", "Banking", "Bank scam pattern"),
    new ScamEntry("833-123-0000", "Lottery", "Lottery scam pattern"),
    new ScamEntry("876-234-5678", "Lottery", "Jamaica area code lottery scam"),
    new ScamEntry("649-999-8888", "Prize", "Prize scam from Caribbean")
];

// Load numbers from localStorage or use defaults
let knownScams = [];
try {
    const stored = JSON.parse(localStorage.getItem('scamNumbers'));
    if (stored) {
        knownScams = stored.map(entry => {
            return new ScamEntry(
                entry.number,
                entry.category,
                entry.description,
                new Date(entry.timestamp)
            );
        });
    } else {
        knownScams = defaultScams;
    }
} catch (e) {
    knownScams = defaultScams;
}

function saveScamNumbers() {
    localStorage.setItem('scamNumbers', JSON.stringify(knownScams));
}

// Update statistics
function updateStats() {
    const totalElement = document.getElementById('totalScams');
    const recentElement = document.getElementById('recentScams');
    
    totalElement.textContent = knownScams.length;
    
    const today = new Date();
    const recentCount = knownScams.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.toDateString() === today.toDateString();
    }).length;
    
    recentElement.textContent = recentCount;
}

// Utility functions
function getDigitsOnly(number) {
    return number.replace(/\D/g, '');
}

function formatPhoneNumber(number) {
    const digits = getDigitsOnly(number);
    if (digits.length === 10) {
        return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return digits;
}

// Render the scam list
function renderScamList(searchTerm = '') {
    const container = document.getElementById('scamListContainer');
    const filteredScams = knownScams
        .filter(entry => entry.number.includes(searchTerm) || 
                        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entry.description.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    container.innerHTML = filteredScams.map(entry => `
        <div class="scam-item">
            <div class="scam-number">${entry.number}</div>
            <div class="scam-details">
                Category: ${entry.category} | 
                Reported: ${new Date(entry.timestamp).toLocaleDateString()}
                ${entry.description ? `<br>Details: ${entry.description}` : ''}
            </div>
        </div>
    `).join('');
}

// Initialize event listeners and UI
document.addEventListener('DOMContentLoaded', function() {
    // Set up phone number input formatting
    const phoneInput = document.getElementById('phoneNumber');
    phoneInput.addEventListener('input', function(e) {
        const input = e.target.value;
        const digits = getDigitsOnly(input);
        if (digits.length <= 10) {
            if (digits.length > 6) {
                e.target.value = digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
            } else if (digits.length > 3) {
                e.target.value = digits.slice(0,3) + '-' + digits.slice(3);
            } else {
                e.target.value = digits;
            }
        }
    });

    // Set up search functionality
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            renderScamList(e.target.value);
        });
    }

    // Initialize the UI
    updateStats();
    renderScamList();
});

// Core functionality
window.checkNumber = function() {
    const inputNumber = getDigitsOnly(document.getElementById("phoneNumber").value);
    const resultElement = document.getElementById("result");
    
    const matchingEntry = knownScams.find(entry => 
        getDigitsOnly(entry.number) === inputNumber
    );

    if (matchingEntry) {
        resultElement.textContent = `⚠️ This phone number is currently recognized as a ${matchingEntry.category} scam`;
        resultElement.style.color = "red";
    } else {
        resultElement.textContent = "✅ This number is not in our database.";
        resultElement.style.color = "green";
    }
}

window.reportNumber = function() {
    const inputElement = document.getElementById("phoneNumber");
    const inputNumber = getDigitsOnly(inputElement.value);
    const resultElement = document.getElementById("result");

    if (!inputNumber) {
        resultElement.textContent = "Please enter a number to report.";
        resultElement.style.color = "orange";
        return;
    }

    if (inputNumber.length !== 10) {
        resultElement.textContent = "Please enter a valid 10-digit phone number.";
        resultElement.style.color = "orange";
        return;
    }

    const isAlreadyReported = knownScams.some(entry => 
        getDigitsOnly(entry.number) === inputNumber
    );

    if (isAlreadyReported) {
        resultElement.textContent = "This number has already been reported as a scam.";
        resultElement.style.color = "orange";
        return;
    }

    // Prompt for additional details
    const category = prompt("What type of scam is this? (e.g., IRS, Tech Support, Banking, etc.)") || "Unknown";
    const description = prompt("Please provide any additional details about the scam:") || "";

    const formattedNumber = formatPhoneNumber(inputNumber);
    const newEntry = new ScamEntry(formattedNumber, category, description);
    
    knownScams.push(newEntry);
    saveScamNumbers();
    updateStats();
    renderScamList();
    
    resultElement.textContent = `✅ Thank you for reporting ${formattedNumber}!`;
    resultElement.style.color = "blue";
    inputElement.value = '';
}

window.deleteNumber = function() {
    const inputElement = document.getElementById("phoneNumber");
    const inputNumber = getDigitsOnly(inputElement.value);
    const resultElement = document.getElementById("result");

    if (!inputNumber || inputNumber.length !== 10) {
        resultElement.textContent = "Please enter a valid phone number to delete.";
        resultElement.style.color = "orange";
        return;
    }

    const matchingEntry = knownScams.find(entry => 
        getDigitsOnly(entry.number) === inputNumber
    );

    if (!matchingEntry) {
        resultElement.textContent = "This number is not in the database.";
        resultElement.style.color = "orange";
        return;
    }

    if (confirm(`Are you sure you want to remove this ${matchingEntry.category} scam number from the database?`)) {
        knownScams = knownScams.filter(entry => 
            getDigitsOnly(entry.number) !== inputNumber
        );
        saveScamNumbers();
        updateStats();
        renderScamList();
        
        resultElement.textContent = `✅ Phone number ${formatPhoneNumber(inputNumber)} has been removed from the database.`;
        resultElement.style.color = "green";
        inputElement.value = '';
    }
}
