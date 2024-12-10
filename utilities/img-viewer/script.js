document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const urlList = document.getElementById('urlList');
    const imageViewer = document.getElementById('imageViewer');
    const addButton = document.getElementById('addButton');
    const copyAllButton = document.getElementById('copyAllButton'); // Copy All button
    const clearButton = document.getElementById('clearButton'); // Clear All button
    const confirmationDiv = document.getElementById('confirmationDiv'); // Confirmation dialog
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

        labelInput.addEventListener('dblclick', () => {
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
        copyLabelLinkButton.textContent = 'content_copy';
        copyLabelLinkButton.addEventListener('click', () => {
            const textToCopy = `- ${labelInput.value}\n  ${url}\n\n`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showTick(copyLabelLinkButton, 'content_copy');
            });
        });
        listItem.appendChild(copyLabelLinkButton);

        const copyLinkButton = document.createElement('button');
        copyLinkButton.className = 'material-icons copy-link-button';
        copyLinkButton.textContent = 'link';
        copyLinkButton.addEventListener('click', () => {
            navigator.clipboard.writeText(url).then(() => {
                showTick(copyLinkButton, 'link');
            });
        });
        listItem.appendChild(copyLinkButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'material-icons delete-button';
        deleteButton.textContent = 'delete';
        deleteButton.addEventListener('click', () => {
            listItem.remove();
            saveList();
            if (imageViewer.src === url) {
                imageViewer.src = '';
            }
            showTick(deleteButton, 'delete');
        });
        listItem.appendChild(deleteButton);

        listItem.addEventListener('click', () => {
            clearSelection();
            listItem.classList.add('selected');
            imageViewer.src = url;
        });

        enableDragAndDrop(listItem);

        urlList.appendChild(listItem);
    }

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
        const listItems = [];
        urlList.querySelectorAll('li').forEach(listItem => {
            const url = listItem.dataset.url;
            const label = listItem.querySelector('.label').value;
            listItems.push(`- ${label}\n  ${url}\n`);
        });
        if (listItems.length > 0) {
            navigator.clipboard.writeText(listItems.join('\n')).then(() => {
                showTick(copyAllButton, 'content_copy');
            });
        }
    }

    function clearAll() {
        confirmationDiv.classList.remove('hidden'); // Show the confirmation dialog
    }

    confirmYes.addEventListener('click', () => {
        urlList.innerHTML = '';
        localStorage.removeItem('imageList');
        imageViewer.src = '';
        confirmationDiv.classList.add('hidden'); // Hide the confirmation dialog
        showTick(clearButton, 'clear_all');
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

    copyAllButton.addEventListener('click', copyAll);

    clearButton.addEventListener('click', clearAll);

    loadList();
});
