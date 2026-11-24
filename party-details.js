window.billMode = "party";

// ===========================
// PARTY DETAILS PAGE
// ===========================

let partyDetailsParty =
    JSON.parse(localStorage.getItem("selectedParty")) || null;

document.addEventListener("DOMContentLoaded", function () {

   if (!partyDetailsParty) return;

    document.getElementById("partyAvatar").innerText =
        partyDetailsParty.name.charAt(0).toUpperCase();

    document.getElementById("partyName").innerText =
        selectedParty.name;

    document.getElementById("partyPhone").innerText =
        partyDetailsParty.phone;

    document.getElementById("partyArea").innerHTML =
        `
        <i class="fa-solid fa-location-dot"></i>
        ${partyDetailsParty.area || "No Area"}
        `;

    loadPartyBills();
});

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

                <p>Total : ₹${bill.grandTotal}</p>

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