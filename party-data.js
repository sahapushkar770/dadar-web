// ===========================
// SAHA ENTERPRISE PARTY DATA
// ===========================

let parties = JSON.parse(localStorage.getItem("parties")) || [
    {
        name: "ABC Traders",
        phone: "9876543210",
        area: "Ranaghat"
    }
];

let selectedIndex = -1;

// ===========================
// AREAS
// ===========================

let areas = JSON.parse(localStorage.getItem("areas")) || [];

let editingAreaIndex = -1;

// ===========================
// AREA POPUP
// ===========================

function openAreaPopup(){

    document.getElementById("areaPopup").style.display = "flex";

    loadAreas();

}

function closeAreaPopup(){

    document.getElementById("areaPopup").style.display = "none";

}

// Load parties when page opens
window.onload = function () {

    displayParties();

    loadAreaDropdowns();

    document
        .getElementById("search")
        .addEventListener("keyup", searchParty);


    // ===========================
    // OPEN EDIT FROM PARTY DETAILS
    // ===========================

    const editPartyRequest =
        localStorage.getItem("editPartyRequest");

    if (editPartyRequest === "true") {

        localStorage.removeItem("editPartyRequest");

        const selectedParty =
            JSON.parse(
                localStorage.getItem("selectedParty")
            );

        if (selectedParty) {

            const index = parties.findIndex(party =>
                party.name === selectedParty.name &&
                party.phone === selectedParty.phone
            );

            if (index !== -1) {
                editParty(index);
            }

        }

    }

};

// ===========================
// Display Parties
// ===========================

function getPartyRemaining(party) {

    const bills =
        JSON.parse(localStorage.getItem("bills")) || [];

    let remaining = 0;

    bills.forEach(bill => {

        if (
            bill.party &&
            bill.party.name === party.name &&
            bill.party.phone === party.phone
        ) {

            if (bill.payment) {

                remaining += Number(
                    bill.payment.remainingAmount || 0
                );

            } else {

                remaining += Number(
                    bill.grandTotal || 0
                );

            }

        }

    });

    return (Math.round(remaining * 100) / 100).toFixed(2);
}

function displayParties() {

    const partyList = document.getElementById("partyList");

    partyList.innerHTML = "";

    parties.forEach((party, index) => {

        let firstLetter = party.name.charAt(0).toUpperCase();

        partyList.innerHTML += `
        <div class="party-card"
     onclick="openPartyDetails(${index})">
            <div class="avatar">
                ${firstLetter}
            </div>

            <div class="party-info">

                <h3>${party.name}</h3>

                <p>${party.phone}</p>

                <span class="party-area">
                   <i class="fa-solid fa-location-dot"></i>
                   ${party.area || "No Area"}
                </span>

            </div>

            <div class="party-right" onclick="event.stopPropagation()">

              ${Number(getPartyRemaining(party)) === 0
                    ? `
                        <div class="party-remaining no-due">
                            No Due
                        </div>
                    `
                    : `
                        <div class="party-remaining">
                            ₹${getPartyRemaining(party)}
                        </div>
                    `
                }

                <div class="menu">

                    <button class="menu-btn"
                    onclick="toggleMenu(this)">
                        ⋮
                    </button>

                <div class="dropdown">

                    <button onclick="editParty(${index})">
                        🖊️ Edit
                    </button>

                    <button class="delete"
                    onclick="deleteParty(${index})">
                        🗑️ Delete
                    </button>

                </div>

            </div>

        </div>
        `;

    });

    selectedParty =
    JSON.parse(localStorage.getItem("selectedParty")) || null;

}

// ===========================
// MENU
// ===========================

function toggleMenu(button){

    document.querySelectorAll(".dropdown").forEach(menu=>{

        if(menu!==button.nextElementSibling){

            menu.style.display="none";

        }

    });

    const menu = button.nextElementSibling;

    menu.style.display =
    menu.style.display=="block"
    ? "none"
    : "block";

}

document.addEventListener("click",function(e){

    if(!e.target.closest(".menu")){

        document.querySelectorAll(".dropdown").forEach(menu=>{

            menu.style.display="none";

        });

    }

});

// ===========================
// ADD PARTY
// ===========================

function openAddPopup(){

    document.getElementById("partyName").value="";

    document.getElementById("partyPhone").value="";

    document.getElementById("addPopup").style.display="flex";

}

function closeAddPopup(){

    document.getElementById("addPopup").style.display="none";

}

