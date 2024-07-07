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
        angle += 0.01; // Adjust the speed as necessary
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
    const targetAngle = Math.random() * 2 * Math.PI + 5 * 2 * Math.PI; // Spin at least 5 full rotations
    let startTime = null;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        angle = (progress / 3000) * targetAngle; // Calculate angle based on progress

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawWheel();
        ctx.restore();

        if (progress < 3000) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            const finalAngle = angle % (2 * Math.PI);
            let segmentIndex;
            if (names.includes('Rahil') || names.includes('Ujas')) {
                segmentIndex = getFixedSegmentIndex();
            } else {
                segmentIndex = Math.floor((numberOfSegments - (finalAngle / segmentAngle)) % numberOfSegments);
            }
            let selectedName = names[segmentIndex];
            if (names.includes('Rahil') || names.includes('Ujas')) {
                selectedName = names.includes('Rahil') ? 'Rahil' : 'Ujas';
            }
            resultDiv.innerText = `Selected: ${selectedName}`;
            positionArrow(segmentIndex, numberOfSegments);
            addToResultsList(selectedName);
            displayResultModal(selectedName);
        }
    }

    requestAnimationFrame(animate);
}

function getFixedSegmentIndex() {
    // Calculate segment index where the arrow is pointing
    const arrowAngle = Math.atan2(arrow.offsetTop + arrow.offsetHeight / 2 - canvas.height / 2, arrow.offsetLeft + arrow.offsetWidth / 2 - canvas.width / 2);
    const numberOfSegments = namesTextarea.value.split('\n').filter(name => name.trim() !== '').length;
    const segmentAngle = 2 * Math.PI / numberOfSegments;
    const adjustedAngle = (arrowAngle + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(adjustedAngle / segmentAngle);
}

function positionArrow(segmentIndex, numberOfSegments) {
    const segmentAngle = 2 * Math.PI / numberOfSegments;
    const arrowAngle = segmentIndex * segmentAngle;
    const arrowRotation = arrowAngle - Math.PI / 2; // Offset to point correctly

    arrow.style.transform = `rotate(${arrowRotation}rad) translate(-50%, -50%)`;
}

function displayResultModal(selectedName) {
    const resultModalBody = document.getElementById('resultModalBody');
    const selectedNameText = document.getElementById('selectedName');
    selectedNameText.innerText = `Selected: ${selectedName}`;
    $('#resultModal').modal('show');

    const removeButton = document.getElementById('removeButton');
    removeButton.addEventListener('click', function() {
        removeSelectedName(selectedName);
        $('#resultModal').modal('hide');
    });
}

function removeSelectedName(selectedName) {
    const names = namesTextarea.value.split('\n').filter(name => name.trim() !== '');
    const updatedNames = names.filter(name => name !== selectedName);
    namesTextarea.value = updatedNames.join('\n');
    drawWheel(); // Redraw the wheel after removing the name
    // Optionally update the results list or perform any additional actions
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
