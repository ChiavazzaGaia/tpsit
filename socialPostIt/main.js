function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            const dataDisplay = document.getElementById('dataDisplay');
            dataDisplay.innerHTML = ''; // Clear previous data
            data.forEach(item => {
                const p = document.createElement('p');
                p.textContent = item.data; // Assuming the input field is named 'data'
                dataDisplay.appendChild(p);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

window.onload = fetchData;