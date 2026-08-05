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

// ==========================================
// TRASH (RECENTLY DELETED BILLS)
// Deleted bills go here instead of being erased immediately, tagged with
// when they were deleted. Anything older than TRASH_RETENTION_MS gets
// permanently purged automatically.
// ==========================================

let deletedBills = JSON.parse(localStorage.getItem("deletedBills")) || [];
let selectedTrashIndex = -1;

const TRASH_RETENTION_DAYS = 7;
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

// ==========================================
// MONEY HELPERS
// Rounds to the nearest cent (avoids floating-point artifacts like
// 99.90000000000001) and formats for display with exactly 2 decimals.
// ==========================================

function roundMoney(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
}

function fmtMoney(n) {
    return roundMoney(n).toFixed(2);
}

window.onload = function () {


   selectedParty =
    JSON.parse(localStorage.getItem("selectedParty")) || null;

    purgeExpiredDeletedBills();

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

    updateTrashBadge();

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

    remaining = roundMoney(remaining);

    document.getElementById("remainingAmount").innerText =
        "₹" + fmtMoney(remaining);

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
                Paid : ₹${fmtMoney(payment.paidAmount)}
            </p>

            <p style="
                color:#dc3545;
                font-weight:bold;
            ">
                Remaining : ₹${fmtMoney(payment.remainingAmount)}
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
                    Remaining : ₹${fmtMoney(payment.remainingAmount)}
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
                    ₹${fmtMoney(displayAmount)}
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
roundMoney(payment.paidAmount);

document.getElementById("editRemaining").innerText =
fmtMoney(payment.remainingAmount);

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
        let itemTotal = roundMoney(item.total !== undefined ? item.total : (itemQty * itemPrice));

        totalItems += itemQty;
        grandTotal = roundMoney(grandTotal + itemTotal);
        let flavorLabel = item.flavour ? ` (${item.flavour})` : "";

        container.innerHTML += `
        <div class="modal-item-row">
            <div>
                <strong>${item.product}</strong>${flavorLabel}<br>
                <span style="color:#666; font-size:12px;">₹${fmtMoney(itemPrice)} each</span>
            </div>
            <div class="modal-qty-box">
                <button class="m-minus" onclick="changeModalQty(${idx}, -1)">-</button>
                <span>${itemQty}</span>
                <button class="m-plus" onclick="changeModalQty(${idx}, 1)">+</button>
            </div>
            <div style="font-weight:bold; width: 80px; text-align: right;">₹${fmtMoney(itemTotal)}</div>
        </div>`;
    });

    // Fallback support for displaying summary calculations inside the modal
    let bill = bills[selectedIndex];
    let displayTotalItems = totalItems || bill.totalItems || 0;
    let displayGrandTotal = roundMoney(grandTotal || bill.grandTotal || bill.total || 0);

    document.getElementById("modalTotalItems").innerText = displayTotalItems;
    document.getElementById("modalGrandTotal").innerText = "₹" + fmtMoney(displayGrandTotal);
    
}

// Handles live calculations when mutating values directly inside the invoice modal view screen
function changeModalQty(index, change) {
    let item = localModalItems[index];
    item.qty += change;

    if (item.qty <= 0) {
        localModalItems.splice(index, 1);
    } else {
        item.total = roundMoney(item.qty * item.price);
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
        calculatedGrandTotal = roundMoney(calculatedGrandTotal + item.total);

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

        paid = roundMoney(Number(
            document.getElementById("editPaidAmount").value
        ) || 0);

        if (paid > calculatedGrandTotal) {
            paid = calculatedGrandTotal;
        }

        remaining = roundMoney(calculatedGrandTotal - paid);

        status = remaining === 0
            ? "Paid"
            : "Partial";
    }

    bills[selectedIndex].payment = {

        status: status,
        paidAmount: paid,
        remainingAmount: remaining

    };

    // Save AFTER updating everything.
    // Note: `bills` may be a filtered subset (party view). Since its bill objects
    // are the same object references as in `allBills`, the edits above already
    // apply there too — so we persist the full allBills, not the filtered view.
    localStorage.setItem("bills", JSON.stringify(allBills));

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
        const billToDelete = bills[selectedIndex];

        // Remove from the full dataset (bills may be a filtered party-view subset)
        const globalIndex = allBills.indexOf(billToDelete);
        if (globalIndex !== -1) {
            allBills.splice(globalIndex, 1);
        }

        localStorage.setItem("bills", JSON.stringify(allBills));

        // Move into trash instead of erasing — restorable for TRASH_RETENTION_DAYS
        deletedBills.push({
            bill: billToDelete,
            deletedAt: Date.now()
        });
        localStorage.setItem("deletedBills", JSON.stringify(deletedBills));

        // Keep the local view array in sync
        bills.splice(selectedIndex, 1);

        selectedIndex = -1;

        displayBills();

        if (window.billMode === "party") {
            loadPartySummary();
        }

        updateTrashBadge();

        closeDeletePopup();
    }
}

