// ===========================
// SAHA ENTERPRISE PRODUCT
// ===========================


let products = JSON.parse(localStorage.getItem("products")) || [];

let selectedIndex = -1;

let tempFlavours = [];

let editFlavours = [];



// ===========================
// LOAD PAGE
// ===========================


window.onload = function(){

    displayProducts();

    document
    .getElementById("search")
    .addEventListener("keyup",searchProduct);

};





// ===========================
// DISPLAY PRODUCTS
// ===========================


function displayProducts(){


    let grid = document.getElementById("productGrid");

    grid.innerHTML="";


    products.forEach((product,index)=>{


        grid.innerHTML += `

        <div class="product-card"
        onclick="openDetails(${index})">


            <div class="product-menu"
            onclick="event.stopPropagation()">


                <button class="menu-btn"
                onclick="toggleMenu(this)">
                    ⋮
                </button>


                <div class="dropdown">


                    <button onclick="editProduct(${index})">
                        ✏ Edit
                    </button>


                    <button class="delete"
                    onclick="deleteProduct(${index})">
                        🗑 Delete
                    </button>


                </div>


            </div>



            <div class="product-icon">
                📦
            </div>


            <h3>
                ${product.name}
            </h3>


            <div class="product-price">
                ₹${product.price}
            </div>


            <div class="flavour-count">

                Flavours: ${product.flavours.length}

            </div>


        </div>

        `;


    });



    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


}






// ===========================
// MENU
// ===========================


function toggleMenu(button){


    document.querySelectorAll(".dropdown")
    .forEach(menu=>{


        if(menu!==button.nextElementSibling){

            menu.style.display="none";

        }

    });



    let menu = button.nextElementSibling;


    menu.style.display =
    menu.style.display=="block"
    ? "none"
    : "block";


}



document.addEventListener("click",function(e){


    if(!e.target.closest(".product-menu")){


        document.querySelectorAll(".dropdown")
        .forEach(menu=>{

            menu.style.display="none";

        });


    }


});







// ===========================
// ADD PRODUCT POPUP
// ===========================



function openAddPopup(){


    document.getElementById("productName").value="";

    document.getElementById("productPrice").value="";

    document.getElementById("flavourInput").value="";


    tempFlavours=[];

    displayAddFlavours();


    document.getElementById("addPopup")
    .style.display="flex";


}



function closeAddPopup(){


    document.getElementById("addPopup")
    .style.display="none";


}






// ADD FLAVOUR


function addFlavour(){


    let flavour =
    document.getElementById("flavourInput")
    .value.trim();



    if(flavour=="")
    return;



    tempFlavours.push(flavour);



    document.getElementById("flavourInput")
    .value="";


    displayAddFlavours();


}





function displayAddFlavours(){


    let box =
    document.getElementById("addFlavourList");


    box.innerHTML="";



    tempFlavours.forEach((flavour,index)=>{


        box.innerHTML += `

        <div class="flavour-item">

            ${flavour}

            <button onclick="removeAddFlavour(${index})">
                ❌
            </button>

        </div>

        `;


    });


}





function removeAddFlavour(index){


    tempFlavours.splice(index,1);

    displayAddFlavours();


}






// SAVE PRODUCT


function saveProduct(){

    let name = document.getElementById("productName").value.trim();

    let price = document.getElementById("productPrice").value.trim();

    if(name === ""){

        alert("Please enter the product name.");

        return;

    }

    if(price === ""){

        alert("Please enter the product price.");

        return;

    }

    products.push({

        name: name,
        price: Number(price),
        flavours: [...tempFlavours]

    });

    displayProducts();

    closeAddPopup();

}








// ===========================
// DETAILS POPUP
// ===========================


function openDetails(index){


    selectedIndex=index;


    let product=products[index];


    document.getElementById("detailsName")
    .innerHTML=product.name;



    document.getElementById("detailsPrice")
    .innerHTML=
    "Price: ₹"+product.price;



    let box =
    document.getElementById("detailsFlavours");



    box.innerHTML="";



    product.flavours.forEach(flavour=>{


        box.innerHTML += `

        <p>• ${flavour}</p>

        `;


    });



    document.getElementById("detailsPopup")
    .style.display="flex";


}




function closeDetailsPopup(){


    document.getElementById("detailsPopup")
    .style.display="none";


}







// ===========================
// EDIT PRODUCT
// ===========================



function editProduct(index){


    selectedIndex=index;


    let product=products[index];


    document.getElementById("editProductName")
    .value=product.name;


    document.getElementById("editProductPrice")
    .value=product.price;



    editFlavours=[...product.flavours];


    displayEditFlavours();



    document.getElementById("editPopup")
    .style.display="flex";


}





function openEditFromDetails(){


    closeDetailsPopup();


    editProduct(selectedIndex);


}




function closeEditPopup(){


    document.getElementById("editPopup")
    .style.display="none";


}







function addEditFlavour(){


    let flavour =
    document.getElementById("editFlavourInput")
    .value.trim();



    if(flavour=="")
    return;



    editFlavours.push(flavour);



    document.getElementById("editFlavourInput")
    .value="";


    displayEditFlavours();


}





function displayEditFlavours(){


    let box =
    document.getElementById("editFlavourList");


    box.innerHTML="";



    editFlavours.forEach((flavour,index)=>{


        box.innerHTML += `


        <div class="flavour-item">

        ${flavour}


        <button onclick="removeEditFlavour(${index})">
            ❌
        </button>


        </div>


        `;


    });


}





function removeEditFlavour(index){


    editFlavours.splice(index,1);

    displayEditFlavours();


}





function updateProduct(){

    let name = document.getElementById("editProductName").value.trim();

    let price = document.getElementById("editProductPrice").value.trim();

    if(name === ""){

        alert("Please enter the product name.");

        return;

    }

    if(price === ""){

        alert("Please enter the product price.");

        return;

    }

    products[selectedIndex] = {

        name: name,
        price: Number(price),
        flavours: [...editFlavours]

    };

    displayProducts();

    closeEditPopup();

}








// ===========================
// DELETE PRODUCT
// ===========================



function deleteProduct(index){


    selectedIndex=index;


    document.getElementById("deletePopup")
    .style.display="flex";


}




function closeDeletePopup(){


    document.getElementById("deletePopup")
    .style.display="none";


}





function confirmDelete(){


    products.splice(selectedIndex,1);


    displayProducts();


    closeDeletePopup();


}







// ===========================
// SEARCH
// ===========================


function searchProduct(){


    let value =
    document.getElementById("search")
    .value.toLowerCase();



    let cards =
    document.querySelectorAll(".product-card");



    cards.forEach(card=>{


        let text =
        card.innerText.toLowerCase();



        card.style.display =
        text.includes(value)
        ? "block"
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



    if(e.target.id=="detailsPopup")
    closeDetailsPopup();



    if(e.target.id=="deletePopup")
    closeDeletePopup();



}