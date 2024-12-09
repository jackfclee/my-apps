window.jsonData = [];

function doInit() {
  fetchJsonData('images/z.json');
}

// Function to fetch JSON data from URL
function fetchJsonData(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(jsonData => {
      initDropdown(jsonData);
      // Store jsonData globally if needed for further use
      window.jsonData = jsonData;
      displayImages();
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

// Function to initialize the dropdown with categories
function initDropdown(jsonData) {
  const dropdown = document.getElementById('topicDropdown');
  jsonData.forEach(topic => {
    let option = document.createElement('option');
    option.value = topic.topic;
    option.textContent = topic.displayName || topic.topic;
    dropdown.appendChild(option);
  });
}

// Function to display images based on the selected topic
function displayImages() {
  const tagFilterInput = document.getElementById('tagFilterInput').value.toLowerCase(); 
  const keywordFilter = document.getElementById('keywordFilterInput').value.toLowerCase(); 
  const selectedtopic = document.getElementById('topicDropdown').value;
  const display = document.getElementById('imageDisplay');
  display.innerHTML = ''; // Clear previous images

  // Split tag input by spaces into an array of keywords
  const tagFilters = tagFilterInput.split(/\s+/).filter(Boolean);

  // Get topics based on the selected topic or all topics if none is selected
  const topics = selectedtopic ? [window.jsonData.find(cat => cat.topic === selectedtopic)] : window.jsonData;

  topics.forEach(topic => {
    if (topic?.references) {
      topic.references.forEach(ref => {
        const tagCondition = tagFilters.length === 0 || tagFilters.every(filter => 
          ref.tags?.some(tag => tag.toLowerCase().includes(filter)) ?? false);
        const keywordCondition = !keywordFilter || ref.file?.toLowerCase().includes(keywordFilter) || ref.displayName?.toLowerCase().includes(keywordFilter) ;

        if (tagCondition && keywordCondition) {
          let label = (selectedtopic ? "": "【 " + topic.displayName + " 】 ") + (ref.displayName || ref.file);
          let p = document.createElement('p');
          p.innerText = label;
          p.className = "sub-banner"; // Apply any necessary CSS class for styling
          display.appendChild(p);

          let img = document.createElement('img');
          img.src = 'images/' + topic.topic + "/" + ref.file; // Ensure the path is correct
          img.alt = label;
          display.appendChild(img);
        }
      });
    }
  });
}

function resetInput() {
  document.getElementById('tagFilterInput').value = '';
  document.getElementById('keywordFilterInput').value = '';
  document.getElementById('topicDropdown').value = '';
  displayImages();
}