// ==========================================
// TRASH / RESTORE
// ==========================================

// Removes anything that has sat in trash longer than the retention window
function purgeExpiredDeletedBills() {

    const now = Date.now();
    const before = deletedBills.length;

    deletedBills = deletedBills.filter(entry =>
        (now - entry.deletedAt) < TRASH_RETENTION_MS
    );

    if (deletedBills.length !== before) {
        localStorage.setItem("deletedBills", JSON.stringify(deletedBills));
    }

}

// Shows/hides the little count badge on the trash button
function updateTrashBadge() {

    const badge = document.getElementById("trashCount");

    if (!badge) return;

    if (deletedBills.length > 0) {
        badge.style.display = "inline-flex";
        badge.innerText = deletedBills.length;
    } else {
        badge.style.display = "none";
    }

}

function openTrashPopup() {

    const popup = document.getElementById("trashPopup");

    if (!popup) return;

    purgeExpiredDeletedBills();
    renderTrashList();
    updateTrashBadge();

    popup.style.display = "flex";

}

function closeTrashPopup() {

    const popup = document.getElementById("trashPopup");

    if (popup) popup.style.display = "none";

}

function renderTrashList() {

    const list = document.getElementById("trashList");

    if (!list) return;

    list.innerHTML = "";

    if (deletedBills.length === 0) {

        list.innerHTML = `<div class="empty-message">Trash is empty</div>`;

        return;

    }

    const dayMs = 24 * 60 * 60 * 1000;

    // Show most recently deleted first
    for (let i = deletedBills.length - 1; i >= 0; i--) {

        const entry = deletedBills[i];
        const bill = entry.bill;

        const displayPartyName =
            (bill.party && bill.party.name) ? bill.party.name : "Unknown Party";

        const displayBillId = bill.billId || "No ID";
        const displayDate = bill.date || "--/--/----";

        const displayAmount =
            bill.grandTotal !== undefined ? bill.grandTotal : (bill.total || 0);

        const msLeft = TRASH_RETENTION_MS - (Date.now() - entry.deletedAt);
        const daysLeft = Math.max(0, Math.ceil(msLeft / dayMs));

        const urgencyColor = daysLeft <= 1 ? "#dc3545" : "#ff9800";

        list.innerHTML += `

        <div class="trash-card">

            <div class="trash-info">

                <h3>${displayPartyName}</h3>

                <p>Bill ID : ${displayBillId}</p>

                <span>Date : ${displayDate}</span>

                <p style="color:${urgencyColor}; font-weight:bold; margin-top:5px;">
                    ${daysLeft > 0
                        ? `Auto-deletes in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                        : `Auto-deletes very soon`}
                </p>

            </div>

            <div class="trash-right">

                <div class="bill-amount">
                    ₹${fmtMoney(displayAmount)}
                </div>

                <button class="restore-btn" onclick="restoreBill(${i})">
                    <i class="fa-solid fa-rotate-left"></i>
                    Restore
                </button>

            </div>

        </div>

        `;

    }

}

function restoreBill(trashIndex) {

    const entry = deletedBills[trashIndex];

    if (!entry) return;

    // Put it back into the full dataset
    allBills.push(entry.bill);
    localStorage.setItem("bills", JSON.stringify(allBills));

    // Remove from trash
    deletedBills.splice(trashIndex, 1);
    localStorage.setItem("deletedBills", JSON.stringify(deletedBills));

    // Refresh whichever view is currently active
    if (window.billMode === "party") {

        bills = allBills.filter(bill =>
            bill.party &&
            bill.party.name === selectedParty.name &&
            bill.party.phone === selectedParty.phone
        );

        loadPartySummary();

    } else {

        bills = allBills;

    }

    displayBills();
    renderTrashList();
    updateTrashBadge();

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

                ₹${fmtMoney(product.price)}

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
        existing.total = roundMoney(existing.qty * existing.price);

    }else{

        localModalItems.push({

            product: product.name,
            flavour: flavour,
            qty: 1,
            price: product.price,
            total: roundMoney(product.price)

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

    let remaining = roundMoney(total - paid);

    document.getElementById("editRemaining").innerText = fmtMoney(remaining);

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

    document.getElementById("partialTotal").innerText = fmtMoney(total);

    let oldPaid =
        Number(document.getElementById("editPaidAmount").value) || 0;

    document.getElementById("partialPaidAmount").value = oldPaid;

    document.getElementById("partialRemaining").innerText =
        fmtMoney(total-oldPaid);

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
        fmtMoney(total-paid);

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