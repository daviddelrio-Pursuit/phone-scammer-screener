// Initialize our database with default scam numbers and any stored reports
const defaultScams = [
    "800-111-0000",  // Toll-free number pattern
    "888-123-4567",  // Common toll-free scam
    "877-999-9999",  // Repetitive number pattern
    "866-419-0123",  // Tech support scam pattern
    "855-555-1234",  // IRS scam pattern
    "900-555-0199",  // Premium rate number
    "844-777-8888",  // Bank scam pattern
    "833-123-0000",  // Lottery scam pattern
    "876-234-5678",  // Jamaica area code (common in lottery scams)
    "649-999-8888"   // Caribbean area code (common in prize scams)
];

let knownScams = JSON.parse(localStorage.getItem('scamNumbers')) || defaultScams;

function saveScamNumbers() {
    localStorage.setItem('scamNumbers', JSON.stringify(knownScams));
}

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

document.addEventListener('DOMContentLoaded', function() {
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
});

function checkNumber() {
    const inputNumber = getDigitsOnly(document.getElementById("phoneNumber").value);
    const resultElement = document.getElementById("result");
    const isScam = knownScams.some(scamNumber => getDigitsOnly(scamNumber) === inputNumber);
    if (isScam) {
        resultElement.textContent = "⚠️ This phone number is currently recognized as a scam number";
        resultElement.style.color = "red";
    } else {
        resultElement.textContent = "✅ This number is not in our database.";
        resultElement.style.color = "green";
    }
}

function reportNumber() {
    const inputNumber = document.getElementById("phoneNumber").value;
    const resultElement = document.getElementById("result");
    if (inputNumber) {
        const cleanedNumber = getDigitsOnly(inputNumber);
        const isAlreadyReported = knownScams.some(number => getDigitsOnly(number) === cleanedNumber);
        if (isAlreadyReported) {
            resultElement.textContent = "This number has already been reported as a scam.";
            resultElement.style.color = "orange";
            return;
        }
        const formattedNumber = formatPhoneNumber(cleanedNumber);
        knownScams.push(formattedNumber);
        saveScamNumbers();
        resultElement.textContent = `✅ Thank you for reporting ${formattedNumber}! It has been added to our database.`;
        resultElement.style.color = "blue";
    } else {
        resultElement.textContent = "Please enter a number to report.";
        resultElement.style.color = "orange";
    }
}

function deleteNumber() {
    const inputNumber = document.getElementById("phoneNumber").value;
    const resultElement = document.getElementById("result");
    if (!inputNumber) {
        resultElement.textContent = "Please enter a number to delete.";
        resultElement.style.color = "orange";
        return;
    }
    const cleanedNumber = getDigitsOnly(inputNumber);
    const exists = knownScams.some(number => getDigitsOnly(number) === cleanedNumber);
    if (!exists) {
        resultElement.textContent = "This number is not in the database.";
        resultElement.style.color = "orange";
        return;
    }
    if (confirm("Are you sure you want to remove this phone number from the database?")) {
        knownScams = knownScams.filter(number => getDigitsOnly(number) !== cleanedNumber);
        saveScamNumbers();
        resultElement.textContent = `✅ Phone number ${formatPhoneNumber(inputNumber)} has been removed from the database.`;
        resultElement.style.color = "green";
    }
}
