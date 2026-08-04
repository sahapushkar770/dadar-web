// ==========================================
// SAHA ENTERPRISE - SHOW BILL JAVASCRIPT
// ==========================================


let allBills = JSON.parse(localStorage.getItem("bills")) || [];
let bills = [];
let selectedParty = {};
let selectedIndex = -1;
let localModalItems = []; // Temporary array tracking active edits inside the open popup
let products = JSON.parse(localStorage.getItem("products")) || [];
let selectedAddProduct = null;
let editPaymentStatus = "Unpaid";
let editPaidAmount = 0;
let editRemainingAmount = 0;

window.onload = function () {


   selectedParty =
    JSON.parse(localStorage.getItem("selectedParty")) || null;

    if(window.billMode === "party"){

    bills = allBills.filter(bill =>

    bill.party &&
    bill.party.name === selectedParty.name &&
    bill.party.phone === selectedParty.phone

);
    console.log("Selected Party:", selectedParty);
    console.log("All Bills:", allBills);
    console.log("Filtered Bills:", bills);

        loadPartySummary();

    }else{

        bills = allBills;

    }

    displayBills();

    let search = document.getElementById("search");

    if(search){

        search.addEventListener("keyup", searchBills);

    }

    document.addEventListener("click",function(e){

        if(!e.target.closest(".menu")){

            document.querySelectorAll(".dropdown")
            .forEach(menu=>menu.style.display="none");

        }

    });

};

function loadPartySummary(){

    if(window.billMode !== "party") return;

    const party = selectedParty;

     if (!party) return;

    document.getElementById("partyAvatar").innerText =
        party.name.charAt(0).toUpperCase();

    document.getElementById("partyName").innerText =
        party.name;

    document.getElementById("partyPhone").innerText =
        party.phone;

    document.getElementById("totalBills").innerText =
        bills.length;

    let remaining = 0;

    bills.forEach(bill=>{

        if(bill.payment){

            remaining += Number(
                bill.payment.remainingAmount || 0
            );

        }else{

            remaining += Number(
                bill.grandTotal || 0
            );

        }

    });

    document.getElementById("remainingAmount").innerText =
        "₹" + remaining;

}

// ==========================================
// DISPLAY INVOICES IN PARTY DATA CONSOLE STYLE
// ==========================================
function displayBills() {

    const billList = document.getElementById("billList");
    billList.innerHTML = "";

    if (bills.length === 0) {
        billList.innerHTML = `<div class="empty-message">No Bills Found</div>`;
        return;
    }

    // Show newest bills first
    for (let i = bills.length - 1; i >= 0; i--) {

        const bill = bills[i];

        let displayPartyName =
            (bill.party && bill.party.name)
            ? bill.party.name
            : "Unknown Party";

        let displayBillId =
            bill.billId || "No ID";

        let displayDate =
            bill.date || "--/--/----";

        let displayAmount =
            bill.grandTotal !== undefined
            ? bill.grandTotal
            : (bill.total || 0);

        let avatarChar =
            displayPartyName.charAt(0).toUpperCase();

        // ================= PAYMENT =================

        let payment = bill.payment || {
            status: "Unpaid",
            paidAmount: 0,
            remainingAmount: displayAmount
        };

        let paymentHTML = "";

        if (payment.status === "Paid") {

            paymentHTML = `
                <p style="
                    color:#28a745;
                    font-weight:bold;
                    margin-top:5px;
                ">
                    ✔ Fully Paid
                </p>
            `;

        }

        else if (payment.status === "Partial") {

    if (Number(payment.remainingAmount) <= 0) {

        paymentHTML = `
            <p style="
                color:#28a745;
                font-weight:bold;
                margin-top:5px;
            ">
                ✔ Fully Paid
            </p>
        `;

    } else {

        paymentHTML = `
            <p style="
                color:#ff9800;
                font-weight:bold;
                margin-top:5px;
            ">
                Paid : ₹${payment.paidAmount}
            </p>

            <p style="
                color:#dc3545;
                font-weight:bold;
            ">
                Remaining : ₹${payment.remainingAmount}
            </p>
        `;

    }

}
        else {

            paymentHTML = `
                <p style="
                    color:#dc3545;
                    font-weight:bold;
                    margin-top:5px;
                ">
                    Remaining : ₹${payment.remainingAmount}
                </p>
            `;

        }

        // ================= CARD =================

        billList.innerHTML += `

        <div class="bill-card" onclick="openDetailsPopup(${i})">

            <div class="avatar">
                ${avatarChar}
            </div>

            <div class="bill-info">

                <h3>${displayPartyName}</h3>

                <p>Bill ID : ${displayBillId}</p>

                <span>Date : ${displayDate}</span>

                ${paymentHTML}

            </div>

            <div class="bill-right" onclick="event.stopPropagation()">

                <div class="bill-amount">
                    ₹${displayAmount}
                </div>

                <div class="menu">

                    <button class="menu-btn"
                        onclick="toggleMenu(this)">
                        ⋮
                    </button>

                    <div class="dropdown">

                        <button onclick="openDetailsPopup(${i})">
                            👁️ View / Edit
                        </button>

                        <button class="delete"
                            onclick="openDeletePopup(${i})">
                            🗑️ Delete
                        </button>

                    </div>

                </div>

            </div>

        </div>

        `;

    }

}

