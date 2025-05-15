function fetchData() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            const dataDisplay = document.getElementById('dataDisplay');
            dataDisplay.innerHTML = ''; // Clear previous data
            data.reverse().forEach(item => {
                const p = document.createElement('p');
                if (item.username == "")
                {
                    item.username = "Anon";
                }
                p.textContent = "[ " + item.username + " ]  -  " + item.data; // Assuming the input field is named 'data'
                dataDisplay.appendChild(p);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function refresh() {
    fetchData();
}

setInterval(fetchData, 1000);  //Auto-refreshing every so often

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    // Handle post submission
    const postForm = document.querySelector('form[action="/submit"]');
    const submitButton = postForm.querySelector('button[type="submit"]');
    
    postForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Stop the form from submitting normally

        const formData = new FormData(postForm);
        const data = new URLSearchParams(formData);

        fetch('/submit', {
            method: 'POST',
            body: data
        })
        .then(() => {
            // Wait for the data to be sent, then reset and refresh
            postForm.reset(); // Clear the input field
            return fetchData();  // Refresh the displayed data after successful submission
        })
        .then(() => {
            // Re-enable the submit button once everything is done
            submitButton.disabled = false;
        })
        .catch(error => {
            console.error('Error submitting data:', error);
            submitButton.disabled = false; // Re-enable the button in case of error
        });
    });

    const accountForm = document.getElementById('accountForm');

    if (accountForm) {
        accountForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(accountForm);
            const data = new URLSearchParams(formData);

            fetch('/account', {
                method: 'POST',
                body: data
            })
            .then(res => res.text())
            .then(message => {
                alert(message);  // Or update the page dynamically
                accountForm.reset();
            })
            .catch(error => {
                console.error('Error with account form:', error);
                alert('Something went wrong');
            });
        });
    }
    
    fetchData();
});