const qbList = [
  "qb-pca/qb-01-practice-tests.xml",
  "qb-pca/qb-02-practice-tests.xml",
  "qb-pca/qb-03-practice-tests.xml",
  "qb-pca/qb-04-practice-tests.xml",
  "qb-pca/qb-05-practice-tests.xml"
];

function setQuestions(currentQuestions) {

  let currentQuestionIndex = 0;

  //--------------------------------------------------------------------------------
  function displayQuestion(index) {
    currentQuestionIndex = index;
    if (currentQuestions.length == 1) {
      $("#totalQuestions").text("1 question loaded.");
    } else {
      $("#totalQuestions").text(currentQuestions.length + " questions loaded.");
    }
    const thisQuestion = currentQuestions[currentQuestionIndex];
    $("#questionIndex").text("Q" + (index + 1) + ". ");
    const questionTextHTML = marked.parse(thisQuestion.text);
    $("#questionText").html('<div>' + questionTextHTML.replace(/<table>/g, '<table class="markdownTable">').replace(/<table>/g, '<table class="markdownTable">') + "</div>");
    $("#answersForm").empty(); // Clear previous options

    const isMultipleCorrect = thisQuestion.options.filter(option => option.isValid).length > 1;
    const inputType = isMultipleCorrect ? "checkbox" : "radio";

    thisQuestion.options.forEach((option, index) => {
      // Convert Markdown in option.detail to HTML
      const detailHTML = marked.parse(option.detail);

      // Create a new div element for the option
      const $optionDiv = $(`
        <div class="form-check">
          <input class="form-check-input" type="${inputType}" name="answer" id="option${index}" value="${option.isValid}">
          <label class="form-check-label" for="option${index}"></label>
        </div>
      `);
      // Append the converted HTML to the label within the div
      $optionDiv.find(`label[for="option${index}"]`).html("<div>" + detailHTML.replace(/<table>/g, '<table class="markdownTable">').replace(/<p>/g, '<p class="optionPara">') + "</div>");
      // Append the option div to the form
      $("#answersForm").append($optionDiv);
    });

    $("#submitBtn").prop('disabled', false);
    if (currentQuestionIndex <= 0) {
      $("#previousBtn").prop('disabled', true);
    } else {
      $("#previousBtn").prop('disabled', false);
    }
    if (currentQuestionIndex >= currentQuestions.length - 1) {
      $("#nextBtn").prop('disabled', true);
    } else {
      $("#nextBtn").prop('disabled', false);
    }
  }

  //--------------------------------------------------------------------------------
  $("#resetBtn").off('click');
  $("#resetBtn").click(function (e) {
    e.preventDefault();
    displayQuestion(currentQuestionIndex);
  });

  //--------------------------------------------------------------------------------
  $("#submitBtn").off('click');
  $("#submitBtn").click(function (e) {
    e.preventDefault();
    $("#answersForm input").each(function () {
      const isCorrect = $(this).val() === "true";
      $(this)
        .next("label")
        .css("color", isCorrect ? "green" : "red");
    });
    $("#submitBtn").prop('disabled', true);
  });

  //--------------------------------------------------------------------------------
  $("#nextBtn").off('click');
  $("#nextBtn").click(function (e) {
    e.preventDefault();
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
      displayQuestion(currentQuestionIndex);
    }
  });

  //--------------------------------------------------------------------------------
  $("#previousBtn").off('click');
  $("#previousBtn").click(function (e) {
    e.preventDefault();
    currentQuestionIndex--;
    if (currentQuestionIndex < currentQuestions.length) {
      displayQuestion(currentQuestionIndex);
    } 
  });

  displayQuestion(currentQuestionIndex);
}

//--------------------------------------------------------------------------------
function loadXmlDoc(filename, callback) {
  let xhttp;
  if (window.ActiveXObject) {
    xhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } else {
    xhttp = new XMLHttpRequest();
  }
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      // Call the callback function and pass the response text
      callback(this.responseText);
    }
  };
  xhttp.open("GET", filename, true); // Set true for asynchronous
  try {
    xhttp.responseType = "msxml-document";
  } catch (err) {} // Helping IE11, but we're actually using responseText
  xhttp.send();
}

//--------------------------------------------------------------------------------
function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const entries = xmlDoc.getElementsByTagName("entry");
  const currentTopic = xmlDoc.getElementsByTagName("topic")[0].childNodes[0].nodeValue;
  const questions = [];
  for (let entry of entries) {
    const question = new Object();
    question.text = entry.getElementsByTagName("question")[0].childNodes[0].nodeValue;
    const options = entry.getElementsByTagName("option");
    question.options = [];
    for (let option of options) {
      const isValid = option.getElementsByTagName("valid")[0].childNodes[0].nodeValue === "true";
      const detail = option.getElementsByTagName("detail")[0].childNodes[0].nodeValue;
      question.options.push({ isValid, detail });
    }
    questions.push(question);
  }
  return { currentTopic, questions };
}

//--------------------------------------------------------------------------------
function addOptionToDropdown(value, text) {
  const dropdown = document.getElementById("topicOptions");
  const option = document.createElement("option");
  option.value = value;
  option.text = text;
  dropdown.appendChild(option);
}

function sortDropdownOptions() {
  const dropdown = document.getElementById("topicOptions");
  const optionsArray = Array.from(dropdown.options);
  optionsArray.sort((a, b) => a.text.localeCompare(b.text));
  dropdown.innerHTML = "";
  optionsArray.forEach(option => {
    dropdown.appendChild(option);
  });
}

//--------------------------------------------------------------------------------
const topicQuestionsMap = new Map();

$(document).ready(function () {
  let loadedCount = 0; // Track the number of XML files loaded
  qbList.forEach(path => {
    loadXmlDoc(path, 
      function(responseText) {
        const { currentTopic, questions } = parseXML(responseText);
        topicQuestionsMap.set(currentTopic, questions);
        addOptionToDropdown(currentTopic, currentTopic);

        // Increment loadedCount
        loadedCount++;
        
        // Check the size of topicQuestionsMap when all XML files have been processed
        if (loadedCount === qbList.length && qbList.length > 0) {
          sortDropdownOptions();
          const firstOptionValue = document.getElementById("topicOptions").options[0].value;
          setQuestions(topicQuestionsMap.get(firstOptionValue));
          document.getElementById("topicOptions").selectedIndex = 0;
          $("#topicOptions").change(function() {
            setQuestions(topicQuestionsMap.get($(this).val()));
          });

        }
      }
    );
  });
});