function saveParty(){

    let name=document.getElementById("partyName").value.trim();

    let phone=document.getElementById("partyPhone").value.trim();
    let area=document.getElementById("partyArea").value;

    if(name=="" || phone==""){

        alert("Please fill all fields.");

        return;

    }

     parties.push({

            name: name,

            phone: phone,

            area: area

      });
    localStorage.setItem("parties", JSON.stringify(parties));

    displayParties();

    closeAddPopup();

}

// ===========================
// EDIT PARTY
// ===========================

function editParty(index){

    selectedIndex=index;

    document.getElementById("editName").value=parties[index].name;

    document.getElementById("editPhone").value=parties[index].phone;

    document.getElementById("editArea").value=parties[index].area || "";

    document.getElementById("editPopup").style.display="flex";

}

function closeEditPopup(){

    document.getElementById("editPopup").style.display="none";

}

function updateParty(){

    let name=document.getElementById("editName").value.trim();

    let phone=document.getElementById("editPhone").value.trim();

    let area=document.getElementById("editArea").value;

    if(name=="" || phone==""){

        alert("Please fill all fields.");

        return;

    }

    parties[selectedIndex].name = name;

    parties[selectedIndex].phone = phone;

    parties[selectedIndex].area = area;

    localStorage.setItem("parties", JSON.stringify(parties));

    displayParties();

    closeEditPopup();

}

// ===========================
// DELETE PARTY
// ===========================

function deleteParty(index){

    selectedIndex = index;

    document.getElementById("deletePopup").style.display = "flex";

}

function closeDeletePopup(){

    document.getElementById("deletePopup").style.display="none";

}

function confirmDelete(){

    // Remove the selected party
    parties.splice(selectedIndex, 1);

    // Save the updated list
    localStorage.setItem("parties", JSON.stringify(parties));

    // Close the popup
    closeDeletePopup();

    // Refresh the party list
    displayParties();

    // Reset the selected index
    selectedIndex = -1;

}

// ===========================
// SEARCH
// ===========================

function searchParty(){

    let value=document
    .getElementById("search")
    .value
    .toLowerCase();

    let cards=document.querySelectorAll(".party-card");

    cards.forEach(card=>{

        let text=card.innerText.toLowerCase();

        card.style.display=text.includes(value)
        ? "flex"
        : "none";

    });

}

// ===========================
// CLOSE POPUPS
// ===========================

window.onclick=function(e){

    if(e.target.id=="addPopup")
        closeAddPopup();

    if(e.target.id=="editPopup")
        closeEditPopup();

    if(e.target.id=="deletePopup")
        closeDeletePopup();

}
function openPartyDetails(index){

    console.log("Selected Party:", parties[index]);

    localStorage.setItem(
        "selectedParty",
        JSON.stringify(parties[index])
    );

    window.location.href = "party-details.html";

}

function toggleHeaderMenu(){

    document
        .getElementById("headerDropdown")
        .classList.toggle("show");

}

window.onclick = function(e){

    if(!e.target.closest(".header-menu")){

        document
            .getElementById("headerDropdown")
            .classList.remove("show");

    }

}

function saveArea(){

    const input = document.getElementById("areaName");

    const area = input.value.trim();

    if(area === ""){

        alert("Enter an area name.");

        return;

    }

    if(editingAreaIndex === -1){

        areas.push(area);

    }else{

        areas[editingAreaIndex] = area;

        editingAreaIndex = -1;

    }

    localStorage.setItem("areas", JSON.stringify(areas));

    input.value = "";

    loadAreas();

}

function loadAreas(){

    const list = document.getElementById("areaList");

    list.innerHTML = "";

    areas.forEach((area,index)=>{

        list.innerHTML += `

        <div class="area-item">

            <span>${area}</span>

            <div>

                <button onclick="editArea(${index})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button onclick="deleteArea(${index})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

        `;

    });

    loadAreaDropdowns();
}

function editArea(index){

    document.getElementById("areaName").value = areas[index];

    editingAreaIndex = index;

}

function deleteArea(index){

    

        areas.splice(index,1);

        localStorage.setItem("areas",JSON.stringify(areas));

        loadAreas();

    

}

// ===========================
// LOAD AREA DROPDOWNS
// ===========================

function loadAreaDropdowns(){

    const addSelect = document.getElementById("partyArea");
    const editSelect = document.getElementById("editArea");

    addSelect.innerHTML = `<option value="">Select Area</option>`;
    editSelect.innerHTML = `<option value="">Select Area</option>`;

    areas.forEach(area => {

        addSelect.innerHTML += `<option value="${area}">${area}</option>`;
        editSelect.innerHTML += `<option value="${area}">${area}</option>`;

    });

}

