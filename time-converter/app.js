document.addEventListener('DOMContentLoaded', () => {
  const { DateTime } = luxon;

  const flexibleInput = document.getElementById('flexibleInput');
  const epochSecondsInput = document.getElementById('epochSeconds');
  const epochMillisInput = document.getElementById('epochMillis');
  const epochMicrosInput = document.getElementById('epochMicros');
  const isoPacificInput = document.getElementById('isoPacific');
  const isoLocalInput = document.getElementById('isoLocal');
  const isoGMTInput = document.getElementById('isoGMT');
  const timezoneSelect = document.getElementById('timezoneSelect');
  const timezoneTimeInput = document.getElementById('timezoneTime');
  const nowButton = document.getElementById('nowButton');

  function updateTimeDisplays(epochSeconds) {
      const dateTime = DateTime.fromSeconds(epochSeconds);

      epochSecondsInput.value = epochSeconds;
      epochMillisInput.value = epochSeconds * 1000;
      epochMicrosInput.value = epochSeconds * 1000000;

      isoPacificInput.value = dateTime.setZone('America/Los_Angeles').toISO();
      isoLocalInput.value = dateTime.setZone(DateTime.local().zoneName).toISO();
      isoGMTInput.value = dateTime.setZone('UTC').toISO();

      updateTimezone();
  }

  function updateTimezone() {
      const selectedZone = timezoneSelect.value;
      const epochSeconds = parseInt(flexibleInput.value, 10);
      const dateTime = DateTime.fromSeconds(epochSeconds);

      timezoneTimeInput.value = dateTime.setZone(selectedZone).toISO();
  }

  flexibleInput.addEventListener('input', () => {
      const epochSeconds = parseInt(flexibleInput.value, 10);
      updateTimeDisplays(epochSeconds);
  });

  timezoneSelect.addEventListener('change', updateTimezone);

  nowButton.addEventListener('click', () => {
      const now = DateTime.now().toSeconds();
      flexibleInput.value = Math.floor(now);
      updateTimeDisplays(now);
  });

  // Set default to current time
  const now = DateTime.now().toSeconds();
  flexibleInput.value = Math.floor(now);
  updateTimeDisplays(now);
});
