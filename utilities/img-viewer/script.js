document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const urlList = document.getElementById('urlList');
    const imageViewer = document.getElementById('imageViewer');
    const addButton = document.getElementById('addButton');
    const copyAllButton = document.getElementById('copyAllButton'); // New Copy All button
    const clearButton = document.getElementById('clearButton');
    const confirmationDiv = document.getElementById('confirmationDiv');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    let draggedItem = null; // Store the currently dragged item

    // Function to clear the 'selected' class from all list items
    function clearSelection() {
        urlList.querySelectorAll('li').forEach(item => {
            item.classList.remove('selected');
        });
    }

    // Function to temporarily show a tick icon for success
    function showTick(button, originalIcon) {
        button.textContent = 'check'; // Change the icon to a tick
        setTimeout(() => {
            button.textContent = originalIcon; // Revert to the original icon after 1 second
        }, 1000);
    }

    // Function to enable drag-and-drop on a list item
    function enableDragAndDrop(listItem) {
        listItem.setAttribute('draggable', true);

        // Drag start
        listItem.addEventListener('dragstart', (event) => {
            draggedItem = listItem;
            event.target.style.opacity = '0.5'; // Make the dragged item semi-transparent
        });

        // Drag end
        listItem.addEventListener('dragend', (event) => {
            draggedItem = null;
            event.target.style.opacity = ''; // Reset the opacity
        });

        // Drag over (allow dropping)
        listItem.addEventListener('dragover', (event) => {
            event.preventDefault(); // Necessary to allow drop
        });

        // Drop
        listItem.addEventListener('drop', (event) => {
            event.preventDefault();
            if (draggedItem !== listItem) {
                const parent = urlList;
                const currentIndex = [...parent.children].indexOf(listItem);
                const draggedIndex = [...parent.children].indexOf(draggedItem);

                if (currentIndex > draggedIndex) {
                    parent.insertBefore(draggedItem, listItem.nextSibling);
                } else {
                    parent.insertBefore(draggedItem, listItem);
                }
                saveList(); // Save the new order
            }
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

        // "Copy Label + Link" button
        const copyLabelLinkButton = document.createElement('button');
        copyLabelLinkButton.className = 'material-icons copy-label-link-button';
        copyLabelLinkButton.textContent = 'content_copy';
        copyLabelLinkButton.title = 'Copy Label + Link';
        copyLabelLinkButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the image display
            const textToCopy = `- ${labelInput.value}\n  ${url}\n\n`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showTick(copyLabelLinkButton, 'content_copy'); // Show tick and revert
            });
        });
        listItem.appendChild(copyLabelLinkButton);

        // "Copy Link" button
        const copyLinkButton = document.createElement('button');
        copyLinkButton.className = 'material-icons copy-link-button';
        copyLinkButton.textContent = 'link';
        copyLinkButton.title = 'Copy Link';
        copyLinkButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the image display
            navigator.clipboard.writeText(url).then(() => {
                showTick(copyLinkButton, 'link'); // Show tick and revert
            });
        });
        listItem.appendChild(copyLinkButton);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'material-icons delete-button';
        deleteButton.textContent = 'delete';
        deleteButton.title = 'Delete';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the image display
            listItem.remove();
            saveList(); // Save list after deletion
            if (imageViewer.src === url) {
                imageViewer.src = ''; // Clear image if it was displayed
            }
            showTick(deleteButton, 'delete'); // Show tick and revert
        });
        listItem.appendChild(deleteButton);

        // Single click to display the image and highlight the item
        listItem.addEventListener('click', () => {
            clearSelection(); // Clear previous selections
            listItem.classList.add('selected'); // Highlight the selected item
            imageViewer.src = url; // Display the image
        });

        enableDragAndDrop(listItem); // Enable drag-and-drop functionality

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

    // Function to copy all items in the list
    function copyAll() {
        const listItems = [];
        urlList.querySelectorAll('li').forEach(listItem => {
            const url = listItem.dataset.url;
            const label = listItem.querySelector('.label').value;
            listItems.push(`- ${label}\n  ${url}\n`);
        });
        if (listItems.length > 0) {
            const textToCopy = listItems.join('\n');
            navigator.clipboard.writeText(textToCopy).then(() => {
                showTick(copyAllButton, 'content_copy'); // Show tick and revert
            });
        }
    }

    // Add a new URL from the input box
    function addUrl() {
        const url = urlInput.value.trim();
        if (url) {
            addListItem(url); // Add to the list
            saveList(); // Save list to localStorage
            urlInput.value = ''; // Clear the input
        }
    }

    // Allow Enter key to add the URL
    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addUrl();
        }
    });

    // Event listener for the Copy All button
    copyAllButton.addEventListener('click', copyAll);

    // Load the saved list on page load
    loadList();
});
