// ===========================
// SAHA ENTERPRISE MAKING BILL
// ===========================

let parties = JSON.parse(localStorage.getItem("parties")) || [];

// ===========================
// PAGE LOAD
// ===========================

window.onload = function () {

    displayParties();

    document
        .getElementById("search")
        .addEventListener("keyup", searchParty);

};

// ===========================
// DISPLAY PARTIES
// ===========================

function displayParties() {

    const partyList = document.getElementById("partyList");

    partyList.innerHTML = "";

    if (parties.length === 0) {

        partyList.innerHTML = `
            <div class="empty-message">
                No Parties Found
            </div>
        `;

        return;

    }


    parties.forEach((party,index)=>{


        let firstLetter =
        party.name.charAt(0).toUpperCase();


        partyList.innerHTML += `


        <div class="party-card"
             onclick="selectParty(${index})">


            <div class="avatar">
                ${firstLetter}
            </div>


            <div class="party-info">

                <h3>
                    ${party.name}
                </h3>

                <p>
                    ${party.phone}
                </p>

            </div>


        </div>


        `;


    });


}

// ===========================
// SEARCH PARTY
// ===========================

function searchParty() {

    let value = document
        .getElementById("search")
        .value
        .toLowerCase();

    let cards = document.querySelectorAll(".party-card");

    cards.forEach(card => {

        let text = card.innerText.toLowerCase();

        card.style.display = text.includes(value)
            ? "flex"
            : "none";

    });

}

// ===========================
// SELECT PARTY
// ===========================

function selectParty(index) {

    // Save selected party
    localStorage.setItem(
        "selectedParty",
        JSON.stringify(parties[index])
    );

    // Open product billing page
    window.location.href = "bill-products.html";

}