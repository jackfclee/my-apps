document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const urlList = document.getElementById('urlList');
    const imageViewer = document.getElementById('imageViewer');
    const addButton = document.getElementById('addButton');
    const copyAllButton = document.getElementById('copyAllButton'); // Copy All button
    const editButton = document.getElementById('editButton'); // Edit button
    const clearButton = document.getElementById('clearButton'); // Clear All button
    const editPanel = document.getElementById('editPanel'); // Edit Panel
    const editTextarea = document.getElementById('editTextarea'); // Textarea in the Edit Panel
    const saveEditButton = document.getElementById('saveEditButton');
    const closeEditButton = document.getElementById('closeEditButton');
    const confirmationDiv = document.getElementById('confirmationDiv'); // Confirmation dialog
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    let selectedItems = []; // Track selected items
    let draggedItem = null; // Store the currently dragged item
    let isOriginalSize = true;

    document.getElementById('toggleSizeButton').addEventListener('click', () => {
        const modalImage = document.getElementById('modalImage');
        if (isOriginalSize) {
            // Scale to fit screen
            modalImage.style.width = '90%';
            modalImage.style.height = '90%';
            isOriginalSize = false;
        } else {
            // Revert to original size
            modalImage.style.width = `${modalImage.naturalWidth}px`;
            modalImage.style.height = `${modalImage.naturalHeight}px`;
            isOriginalSize = true;
        }
    });
    
    // Function to clear the 'selected' class from all list items
    function clearSelection() {
        urlList.querySelectorAll('li').forEach(item => {
            item.classList.remove('selected');
        });
        selectedItems = [];
    }

    // Function to toggle selection of a list item
    function toggleSelection(listItem) {
        const index = selectedItems.indexOf(listItem);
    
        if (index !== -1) {
            selectedItems.splice(index, 1);
            listItem.classList.remove('selected');
        } else if (selectedItems.length < 8) {
            selectedItems.push(listItem);
            listItem.classList.add('selected');
        } else {
        }
    }

    // Function to temporarily show a tick icon for success
    function showTick(button, originalIcon) {
        button.textContent = 'check'; // Change the icon to a tick
        setTimeout(() => {
            button.textContent = originalIcon; // Revert to the original icon after 1 second
        }, 1000);
    }

    // Function to generate the content for Copy All and Edit Panel
    function generateContent() {
        const listItems = [];
        urlList.querySelectorAll('li').forEach(listItem => {
            const url = listItem.dataset.url;
            const label = listItem.querySelector('.label').value;
            listItems.push(`- ${label}\n  ${url}\n`);
        });
        return listItems.join('\n');
    }

    // Function to save the edited content back to the list
    function saveEditedContent(content) {
        urlList.innerHTML = ''; // Clear the current list
        const lines = content.split('\n').filter(line => line.trim()); // Split by line and remove empty lines
        let currentLabel = '';
        lines.forEach(line => {
            if (line.startsWith('- ')) {
                currentLabel = line.slice(2).trim(); // Extract the label
            } else if (line.startsWith('  ')) {
                const url = line.trim(); // Extract the URL
                if (currentLabel && url) {
                    addListItem(url, currentLabel); // Recreate the list item
                }
            }
        });
        saveList(); // Save the updated list
    }

    // Function to enable drag-and-drop on a list item
    function enableDragAndDrop(listItem) {
        listItem.setAttribute('draggable', true);

        listItem.addEventListener('dragstart', (event) => {
            draggedItem = listItem;
            event.target.style.opacity = '0.5'; // Make the dragged item semi-transparent
        });

        listItem.addEventListener('dragend', (event) => {
            draggedItem = null;
            event.target.style.opacity = ''; // Reset the opacity
        });

        listItem.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

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
                saveList();
            }
        });
    }

    // Function to add a URL to the list
    function addListItem(url, label = 'New Image') {
        const listItem = document.createElement('li');
        listItem.dataset.url = url;

        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = label;
        labelInput.className = 'label';
        labelInput.readOnly = true;
        listItem.appendChild(labelInput);

        labelInput.addEventListener('dblclick', (event) => {
            event.stopPropagation(); 
            labelInput.readOnly = false;
            labelInput.focus();
        });

        labelInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                labelInput.readOnly = true;
                saveList();
            }
        });

        labelInput.addEventListener('blur', () => {
            labelInput.readOnly = true;
            saveList();
        });

        const copyLabelLinkButton = document.createElement('button');
        copyLabelLinkButton.className = 'material-icons copy-label-link-button';
        copyLabelLinkButton.title = 'Copy this entry label and URL';
        copyLabelLinkButton.textContent = 'content_copy';
        copyLabelLinkButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            const textToCopy = `- ${labelInput.value}\n  ${url}\n`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showTick(copyLabelLinkButton, 'content_copy');
            });
        });
        listItem.appendChild(copyLabelLinkButton);

        const copyLinkButton = document.createElement('button');
        copyLinkButton.className = 'material-icons copy-link-button';
        copyLinkButton.title = 'Copy this entry URL Only';
        copyLinkButton.textContent = 'link';
        copyLinkButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            navigator.clipboard.writeText(url).then(() => {
                showTick(copyLinkButton, 'link');
            });
        });
        listItem.appendChild(copyLinkButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'material-icons delete-button';
        deleteButton.textContent = 'delete';
        deleteButton.title = 'Remove this entry';
        deleteButton.addEventListener('click', () => {
            listItem.remove();
            saveList();
            updateImageViewer();
            showTick(deleteButton, 'delete');
        });
        listItem.appendChild(deleteButton);

        listItem.addEventListener('click', () => {
            toggleSelection(listItem);
            updateImageViewer(); // Update the image viewer
        });

        enableDragAndDrop(listItem);

        urlList.appendChild(listItem);
    }

    function updateImageViewer() {
        const imageViewer = document.getElementById('imageViewer');
        imageViewer.innerHTML = ''; // Clear the existing images
    
        selectedItems.forEach((listItem) => {
            let url = listItem.dataset.url;
            if (url.startsWith('https://screenshot.googleplex.com/')) {
                if (!url.endsWith('.jpg')) {
                    url += '.jpg';
                }
            }
    
            const img = document.createElement('img');
            img.src = url;
            img.alt = listItem.querySelector('.label').value;
            img.className = 'dynamic-image'; 
            img.title = listItem.querySelector('.label').value;
    
            // Add click event to open modal with enlarged image
            img.addEventListener('click', () => {
                openModal(url);
            });
    
            imageViewer.appendChild(img); 
        });
    }

    function openModal(imageUrl) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        
        modalImage.onload = () => {
            const originalWidth = modalImage.naturalWidth; // Get original width
            const originalHeight = modalImage.naturalHeight; // Get original height
    
            // Optionally scale the image to fit the screen if it's too large
            const maxWidth = window.innerWidth * 0.9; // 90% of viewport width
            const maxHeight = window.innerHeight * 0.9; // 90% of viewport height
    
            const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight, 1);
    
            modalImage.style.width = `${originalWidth * scale}px`;
            modalImage.style.height = `${originalHeight * scale}px`;
        };
    
        modalImage.src = imageUrl; // Set the image URL
        modal.classList.remove('hidden'); // Show the modal
    }

    function closeModal() {
        const modal = document.getElementById('imageModal');
        modal.classList.add('hidden'); // Hide the modal
    }
    
    // Event listener for close button
    document.getElementById('closeModalButton').addEventListener('click', closeModal);
    
    // Optional: Close modal when clicking outside the image
    document.getElementById('imageModal').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    });

    function saveList() {
        const listItems = [];
        urlList.querySelectorAll('li').forEach(listItem => {
            const url = listItem.dataset.url;
            const label = listItem.querySelector('.label').value;
            listItems.push({ url, label });
        });
        localStorage.setItem('imageList', JSON.stringify(listItems));
    }

    function loadList() {
        const savedList = JSON.parse(localStorage.getItem('imageList')) || [];
        savedList.forEach(item => addListItem(item.url, item.label));
    }

    function copyAll() {
        const content = generateContent();
        navigator.clipboard.writeText(content).then(() => {
            showTick(copyAllButton, 'content_copy');
        });
    }

    function clearAll() {
        confirmationDiv.classList.remove('hidden'); // Show the confirmation dialog
    }

    confirmYes.addEventListener('click', () => {
        clearSelection();

        urlList.innerHTML = '';
        localStorage.removeItem('imageList');
        confirmationDiv.classList.add('hidden'); // Hide the confirmation dialog
        showTick(clearButton, 'clear_all');
        updateImageViewer(); // Update the image viewer
    });

    confirmNo.addEventListener('click', () => {
        confirmationDiv.classList.add('hidden'); // Hide the confirmation dialog
    });

    addButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            addListItem(url);
            saveList();
            urlInput.value = '';
        }
    });

    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const url = urlInput.value.trim();
            if (url) {
                addListItem(url);
                saveList();
                urlInput.value = ''; // Clear input after adding
            }
        }
    });
    
    copyAllButton.addEventListener('click', copyAll);

    editButton.addEventListener('click', () => {
        const content = generateContent();
        editTextarea.value = content; // Fill the textarea with the list content
        editPanel.classList.remove('hidden'); // Show the edit panel
    });

    // Function to validate the content before saving
    function validateContent(content) {
        const lines = content.split('\n');
        const patternLabel = /^- .+/; // Pattern for "- LABEL"
        const patternContent = /^  .+/; // Pattern for "  CONTENT"

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if ((i + 1) % 3 === 0) {
                // Every third line must be empty
                if (line.trim() !== '') {
                    return `Line ${i + 1} must be empty: ${line}`;
                }
            } else if (i % 3 === 0) {
                // Label lines (1st, 4th, 7th, etc.)
                if (!patternLabel.test(line.trim())) {
                    return `Line ${i + 1} is not a valid label format: ${line}`;
                }
            } else if ((i + 1) % 3 === 2) {
                // Content lines (2nd, 5th, 8th, etc.)
                if (!patternContent.test(line)) {
                    return `Line ${i + 1} is not a valid content format: ${line}`;
                }
            }
        }

        // If all lines are valid, return null (no errors)
        return null;
    }

    // Event listener for the Save button in the Edit Panel
    saveEditButton.addEventListener('click', () => {
        const editedContent = editTextarea.value;

        // Validate the content
        const validationError = validateContent(editedContent);
        if (validationError) {
            // Show the error message in the panel
            const errorMessage = document.getElementById('editErrorMessage');
            errorMessage.textContent = `Error: ${validationError}`;
            errorMessage.classList.add('visible');
            return; // Exit the function without saving
        }

        // If valid, save the edited content
        saveEditedContent(editedContent);
        editPanel.classList.add('hidden'); // Hide the edit panel

        // Clear the error message
        const errorMessage = document.getElementById('editErrorMessage');
        errorMessage.textContent = '';
        errorMessage.classList.remove('visible');
        selectedItems = [];
        updateImageViewer();
    });

    // Close button clears the error message
    closeEditButton.addEventListener('click', () => {
        editPanel.classList.add('hidden'); // Hide the edit panel
        const errorMessage = document.getElementById('editErrorMessage');
        errorMessage.textContent = '';
        errorMessage.classList.remove('visible'); // Clear the error message
    });

    clearButton.addEventListener('click', clearAll);

    loadList();
});
