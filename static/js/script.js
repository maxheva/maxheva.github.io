document.addEventListener("DOMContentLoaded", function() {
    populateEmployeeDropdown();
    updateCurrentTimeDate();
    setInterval(updateCurrentTimeDate, 1000);  // Update current time and date every second
});

function populateEmployeeDropdown() {
    fetchEmployeePunchRecords()
        .then(records => {
            console.log("Fetched records: ", records);  // Diagnostic log

            // Filter records by DeviceSN
            const filteredRecords = records.filter(record => record.DeviceSN === "F32112329009");
            console.log("Filtered by DeviceSN: ", filteredRecords);  // Diagnostic log

            // Extract unique employee names
            const uniqueEmployeeNames = [...new Set(filteredRecords.map(record => record.UserName))];
            console.log("Unique employee names: ", uniqueEmployeeNames);  // Diagnostic log

            // Get the dropdown element
            const dropdown = document.getElementById('employeeDropdown');

            uniqueEmployeeNames.forEach(name => {
                let option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                dropdown.appendChild(option);
            });

            // Initialize select2 on the dropdown for search functionality
            $('#employeeDropdown').select2({
                placeholder: 'Type to search...',
                allowClear: true
            });

          // Get the button element and add the click event listener
          const viewRecordsBtn = document.getElementById('viewRecordsBtn');
          viewRecordsBtn.addEventListener('click', function() {
              const selectedEmployee = dropdown.value;
              console.log("Selected employee on button click: ", selectedEmployee);
              displayPunchRecordsForEmployee(selectedEmployee, filteredRecords);
          });
      });
}

function displayPunchRecordsForEmployee(employeeName, records) {
    const relevantRecords = records.filter(record => record.UserName === employeeName);
    console.log("Relevant records for selected employee: ", relevantRecords);  // Diagnostic log

    const list = document.getElementById('punchRecords');
    list.innerHTML = '';  // Clear previous records

    relevantRecords.forEach(record => {
        let adjustedDateTime = adjustTimeForDisplay(record.RecordTime);
        let listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.innerText = `${record.Status} at ${adjustedDateTime.time} on ${adjustedDateTime.date}`;
        list.appendChild(listItem);
    });
}

function fetchEmployeePunchRecords() {
    const currentDate = new Date().toISOString().split('T')[0];
    const apiUrl = "/api/proxy";
    const postData = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'UTCTimeZone': 'Los_Angeles'
        },
        body: new URLSearchParams({
            'RecordType': 'FacialRecognition',
            'UserType': 'All',
            'Area': 'Test',
            'StartDate': currentDate,
            'EndDate': currentDate
        })
    };

    return fetch(apiUrl, postData)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

function adjustTimeForDisplay(time) {
    const date = new Date(time);
    const currentTime = new Date();

    console.log("Original record time:", date.toLocaleString());  // Diagnostic log

    date.setHours(date.getHours() - 7);  // Adjusting by 7 hours
    console.log("After -7 hours adjustment:", date.toLocaleString());  // Diagnostic log

    if (date > currentTime) {
        date.setDate(date.getDate() - 1);  // Subtract one day
        console.log("After 1 day subtraction:", date.toLocaleString());  // Diagnostic log
    }

    return {
        time: date.toLocaleTimeString(),
        date: date.toLocaleDateString()
    };
}


function updateCurrentTimeDate() {
    const currentTimeDateElement = document.getElementById('current-time-date');
    if (currentTimeDateElement) {
        const now = new Date();
        currentTimeDateElement.textContent = `Current Time: ${now.toLocaleTimeString()} | Current Date: ${now.toLocaleDateString()}`;
    }
}
