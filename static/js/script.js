document.addEventListener("DOMContentLoaded", function() {
    populateEmployeeDropdown();
    updateCurrentTimeDate();
    updateLastRefreshedTime();
    setInterval(updateCurrentTimeDate, 1000);  // Update current time and date every second

    // Initialize select2 on employeeDropdown
    $('#employeeDropdown').select2({
        placeholder: 'Type to search...',
        allowClear: true
    });
});

const facilityToDeviceSNMapping = {
    "PCC": ["F32112329009"],
    "EC": ["F32112329004"],
    "FL": ["F32112329002", "F32112329014"],
    "FF": ["F32112329005"],
    "SG": ["F32112329001"],
    "MM": ["F32112329010"],
    "MC": ["F32112329008"],
    "KC": ["F32112329006"],
    "FCC": ["F32112329011"],
    "FM": ["F32112329015"]
};

function populateEmployeeDropdown() {
    fetchEmployeePunchRecords()
        .then(records => {
            const facilityDropdown = document.getElementById('facilityDropdown');
            const employeeDropdown = document.getElementById('employeeDropdown');

            facilityDropdown.addEventListener('change', function() {
                const selectedFacility = facilityDropdown.value;
                const relevantDeviceSNs = facilityToDeviceSNMapping[selectedFacility];

                const filteredByFacilityRecords = records.filter(record => relevantDeviceSNs.includes(record.DeviceSN));
                const uniqueEmployeeNames = [...new Set(filteredByFacilityRecords.map(record => record.UserName))];
                uniqueEmployeeNames.sort((a, b) => a.localeCompare(b));

                employeeDropdown.innerHTML = ''; // Clear previous options
                $('#employeeDropdown').select2('destroy');  // Destroy the current select2 instance

                uniqueEmployeeNames.forEach(name => {
                    let option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    employeeDropdown.appendChild(option);
                });

                $('#employeeDropdown').select2({  // Re-initialize select2
                    placeholder: 'Type to search...',
                    allowClear: true
                });
            });

            // Initial population on page load
            facilityDropdown.dispatchEvent(new Event('change'));
        });
}

function displayPunchRecordsForEmployee(employeeName, records) {
    const relevantRecords = records.filter(record => record.UserName === employeeName);

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
            return response.json()
            .then(data => {
                console.log("Fetched Records:", data);
                return data;
            });
        });
}

function adjustTimeForDisplay(time) {
    const date = new Date(time);
    const currentTime = new Date();

    date.setHours(date.getHours() - 7);  // Adjusting by 7 hours

    if (date > currentTime) {
        date.setDate(date.getDate() - 1);  // Subtract one day
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

const viewRecordsBtn = document.getElementById('viewRecordsBtn');
const spinner = viewRecordsBtn.querySelector('.spinner-border');
viewRecordsBtn.addEventListener('click', function() {
    // Indicate loading
    viewRecordsBtn.textContent = " Loading...";
    spinner.style.display = 'inline-block';  // Show the spinner
    viewRecordsBtn.disabled = true;

    const selectedFacility = document.getElementById('facilityDropdown').value;
    const relevantDeviceSNs = facilityToDeviceSNMapping[selectedFacility];
    const selectedEmployee = document.getElementById('employeeDropdown').value;

    fetchEmployeePunchRecords().then(records => {
        const filteredByFacilityRecords = records.filter(record => relevantDeviceSNs.includes(record.DeviceSN));
        displayPunchRecordsForEmployee(selectedEmployee, filteredByFacilityRecords);

        // Revert button back to its original state
        viewRecordsBtn.textContent = "Click to View Records";
        spinner.style.display = 'none';  // Hide the spinner
        viewRecordsBtn.disabled = false;
        
    }).catch(error => {
        console.error("Failed to fetch records:", error);
        
        // If there's an error, revert button to its original state as well
        viewRecordsBtn.textContent = "Click to View Records";
        spinner.style.display = 'none';  // Hide the spinner
        viewRecordsBtn.disabled = false;
    });
});


function updateLastRefreshedTime() {
    // Set the current time as the last refreshed time
    const now = new Date();
    document.getElementById('last-refreshed').textContent = now.toLocaleTimeString();
}