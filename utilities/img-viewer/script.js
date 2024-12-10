document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const urlList = document.getElementById('urlList');
    const imageViewer = document.getElementById('imageViewer');
    const addButton = document.getElementById('addButton');

    // Function to clear the 'selected' class from all list items
    function clearSelection() {
        urlList.querySelectorAll('li').forEach(item => {
            item.classList.remove('selected');
        });
    }

    // Function to add a URL to the list
    function addListItem(url, label = 'New Image') {
        const listItem = document.createElement('li');
        listItem.dataset.url = url; // Store the URL in a dataset attribute

        // Label input
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = label; // Default or loaded label
        labelInput.className = 'label';
        labelInput.readOnly = true; // Make the label read-only initially
        listItem.appendChild(labelInput);

        // Enable editing on double-click
        labelInput.addEventListener('dblclick', (event) => {
            event.stopPropagation(); // Prevent triggering image display
            labelInput.readOnly = false; // Enable editing
            labelInput.focus(); // Focus on the input
        });

        // Save the label on Enter key press or blur
        labelInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                labelInput.readOnly = true;
                saveList(); // Save list after editing
            }
        });

        labelInput.addEventListener('blur', () => {
            labelInput.readOnly = true; // Save changes on losing focus
            saveList();
        });

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'material-icons delete-button';
        deleteButton.textContent = 'delete';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the image display
            listItem.remove();
            saveList(); // Save list after deletion
            if (imageViewer.src === url) {
                imageViewer.src = ''; // Clear image if it was displayed
            }
        });
        listItem.appendChild(deleteButton);

        // Single click to display the image and highlight the item
        listItem.addEventListener('click', () => {
            clearSelection(); // Clear previous selections
            listItem.classList.add('selected'); // Highlight the selected item
            imageViewer.src = url; // Display the image
        });

        // Append to the list
        urlList.appendChild(listItem);
    }

    // Function to save the list to localStorage
    function saveList() {
        const listItems = [];
        urlList.querySelectorAll('li').forEach(listItem => {
            const url = listItem.dataset.url;
            const label = listItem.querySelector('.label').value;
            listItems.push({ url, label });
        });
        localStorage.setItem('imageList', JSON.stringify(listItems));
    }

    // Function to load the list from localStorage
    function loadList() {
        const savedList = JSON.parse(localStorage.getItem('imageList')) || [];
        savedList.forEach(item => addListItem(item.url, item.label));
    }

    // Add a new URL from the input box
    function addUrl() {
        const url = urlInput.value.trim();
        if (url) {
            addListItem(url); // Add to the list
            saveList(); // Save list to localStorage
            urlInput.value = ''; // Clear the input
        } else {
            alert('Please enter a valid URL.');
        }
    }

    // Add event listener for the Add button
    addButton.addEventListener('click', addUrl);

    // Allow Enter key to add the URL
    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addUrl();
        }
    });

    // Load the saved list on page load
    loadList();
});