// Context Dropdown Controls
function toggleMenu(button) {
    document.querySelectorAll(".dropdown").forEach(menu => {
        if (menu !== button.nextElementSibling) menu.style.display = "none";
    });
    let menu = button.nextElementSibling;
    menu.style.display = menu.style.display == "block" ? "none" : "block";
}

// ==========================================
// LIVE EDITABLE INVOICE VIEWER POPUP
// ==========================================
function openDetailsPopup(index) {
    selectedIndex = index;
    const bill = bills[index];
    
    // Deep clone items array into runtime workspace to support live structural editing
    localModalItems = JSON.parse(JSON.stringify(bill.items || []));

    let displayBillId = bill.billId || "No ID";
    let displayDate = bill.date || "--/--/----";
    let displayPartyName = (bill.party && bill.party.name) ? bill.party.name : "Unknown Party";

    document.getElementById("modalBillId").innerText = displayBillId;
    document.getElementById("modalDate").innerText = displayDate;
    document.getElementById("modalPartyName").innerText = displayPartyName;

    renderModalItems();
    document.getElementById("detailsPopup").style.display = "flex";
    let payment = bill.payment || {
    status: "Unpaid",
    paidAmount: 0,
    remainingAmount: bill.grandTotal
};

if(payment.status==="Paid"){

    document.querySelector(
        "input[name='editPayment'][value='paid']"
    ).checked=true;

}

else if(payment.status==="Partial"){

    document.querySelector(
        "input[name='editPayment'][value='partial']"
    ).checked=true;

}

else{

    document.querySelector(
        "input[name='editPayment'][value='unpaid']"
    ).checked=true;

}

document.getElementById("editPaidAmount").value =
payment.paidAmount;

document.getElementById("editRemaining").innerText =
payment.remainingAmount;

editPaymentChanged();
}

// Renders product rows inside the overlay complete with individual interactive step buttons
function renderModalItems() {
    const container = document.getElementById("modalItemsList");
    container.innerHTML = "";

    let totalItems = 0;
    let grandTotal = 0;

    localModalItems.forEach((item, idx) => {
        // Fallback calculations for individual items
        let itemQty = item.qty !== undefined ? item.qty : 0;
        let itemPrice = item.price !== undefined ? item.price : 0;
        let itemTotal = item.total !== undefined ? item.total : (itemQty * itemPrice);

        totalItems += itemQty;
        grandTotal += itemTotal;
        let flavorLabel = item.flavour ? ` (${item.flavour})` : "";

        container.innerHTML += `
        <div class="modal-item-row">
            <div>
                <strong>${item.product}</strong>${flavorLabel}<br>
                <span style="color:#666; font-size:12px;">₹${itemPrice} each</span>
            </div>
            <div class="modal-qty-box">
                <button class="m-minus" onclick="changeModalQty(${idx}, -1)">-</button>
                <span>${itemQty}</span>
                <button class="m-plus" onclick="changeModalQty(${idx}, 1)">+</button>
            </div>
            <div style="font-weight:bold; width: 80px; text-align: right;">₹${itemTotal}</div>
        </div>`;
    });

    // Fallback support for displaying summary calculations inside the modal
    let bill = bills[selectedIndex];
    let displayTotalItems = totalItems || bill.totalItems || 0;
    let displayGrandTotal = grandTotal || bill.grandTotal || bill.total || 0;

    document.getElementById("modalTotalItems").innerText = displayTotalItems;
    document.getElementById("modalGrandTotal").innerText = "₹" + displayGrandTotal;
    
}

