// ===========================
// SAHA ENTERPRISE
// BILL PRODUCTS
// Part 1
// ===========================

let selectedParty = JSON.parse(localStorage.getItem("selectedParty")) || null;
let products = JSON.parse(localStorage.getItem("products")) || [];

let billItems = [];

let totalItems = 0;
let grandTotal = 0;

let paymentStatus = "Paid";
let paidAmount = 0;
let remainingAmount = 0;

// ===========================
// PAGE LOAD
// ===========================

window.onload = function () {

    if (!selectedParty) {

        alert("No party selected.");

        window.location.href = "making-bill.html";

        return;
    }

    document.getElementById("partyName").innerHTML = selectedParty.name;

    document.getElementById("billId").innerHTML =
        "Bill ID : " + generateBillId();

    displayProducts();

    document
        .getElementById("search")
        .addEventListener("keyup", searchProduct);

};

// ===========================
// BILL ID
// ===========================

function generateBillId() {

    let counter =
        Number(localStorage.getItem("billCounter")) || 1;

    let today = new Date();

    let year = today.getFullYear();

    let month = String(today.getMonth() + 1).padStart(2, "0");

    let day = String(today.getDate()).padStart(2, "0");

    return (
        year +
        month +
        day +
        "-" +
        String(counter).padStart(6, "0")
    );

}

// ===========================
// DISPLAY PRODUCTS
// ===========================

function displayProducts() {

    const list = document.getElementById("productList");

    list.innerHTML = "";

    if (products.length === 0) {

        list.innerHTML = `
            <div class="empty-message">
                No Products Found
            </div>
        `;

        return;
    }

    products.forEach((product, index) => {

        // --------------------------
        // Product with 0 or 1 flavour
        // --------------------------

        if (product.flavours.length <= 1) {

            list.innerHTML += `

            <div class="product-card">

                <div class="product-header">

                    <div>

                        <h3>${product.name}</h3>

                        <p>₹${product.price}</p>

                    </div>

                    <div class="qty-box">

                        <button
                            class="minus"
                            onclick="decrease(${index},0)">
                            -
                        </button>

                        <span
                            id="qty-${index}-0">

                            0

                        </span>

                        <button
                            class="plus"
                            onclick="increase(${index},0)">
                            +
                        </button>

                    </div>

                </div>

            </div>

            `;

        }

        // --------------------------
        // Product with multiple flavours
        // --------------------------

        else {

            let html = `

            <div class="product-card">

                <div class="product-header">

                    <div>

                        <h3>${product.name}</h3>

                        <p>₹${product.price}</p>

                    </div>

                </div>

            `;

            product.flavours.forEach((flavour, fIndex) => {

                html += `

                <div class="flavour-row">

                    <span>${flavour}</span>

                    <div class="qty-box">

                        <button
                            class="minus"
                            onclick="decrease(${index},${fIndex})">

                            -

                        </button>

                        <span
                            id="qty-${index}-${fIndex}">

                            0

                        </span>

                        <button
                            class="plus"
                            onclick="increase(${index},${fIndex})">

                            +

                        </button>

                    </div>

                </div>

                `;

            });

            html += `</div>`;

            list.innerHTML += html;

        }

    });

}

// ===========================
// SEARCH
// ===========================

function searchProduct() {

    let value =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    let cards =
        document.querySelectorAll(".product-card");

    cards.forEach(card => {

        let text =
            card.innerText.toLowerCase();

        card.style.display =
            text.includes(value)
            ? "block"
            : "none";

    });

}

// ===========================
// PART 2
// QUANTITY & BILL LOGIC
// ===========================

// Store quantities
let quantities = {};

// ===========================
// INCREASE
// ===========================

function increase(productIndex, flavourIndex) {

    let key = productIndex + "-" + flavourIndex;

    if (!quantities[key]) {
        quantities[key] = 0;
    }

    quantities[key]++;

    document.getElementById("qty-" + key).innerHTML =
        quantities[key];

    updateBill();

}

// ===========================
// DECREASE
// ===========================

function decrease(productIndex, flavourIndex) {

    let key = productIndex + "-" + flavourIndex;

    if (!quantities[key]) {
        quantities[key] = 0;
    }

    if (quantities[key] > 0) {
        quantities[key]--;
    }

    document.getElementById("qty-" + key).innerHTML =
        quantities[key];

    updateBill();

}

// ===========================
// UPDATE BILL
// ===========================

// ===========================
// UPDATE BILL
// ===========================

function updateBill() {

    billItems = [];
    totalItems = 0;
    grandTotal = 0;

    products.forEach((product, productIndex) => {

        // Products with 0 or 1 flavour
        if (product.flavours.length <= 1) {

            let key = productIndex + "-0";
            let qty = quantities[key] || 0;

            if (qty > 0) {

                let total = qty * product.price;

                totalItems += qty;
                grandTotal += total;

                billItems.push({

                    product: product.name,
                    flavour: product.flavours.length === 1
                        ? product.flavours[0]
                        : "",

                    qty: qty,
                    price: product.price,
                    total: total

                });

            }

        }

        // Products with multiple flavours
        else {

            product.flavours.forEach((flavour, flavourIndex) => {

                let key = productIndex + "-" + flavourIndex;
                let qty = quantities[key] || 0;

                if (qty > 0) {

                    let total = qty * product.price;

                    totalItems += qty;
                    grandTotal += total;

                    billItems.push({

                        product: product.name,
                        flavour: flavour,
                        qty: qty,
                        price: product.price,
                        total: total

                    });

                }

            });

        }

    });

    // Update Summary
document.getElementById("totalItems").textContent = totalItems;
document.getElementById("grandTotal").textContent = "₹" + grandTotal;

// Save Button
const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {
    saveBtn.disabled = (totalItems === 0);
}

// Print Button
const printBtn = document.getElementById("printBtn");

if (printBtn) {
    printBtn.disabled = (totalItems === 0);
}

// Update payment section whenever total changes
paymentTypeChanged();

}

