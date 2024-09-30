document.addEventListener("DOMContentLoaded", () => {
  const { DateTime } = luxon;

  const flexibleInput = document.getElementById("flexibleInput");
  const epochMillisInput = document.getElementById("epochMillis");
  const isoPacificInput = document.getElementById("isoPacific");
  const isoLocalInput = document.getElementById("isoLocal");
  const isoGMTInput = document.getElementById("isoGMT");
  const timezoneSelect = document.getElementById("timezoneSelect");
  const timezoneTimeInput = document.getElementById("timezoneTime");
  const nowButton = document.getElementById("nowButton");

  function isNumeric(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

  function setNow() {
    const now = DateTime.now().setZone(DateTime.local().zoneName).toISO();
    flexibleInput.value = now;
    updateTimeDisplays(now);    
  }

  const acceptedFormats = [
    "yyyy-MM-dd'T'HH:mm:ss.SSSZZ",   // 2024-09-28T20:08:49.000+10:00
    "MMM d yyyy, h:mm a 'GMT'ZZ",    // Aug 31 2024, 20:20 PM GMT+10
    "MMM d yyyy, h:mm 'GMT'ZZ",      // Aug 31 2024, 20:21 GMT+10
    "MMM d yyyy, h:mm ZZ",           // Aug 31 2024, 20:22 +10
    "MMM d yyyy, h:mmZZ",            // Aug 31 2024, 20:23+10
    "MMM d yyyy, hZZ",               // Aug 31 2024, 20+10
    "MMM d yyyy, h:mm:ss",           // Aug 31 2024, 20:24:46
    "MMM d yyyy, h:mm",              // Aug 31 2024, 20:25
    "MMM d yyyy, h",                 // Aug 31 2024, 20
    "M/d/yyyy h:mm:ss a",            // 7/21/2024 23:10:33 AM
    "M/d/yyyy h:mm:ssa",             // 7/21/2024 23:11:33AM
    "M/d/yyyy h:mm:ss",              // 7/21/2024 23:12:33
    "M/d/yyyy h:mm a",               // 7/21/2024 23:13 AM
    "M/d/yyyy h:mma",                // 7/21/2024 23:14AM
    "M/d/yyyy h:mm",                 // 7/21/2024 23:15
    "M/d/yyyy h",                    // 7/21/2024 23
  ];

  // Try to parse input against multiple date formats
  function parseFlexibleInput(inputValue) {
    // Handle ISO8601 strings automatically using fromISO
    if (inputValue.endsWith('Z')) {
      const dateTime = DateTime.fromISO(inputValue);
      if (dateTime.isValid) {
        return dateTime;
      }
    }
    // Check if input is numeric (epoch)
    if (isNumeric(inputValue)) {
      return DateTime.fromSeconds(parseInt(inputValue));
    }
    // Try other accepted formats
    let dateTime = null;

    // Try other accepted formats
    for (let format of acceptedFormats) {
      dateTime = DateTime.fromFormat(inputValue, format);
      if (dateTime.isValid) {
        return dateTime;
      }
    }

    // If none of the formats match, return null (invalid input)
    return NaN;
  }

  function updateTimeDisplays(inputValue) {
    
    const dateTime = parseFlexibleInput(inputValue);
    // dateTime = 2024-09-28T19:34:27.338+10:00
    if (isNaN(dateTime)) {
      epochMillisInput.value = 'Invalid Input';
      isoPacificInput.value = 'Invalid Input';
      isoLocalInput.value = 'Invalid Input';
      isoGMTInput.value = 'Invalid Input';
      timezoneTimeInput.value = 'Invalid Input';
    } else {
      epochMillisInput.value = dateTime.toMillis();
      isoPacificInput.value = dateTime.setZone("America/Los_Angeles").toISO();
      isoLocalInput.value = dateTime.setZone(DateTime.local().zoneName).toISO();
      isoGMTInput.value = dateTime.setZone("UTC").toISO();
      timezoneTimeInput.value = dateTime.setZone(timezoneSelect.value).toISO();
    }
  }

  flexibleInput.addEventListener("input", () => {
    updateTimeDisplays(flexibleInput.value);
  });

  nowButton.addEventListener("click", () => {
    const bgColor = nowButton.style.backgroundColor;
    nowButton.style.backgroundColor = 'red'; 
    setNow();
    setTimeout(() => {
        nowButton.style.backgroundColor = bgColor; 
    }, 100);
  });

  document.querySelectorAll('.btn.copy').forEach(button => {
    button.addEventListener('click', function() {
      // Get the target input field id from the button's data-target attribute
      const targetId = this.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);

      // Get the value from the input field
      const textToCopy = targetInput.value;

      // Copy the text to the clipboard
      navigator.clipboard.writeText(textToCopy).then(() => {
        const bgColor = this.style.backgroundColor;
        // Change button color to red
        this.style.backgroundColor = 'grey';

        // Revert the button color and text back after 1 second
        setTimeout(() => {
          this.style.backgroundColor = bgColor;  // Reset to original color
        }, 100);
      }).catch(err => {
        alert('Failed to copy: ' + err);
      });
    });
  });

  document.getElementById('timezoneSelect').addEventListener('change', function() {
    updateTimeDisplays(flexibleInput.value);
  });

  setNow();
});
