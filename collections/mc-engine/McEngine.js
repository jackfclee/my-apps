const qbList = [
  "qb-pca/qb-pca-01-practice-tests.xml.encrypted",
  "qb-pca/qb-pca-02-practice-tests.xml.encrypted",
  "qb-pca/qb-pca-03-practice-tests.xml.encrypted",
  "qb-pca/qb-pca-04-practice-tests.xml.encrypted",
  "qb-pca/qb-pca-05-practice-tests.xml.encrypted",
  "qb-pcd/qb-pcd-01-practice-tests.xml.encrypted",
  "qb-pcd/qb-pcd-02-practice-tests.xml.encrypted",
  "qb-pcd/qb-pcd-03-practice-tests.xml.encrypted",
  "qb-pcd/qb-pcd-04-practice-tests.xml.encrypted",
  "qb-pcd/qb-pcd-05-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-01-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-02-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-03-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-04-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-05-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-06-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-07-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-08-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-09-practice-tests.xml.encrypted",
  "qb-pde/qb-pde-10-practice-tests.xml.encrypted",
  "qb-pmle/qb-pmle-01-practice-tests.xml.encrypted",
  "qb-pmle/qb-pmle-02-practice-tests.xml.encrypted",
  "qb-pmle/qb-pmle-03-practice-tests.xml.encrypted",
  "qb-pmle/qb-pmle-04-practice-tests.xml.encrypted",
  "qb-pmle/qb-pmle-05-practice-tests.xml.encrypted",
  "qb-pmle/qb-pmle-06-practice-tests.xml.encrypted",
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
function loadTextFile(filename, callback) {
  fetch(filename)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(data => callback(data))
    .catch(error => console.error('Error fetching the file:', error));
}

//--------------------------------------------------------------------------------
function getRequiredElement(parent, tagName, contextLabel) {
  const element = parent.getElementsByTagName(tagName)[0];
  if (!element) {
    throw new Error(`${contextLabel}: missing <${tagName}> element.`);
  }
  return element;
}

function getElementText(element, contextLabel) {
  if (!element) {
    throw new Error(`${contextLabel}: missing element.`);
  }

  const text = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (text.length === 0) {
    return "";
  }

  return text;
}

function parseXML(xmlString, sourceLabel) {
  if (!xmlString || !xmlString.trim()) {
    throw new Error(`${sourceLabel}: decrypted XML is empty.`);
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const parserError = xmlDoc.getElementsByTagName("parsererror")[0];

  if (parserError) {
    const parseMessage = getElementText(parserError, `${sourceLabel}: XML parser error`)
      || "The XML could not be parsed. This often means the file is corrupted or the passcode is wrong.";
    throw new Error(`${sourceLabel}: ${parseMessage}`);
  }

  const rootElement = xmlDoc.documentElement;
  if (!rootElement || rootElement.nodeName.toLowerCase() === "parsererror") {
    throw new Error(`${sourceLabel}: XML document has no valid root element.`);
  }

  const topicElement = getRequiredElement(xmlDoc, "topic", sourceLabel);
  const currentTopic = getElementText(topicElement, `${sourceLabel}: topic`);

  const entries = Array.from(xmlDoc.getElementsByTagName("entry"));
  if (entries.length === 0) {
    throw new Error(`${sourceLabel}: no <entry> elements were found in the XML.`);
  }

  const questions = [];

  entries.forEach((entry, entryIndex) => {
    const entryLabel = `${sourceLabel} (entry ${entryIndex + 1})`;
    const questionElement = getRequiredElement(entry, "question", entryLabel);
    const questionText = getElementText(questionElement, `${entryLabel}: question`);

    const optionElements = Array.from(entry.getElementsByTagName("option"));
    if (optionElements.length === 0) {
      throw new Error(`${entryLabel}: no <option> elements were found.`);
    }

    const options = optionElements.map((option, optionIndex) => {
      const optionLabel = `${entryLabel}: option ${optionIndex + 1}`;
      const validElement = getRequiredElement(option, "valid", optionLabel);
      const detailElement = getRequiredElement(option, "detail", optionLabel);

      const validText = getElementText(validElement, `${optionLabel}: valid`).toLowerCase();
      if (validText !== "true" && validText !== "false") {
        throw new Error(`${optionLabel}: <valid> must be true or false, found "${validText || "<empty>"}".`);
      }

      return {
        isValid: validText === "true",
        detail: getElementText(detailElement, `${optionLabel}: detail`),
      };
    });

    questions.push({
      text: questionText,
      options,
    });
  });

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

let decryptionKey = "";

$(document).ready(function () {
  $("#mcEngineContainer").hide();
  $("#submitPassword").click(function () {
    decryptionKey = $("#passwordInput").val();
    if (decryptionKey) {
      try {
        loadFiles();
        $("#passwordDialog").hide();
        $("#mcEngineContainer").show();
      } catch (error) {
        $("#passwordDialog").show();
        $("#mcEngineContainer").hide();
        $("#errorMessage").show();
      }
    }
  });
});

function loadFiles() {
  let loadedCount = 0; // Track the number of XML files loaded
  let hasErrorOccurred = false; // Flag to prevent further processing after an error

  qbList.forEach(path => {
    loadTextFile(path, function(responseText) {
      // If an error has already occurred, skip processing further files
      if (hasErrorOccurred) return;

      try {
        let decryptedText;
        if (path.endsWith(".encrypted")) {
          const bytes = CryptoJS.AES.decrypt(responseText, decryptionKey);
          decryptedText = bytes.toString(CryptoJS.enc.Utf8);

          if (!decryptedText || !decryptedText.trim()) {
            throw new Error(`Decryption failed for ${path}: the passcode may be incorrect or the file content is empty.`);
          }

          if (!decryptedText.trim().startsWith("<")) {
            throw new Error(`Decryption failed for ${path}: the decrypted text is not valid XML. Please verify the passcode.`);
          }
        } else {
          decryptedText = responseText;
        }

        const { currentTopic, questions } = parseXML(decryptedText, path);

        // Validate parsed XML structure
        if (!currentTopic || !questions || questions.length === 0) {
          throw new Error("Invalid XML structure: Missing topic or questions.");
        }

        topicQuestionsMap.set(currentTopic, questions);
        addOptionToDropdown(currentTopic, currentTopic);

        loadedCount++;

        // After all files are loaded successfully
        if (loadedCount === qbList.length && qbList.length > 0) {
          sortDropdownOptions();
          const firstOptionValue = document.getElementById("topicOptions").options[0].value;
          setQuestions(topicQuestionsMap.get(firstOptionValue));
          document.getElementById("topicOptions").selectedIndex = 0;

          $("#topicOptions").change(function() {
            setQuestions(topicQuestionsMap.get($(this).val()));
          });
        }

      } catch (error) {
        console.error(`Error processing file "${path}":`, error);

        hasErrorOccurred = true;

        const cause = error && error.message ? error.message : String(error);
        $("#passwordDialog").show();
        $("#mcEngineContainer").hide();
        $("#errorMessage")
          .html(`Unable to load question bank.<br/>${cause}<br/>Please confirm the passcode and the XML content for this file.`)
          .show();
      }
    });
  });
}