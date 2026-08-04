window.billMode = "party";

// ===========================
// PARTY DETAILS PAGE
// ===========================

let selectedParty =
JSON.parse(localStorage.getItem("selectedParty")) || null;

window.onload = function () {

    if (!selectedParty) return;

    document.getElementById("partyAvatar").innerText =
        selectedParty.name.charAt(0).toUpperCase();

    document.getElementById("partyName").innerText =
        selectedParty.name;

    document.getElementById("partyPhone").innerText =
        selectedParty.phone;

    loadPartyBills();
};

function loadPartyBills() {

    const bills = JSON.parse(localStorage.getItem("bills")) || [];

    const partyBills = bills.filter(bill =>
        bill.partyName === selectedParty.name &&
        bill.partyPhone === selectedParty.phone
    );

    document.getElementById("totalBills").innerText = partyBills.length;

    let remaining = 0;

    const billList = document.getElementById("billList");
    billList.innerHTML = "";

    partyBills.forEach((bill, index) => {

        remaining += Number(bill.payment.remainingAmount || 0);

        billList.innerHTML += `
            <div class="bill-card" onclick="openBill(${index})">
                <h3>${bill.billId}</h3>
                <p>${bill.date}</p>
                <p>Total : ₹${bill.grandTotal}</p>
                <p>Remaining : ₹${bill.payment.remainingAmount || 0}</p>
            </div>
        `;
    });

    document.getElementById("remainingAmount").innerText =
        "₹" + remaining;
}

const billList = document.getElementById("billList");
billList.innerHTML = "";

partyBills.forEach((bill, index) => {

    billList.innerHTML += `
        <div class="bill-card" onclick="openBill(${index})">

            <h3>${bill.billId}</h3>

            <p>Date: ${bill.date}</p>

            <p>Total: ₹${bill.grandTotal}</p>

            <p>Remaining: ₹${bill.payment.remainingAmount}</p>

        </div>
    `;

});