// ===========================
// PART 3
// SAVE / CLEAR / PRINT BILL
// ===========================

// Save Bill
// ==========================================
// SAVE BILL (FIXED DATA PROPERTY HOOK)
// ==========================================
function saveBill() {

    if (billItems.length === 0) {
        alert("Please add at least one product.");
        return;
    }

    let bills = JSON.parse(localStorage.getItem("bills")) || [];
    let counter = Number(localStorage.getItem("billCounter")) || 1;

    // Get payment details
    const paymentType =
        document.querySelector('input[name="paymentType"]:checked')?.value || "unpaid";

    let paid = 0;
    let remaining = grandTotal;
    let paymentStatusLabel = "Unpaid";

    if (paymentType === "paid") {
        paid = grandTotal;
        remaining = 0;
        paymentStatusLabel = "Paid";
    }
    else if (paymentType === "partial") {
        paid = Number(document.getElementById("paidAmount").value) || 0;

        if (paid > grandTotal) {
            paid = grandTotal;
        }

        remaining = grandTotal - paid;

        // If the partial amount happens to cover the full total, treat it as Paid
        paymentStatusLabel = remaining === 0 ? "Paid" : "Partial";
    }

    const currentBill = {

        billId: generateBillId(),

        date: new Date().toLocaleDateString("en-IN"),

        party: {
            name: selectedParty.name,
            phone: selectedParty.phone
        },

        items: [...billItems],

        totalItems: totalItems,

        grandTotal: grandTotal,

        payment: {
            status: paymentStatusLabel,
            paidAmount: paid,
            remainingAmount: remaining
        }

    };

    bills.push(currentBill);

    localStorage.setItem("bills", JSON.stringify(bills));
    localStorage.setItem("billCounter", counter + 1);

    window.location.href = "show-bill.html";
}

function confirmSaveBill() {

    let bills = JSON.parse(localStorage.getItem("bills")) || [];
    let counter = Number(localStorage.getItem("billCounter")) || 1;

    // Current Bill ID
    let activeBillId = generateBillId();

    // Payment Details
    let payment = {
        status: paymentStatus,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount
    };

    // Bill Object
    let currentInvoice = {

        billId: activeBillId,

        date: new Date().toLocaleDateString("en-IN"),

        party: selectedParty,

        items: billItems,

        totalItems: totalItems,

        grandTotal: grandTotal,

        payment: payment

    };

    // Save Bill
    bills.push(currentInvoice);

    localStorage.setItem("bills", JSON.stringify(bills));

    // Increase Bill Counter
    localStorage.setItem("billCounter", counter + 1);

    // Close Payment Popup
    closePaymentPopup();

    alert("Invoice Record Saved Successfully!");

    window.location.href = "show-bill.html";

}


// ===========================
// CLEAR BILL
// ===========================

function clearBill() {

    quantities = {};

    document.querySelectorAll("[id^='qty-']").forEach(qty => {
        qty.textContent = "0";
    });

    updateBill();

}

// ===========================
// PRINT BILL
// ===========================

function printBill() {

    window.print();

}

// ===========================
// PAYMENT POPUP
// ===========================

remainingAmount = 0;
document.getElementById("remainingAmount").innerText = "0";

function closePaymentPopup(){

    document.getElementById("paymentPopup").style.display = "none";

}

function paymentTypeChanged() {

    const type = document.querySelector(
        "input[name='paymentType']:checked"
    ).value;

    const paidBox = document.getElementById("paidAmountBox");

    if (type === "paid") {

        paymentStatus = "Paid";
        paidAmount = grandTotal;
        remainingAmount = 0;

        paidBox.style.display = "none";

    }

    else if (type === "partial") {

        paymentStatus = "Partial";

        paidBox.style.display = "block";

        paidAmount = Number(document.getElementById("paidAmount").value) || 0;

        remainingAmount = grandTotal - paidAmount;

        if (remainingAmount < 0)
            remainingAmount = 0;

    }

    else {

        paymentStatus = "Unpaid";

        paidAmount = 0;

        remainingAmount = grandTotal;

        paidBox.style.display = "none";

        document.getElementById("paidAmount").value = 0;

    }

    document.getElementById("remainingAmount").innerText =
        remainingAmount;

}

function calculateRemaining() {

    paidAmount =
        Number(document.getElementById("paidAmount").value) || 0;

    if (paidAmount > grandTotal) {

        paidAmount = grandTotal;

        document.getElementById("paidAmount").value =
            grandTotal;

    }

    remainingAmount = grandTotal - paidAmount;

    if (remainingAmount < 0)
        remainingAmount = 0;

    document.getElementById("remainingAmount").innerText =
        remainingAmount;

}
