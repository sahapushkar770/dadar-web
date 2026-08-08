window.billMode = "party";

// ===========================
// PARTY DETAILS PAGE
// ===========================

let partyDetailsParty =
    JSON.parse(localStorage.getItem("selectedParty")) || null;


// ===========================
// LOAD PARTY DETAILS
// ===========================

document.addEventListener("DOMContentLoaded", function () {

    if (!partyDetailsParty) return;

    document.getElementById("partyAvatar").innerText =
        partyDetailsParty.name.charAt(0).toUpperCase();

    document.getElementById("partyName").innerText =
        partyDetailsParty.name;

    document.getElementById("partyPhone").innerText =
        partyDetailsParty.phone;

    document.getElementById("partyArea").innerHTML =
        `
        <i class="fa-solid fa-location-dot"></i>
        ${partyDetailsParty.area || "No Area"}
        `;

    loadPartyBills();

});


// ===========================
// LOAD PARTY BILLS
// ===========================

function loadPartyBills() {

    const bills =
        JSON.parse(localStorage.getItem("bills")) || [];

    const partyBills = bills.filter(bill =>

        bill.partyName === partyDetailsParty.name &&
        bill.partyPhone === partyDetailsParty.phone

    );

    document.getElementById("totalBills").innerText =
        partyBills.length;

    let remaining = 0;

    const billList =
        document.getElementById("billList");

    billList.innerHTML = "";


    partyBills.forEach((bill, index) => {

        remaining += Number(
            bill.payment?.remainingAmount || 0
        );

        billList.innerHTML += `
            <div class="bill-card"
                 onclick="openBill(${index})">

                <h3>${bill.billId}</h3>

                <p>${bill.date}</p>

                <p>
                    Total : ₹${bill.grandTotal}
                </p>

                <p>
                    Remaining :
                    ₹${bill.payment?.remainingAmount || 0}
                </p>

            </div>
        `;

    });


    document.getElementById("remainingAmount").innerText =
        "₹" + remaining;
}


// ===========================
// ADD BILL
// ===========================

function addBill() {

    if (!partyDetailsParty) return;

    // Keep the selected party available
    // for the Bill Products page.
    localStorage.setItem(
        "selectedParty",
        JSON.stringify(partyDetailsParty)
    );

    // Go directly to Bill Products
    window.location.href = "bill-products.html";

}

// ===========================
// PARTY HEADER MENU
// ===========================

function togglePartyMenu(event) {

    event.stopPropagation();

    const menu =
        document.getElementById("partyHeaderDropdown");

    menu.classList.toggle("show");
}


// Close menu when clicking outside
document.addEventListener("click", function(event) {

    const menu =
        document.getElementById("partyHeaderDropdown");

    const button =
        document.querySelector(".header-menu-btn");

    if (
        menu &&
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ) {
        menu.classList.remove("show");
    }

});

function editCurrentParty() {

    if (!partyDetailsParty) return;

    // Close three-dot menu
    document
        .getElementById("partyHeaderDropdown")
        .classList.remove("show");


    // Fill current party information
    document.getElementById("editPartyName").value =
        partyDetailsParty.name;

    document.getElementById("editPartyPhone").value =
        partyDetailsParty.phone;

    // Load available areas
    loadPartyDetailAreas();


    // Select current area
    document.getElementById("editPartyArea").value =
        partyDetailsParty.area || "";


    // Open edit popup
    document.getElementById("editPartyPopup").style.display =
        "flex";
}

// ===========================
// DELETE CURRENT PARTY
// ===========================

function deleteCurrentParty() {

    if (!partyDetailsParty) return;

    document.getElementById("partyDeletePopup").style.display = "flex";
}


function closeDeleteCurrentParty() {

    document.getElementById("partyDeletePopup").style.display = "none";
}


function confirmDeleteCurrentParty() {

    if (!partyDetailsParty) return;

    let parties =
        JSON.parse(localStorage.getItem("parties")) || [];


    const updatedParties = parties.filter(party =>
        !(
            party.name === partyDetailsParty.name &&
            party.phone === partyDetailsParty.phone
        )
    );


    localStorage.setItem(
        "parties",
        JSON.stringify(updatedParties)
    );


    // Remove selected party
    localStorage.removeItem("selectedParty");


    // Redirect ONLY after successful deletion
    window.location.href = "party-data.html";
}

function loadPartyDetailAreas() {

    const select =
        document.getElementById("editPartyArea");

    if (!select) return;

    const areas =
        JSON.parse(localStorage.getItem("areas")) || [];

    select.innerHTML = `
        <option value="">
            Select Area
        </option>
    `;

    areas.forEach(area => {

        select.innerHTML += `
            <option value="${area}">
                ${area}
            </option>
        `;

    });
}

function updateCurrentParty() {

    if (!partyDetailsParty) return;


    const name =
        document.getElementById("editPartyName")
        .value.trim();

    const phone =
        document.getElementById("editPartyPhone")
        .value.trim();

    const area =
        document.getElementById("editPartyArea")
        .value;


    if (name === "" || phone === "") {

        alert("Please fill all fields.");

        return;
    }


    let parties =
        JSON.parse(localStorage.getItem("parties")) || [];


    const partyIndex = parties.findIndex(party =>
        party.name === partyDetailsParty.name &&
        party.phone === partyDetailsParty.phone
    );


    if (partyIndex === -1) {

        alert("Party not found.");

        return;
    }


    // Update party
    parties[partyIndex].name = name;
    parties[partyIndex].phone = phone;
    parties[partyIndex].area = area;


    // Save updated parties
    localStorage.setItem(
        "parties",
        JSON.stringify(parties)
    );


    // Update currently selected party
    partyDetailsParty = {
        name: name,
        phone: phone,
        area: area
    };


    localStorage.setItem(
        "selectedParty",
        JSON.stringify(partyDetailsParty)
    );


    // Update profile immediately
    document.getElementById("partyAvatar").innerText =
        name.charAt(0).toUpperCase();

    document.getElementById("partyName").innerText =
        name;

    document.getElementById("partyPhone").innerText =
        phone;

    document.getElementById("partyArea").innerHTML = `
        <i class="fa-solid fa-location-dot"></i>
        ${area || "No Area"}
    `;


    // Close popup
    closeEditPartyPopup();
}

function closeEditPartyPopup() {

    document
        .getElementById("editPartyPopup")
        .style.display = "none";
}