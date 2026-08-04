// ===========================
// SAHA ENTERPRISE PARTY DATA
// ===========================

let parties = JSON.parse(localStorage.getItem("parties")) || [
    {
        name: "ABC Traders",
        phone: "9876543210"
    }
];

let selectedIndex = -1;

// Load parties when page opens
window.onload = function () {
    displayParties();

    document.getElementById("search").addEventListener("keyup", searchParty);
};

// ===========================
// Display Parties
// ===========================

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
            </div>

            <div class="menu" onclick="event.stopPropagation()">

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

    if(name=="" || phone==""){

        alert("Please fill all fields.");

        return;

    }

        parties.push({
        name: name,
        phone: phone
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

    document.getElementById("editPopup").style.display="flex";

}

function closeEditPopup(){

    document.getElementById("editPopup").style.display="none";

}

function updateParty(){

    let name=document.getElementById("editName").value.trim();

    let phone=document.getElementById("editPhone").value.trim();

    if(name=="" || phone==""){

        alert("Please fill all fields.");

        return;

    }

    parties[selectedIndex].name = name;

    parties[selectedIndex].phone = phone;

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

    localStorage.setItem(
        "selectedParty",
        JSON.stringify(parties[index])
    );

    window.location.href = "party-details.html";

}