// Handles live calculations when mutating values directly inside the invoice modal view screen
function changeModalQty(index, change) {
    let item = localModalItems[index];
    item.qty += change;

    if (item.qty <= 0) {
        localModalItems.splice(index, 1);
    } else {
        item.total = item.qty * item.price;
    }
    renderModalItems();
}

// Commit active mutations straight back into local storage matrices
function saveEditedBill() {

    if (localModalItems.length === 0) {
        alert("Invoice must contain at least one item.");
        return;
    }

    let calculatedItemsCount = 0;
    let calculatedGrandTotal = 0;

    localModalItems.forEach(item => {

        calculatedItemsCount += item.qty;
        calculatedGrandTotal += item.total;

    });

    // Update bill items
    bills[selectedIndex].items = localModalItems;
    bills[selectedIndex].totalItems = calculatedItemsCount;
    bills[selectedIndex].grandTotal = calculatedGrandTotal;
    bills[selectedIndex].total = calculatedGrandTotal;

    // -------------------------
    // Update Payment
    // -------------------------

    let type = document.querySelector(
        "input[name='editPayment']:checked"
    ).value;

    let paid = 0;
    let remaining = calculatedGrandTotal;
    let status = "Unpaid";

    if (type === "paid") {

        status = "Paid";
        paid = calculatedGrandTotal;
        remaining = 0;

    }

    else if (type === "partial") {

        paid = Number(
            document.getElementById("editPaidAmount").value
        ) || 0;

        if (paid > calculatedGrandTotal) {
            paid = calculatedGrandTotal;
        }

        remaining = calculatedGrandTotal - paid;

        status = remaining === 0
            ? "Paid"
            : "Partial";
    }

    bills[selectedIndex].payment = {

        status: status,
        paidAmount: paid,
        remainingAmount: remaining

    };

    // Save AFTER updating everything
    localStorage.setItem("bills", JSON.stringify(bills));

    closeDetailsPopup();

    location.reload();
}

// ==========================================
// POPUP DIALOG WINDOW CLOSING TRIGGERS
// ==========================================
function closeDetailsPopup() {
    document.getElementById("detailsPopup").style.display = "none";
}

function printBill() {
    window.print();
}

// ==========================================
// REMOVE OPERATIONS DATA PIPELINE
// ==========================================
function openDeletePopup(index) {
    selectedIndex = index;
    document.getElementById("deletePopup").style.display = "flex";
}

function closeDeletePopup() {
    document.getElementById("deletePopup").style.display = "none";
}

function confirmDelete() {
    if (selectedIndex !== -1) {
        bills.splice(selectedIndex, 1);
        localStorage.setItem("bills", JSON.stringify(bills));
        console.log("All Bills:", allBills);
        console.log("Selected Party:", selectedParty);
        displayBills();
        closeDeletePopup();
    }
}

