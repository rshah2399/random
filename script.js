const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const namesTextarea = document.getElementById('names');
const resultDiv = document.getElementById('result');
const arrow = document.querySelector('.arrow');

let isSpinning = false;

const colors = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC'
];

function drawWheel() {
    const names = namesTextarea.value.split('\n').filter(name => name.trim() !== '');
    const numberOfSegments = names.length;
    const segmentAngle = 2 * Math.PI / numberOfSegments;

    for (let i = 0; i < numberOfSegments; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((startAngle + endAngle) / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(names[i], canvas.width / 2 - 10, 10);
        ctx.restore();
    }
}

function spinWheelSlowly() {
    let angle = 0;

    function animate() {
        angle += 0.005; // Adjust the speed as necessary
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawWheel();
        ctx.restore();
        if (!isSpinning) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;

    const names = namesTextarea.value.split('\n').filter(name => name.trim() !== '');
    if (names.length === 0) {
        alert('Please enter some names');
        isSpinning = false;
        return;
    }

    const numberOfSegments = names.length;
    const segmentAngle = 2 * Math.PI / numberOfSegments;
    let angle = 0;
    const initialSpeed = 0.2; // Initial spinning speed (adjust as necessary)
    let currentSpeed = initialSpeed;
    const minDuration = 6000; // Minimum spin duration in milliseconds (6 seconds)
    const maxDuration = 9000; // Maximum spin duration in milliseconds (9 seconds)
    const targetTime = minDuration + Math.random() * (maxDuration - minDuration); // Random duration within the range
    let startTime = null;

    // Determine the selected name based on priority
    let selectedIndex;
    let selectedName;
    if (names.includes('Rahil')) {
        selectedIndex = names.indexOf('Rahil');
        selectedName = 'Rahil';
    } else if (names.includes('Ujas')) {
        selectedIndex = names.indexOf('Ujas');
        selectedName = 'Ujas';
    } else {
        selectedIndex = Math.floor(Math.random() * numberOfSegments);
        selectedName = names[selectedIndex];
    }

    // Calculate the angle to stop at the selected name
    const targetAngle = (numberOfSegments - selectedIndex) * segmentAngle - (Math.PI / 2);
    const totalRotations = 5 * 2 * Math.PI; // Spin at least 5 full rotations
    const finalTargetAngle = totalRotations + targetAngle;

    console.log(`Initial selectedIndex: ${selectedIndex}`);
    console.log(`Initial targetAngle: ${targetAngle}`);
    console.log(`Final targetAngle: ${finalTargetAngle}`);

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;

        if (progress < targetTime) {
            // Adjust speed based on progress towards targetTime
            const progressFactor = progress / targetTime;
            currentSpeed = initialSpeed * (1 - progressFactor);
        } else {
            // Ensure final deceleration
            currentSpeed -= 0.002; // Adjust as necessary for smoother deceleration
        }

        angle += currentSpeed; // Increment angle based on current speed

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawWheel();
        ctx.restore();

        console.log(`Current angle: ${angle}`);
        console.log(`Current speed: ${currentSpeed}`);

        if (currentSpeed > 0) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            const finalAngle = angle % (2 * Math.PI);
            let segmentIndex;
            const offset = Math.PI / 2;

            // Check if "Rahil" or "Ujas" is present
            if (names.includes('Rahil')) {
                segmentIndex = names.indexOf('Rahil');
            } else if (names.includes('Ujas')) {
                segmentIndex = names.indexOf('Ujas');
            } else {
                segmentIndex = Math.floor((numberOfSegments - (finalAngle + offset) / segmentAngle) % numberOfSegments);
            }

            console.log(`Final selectedIndex: ${segmentIndex}`);
            console.log(`Final selectedName: ${names[segmentIndex]}`);

            let selectedName = names[segmentIndex];
            resultDiv.innerText = `Selected: ${selectedName}`;
            addToResultsList(selectedName);
            displayResultModal(selectedName);
        }
    }

    requestAnimationFrame(animate);
}

function displayResultModal(selectedName) {
    const selectedNameText = document.getElementById('selectedName');
    selectedNameText.innerText = `Selected: ${selectedName}`;
    $('#resultModal').modal('show');

    const removeButton = document.getElementById('removeButton');
    removeButton.onclick = function () {
        removeSelectedName(selectedName);
        $('#resultModal').modal('hide');
    };
}

function removeSelectedName(selectedName) {
    const names = namesTextarea.value.split('\n').filter(name => name.trim() !== '');
    const updatedNames = names.filter(name => name !== selectedName);
    namesTextarea.value = updatedNames.join('\n');
    drawWheel(); // Redraw the wheel after removing the name
}

function addToResultsList(name) {
    const resultsList = document.getElementById('resultsList');
    const newItem = document.createElement('li');
    newItem.className = 'list-group-item bg-dark text-white';
    newItem.innerText = name;
    resultsList.appendChild(newItem);
}

namesTextarea.addEventListener('input', drawWheel);
window.onload = spinWheelSlowly;

spinButton.addEventListener('click', spinWheel);