// ==========================================
// LIVE SEARCH FILTER INTERACTION
// ==========================================
function searchBills() {
    let value = document.getElementById("search").value.toLowerCase();
    let cards = document.querySelectorAll(".bill-card");

    cards.forEach(card => {
        let partyText = card.querySelector(".bill-info h3").innerText.toLowerCase();
        let billIdText = card.querySelector(".bill-info p").innerText.toLowerCase();

        if (partyText.includes(value) || billIdText.includes(value)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

// Close overlay windows clicking outside popup borders
window.onclick = function (e) {
    if (e.target.id === "detailsPopup") closeDetailsPopup();
    if (e.target.id === "deletePopup") closeDeletePopup();
};

// ==========================================
// ADD ITEM POPUP
// ==========================================

function openAddItemPopup() {

    displayAddProducts();

    document.getElementById("productSearch").value = "";

    document.getElementById("addItemPopup").style.display = "flex";

}

function closeAddItemPopup() {

    document.getElementById("addItemPopup").style.display = "none";

}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayAddProducts() {

    const list = document.getElementById("addProductList");

    list.innerHTML = "";

    if (products.length === 0) {

        list.innerHTML = "<p>No Products Found</p>";

        return;

    }

    products.forEach((product,index)=>{

        list.innerHTML += `

        <div class="add-product-card">

            <div>

                <strong>${product.name}</strong><br>

                ₹${product.price}

            </div>

            <button onclick="addProductToBill(${index})">

                Add

            </button>

        </div>

        `;

    });

}

// ==========================================
// SEARCH PRODUCT
// ==========================================

function searchAddProduct(){

    let value = document
        .getElementById("productSearch")
        .value
        .toLowerCase();

    let cards = document.querySelectorAll(".add-product-card");

    cards.forEach(card=>{

        card.style.display =
            card.innerText.toLowerCase().includes(value)
            ? "flex"
            : "none";

    });

}

// ==========================================
// ADD PRODUCT TO BILL
// ==========================================

function addProductToBill(index){

    let product = products[index];

    // Multiple flavours
    if(product.flavours && product.flavours.length > 1){

        selectedAddProduct = product;

        showFlavourPopup(product);

        return;
    }

    // Single or no flavour
    let flavour = "";

    if(product.flavours.length === 1){
        flavour = product.flavours[0];
    }

    addProductWithFlavour(product, flavour);

}

function showFlavourPopup(product){

    let list = document.getElementById("flavourList");

    list.innerHTML = "";

    product.flavours.forEach(flavour=>{

        list.innerHTML += `
        <div class="flavour-card">

            <span>${flavour}</span>

            <button onclick="selectFlavour('${flavour}')">

                Add

            </button>

        </div>
        `;

    });

    document.getElementById("flavourPopup").style.display="flex";

}

function closeFlavourPopup(){

    document.getElementById("flavourPopup").style.display="none";

}

function selectFlavour(flavour){

    addProductWithFlavour(selectedAddProduct, flavour);

    closeFlavourPopup();

}

function addProductWithFlavour(product, flavour){

    let existing = localModalItems.find(item =>
        item.product === product.name &&
        item.flavour === flavour
    );

    if(existing){

        existing.qty++;
        existing.total = existing.qty * existing.price;

    }else{

        localModalItems.push({

            product: product.name,
            flavour: flavour,
            qty: 1,
            price: product.price,
            total: product.price

        });

    }

    renderModalItems();

    closeAddItemPopup();

}

function editCalculateRemaining(){

    let total = Number(
        document.getElementById("modalGrandTotal")
        .innerText.replace("₹","")
    );

    let paid = Number(
        document.getElementById("editPaidAmount").value) || 0;

    if(paid > total){

        paid = total;

        document.getElementById("editPaidAmount").value = total;

    }

    let remaining = total - paid;

    document.getElementById("editRemaining").innerText = remaining;

}

function editPaymentChanged(){

    let type = document.querySelector(
        "input[name='editPayment']:checked"
    ).value;

    if(type==="partial"){

        openPartialPopup();

    }

}

function openPartialPopup(){

    let total = Number(
        document.getElementById("modalGrandTotal")
        .innerText.replace("₹","")
    );

    document.getElementById("partialTotal").innerText = total;

    let oldPaid =
        Number(document.getElementById("editPaidAmount").value) || 0;

    document.getElementById("partialPaidAmount").value = oldPaid;

    document.getElementById("partialRemaining").innerText =
        total-oldPaid;

    document.getElementById("partialPaymentPopup").style.display="flex";

}

function updatePartialRemaining(){

    let total =
        Number(document.getElementById("partialTotal").innerText);

    let paid =
        Number(document.getElementById("partialPaidAmount").value)||0;

    if(paid>total){

        paid=total;

        document.getElementById("partialPaidAmount").value=total;

    }

    document.getElementById("partialRemaining").innerText=
        total-paid;

}
function savePartialPayment(){

    document.getElementById("editPaidAmount").value=
        document.getElementById("partialPaidAmount").value;

    editCalculateRemaining();

    closePartialPopup();

}
function closePartialPopup(){

    document.getElementById("partialPaymentPopup").style.display="none";

}