/* ---------- Funcion de consumir la API ---------- */
async function getProducts(){
    try {
        const data  = await fetch(
            "https://ecommercebackend.fundamentos-29.repl.co/"
        );
        const res = await data.json();
        window.localStorage.setItem("products", JSON.stringify(res));
        return res;
    }catch(error){
        console.log(error);
    }
}
/* ---------- Funcion que pinta los productos de la API ---------- */
function printProducts(db){
    const productsHTML = document.querySelector(".products");

    let html = "";

    for (const product of db.products) {
        const buttonAdd = product.quantity  // se encarga de revisar cuando este el prouducto agotado
                            ? `<i class='bx bx-plus bx-flashing-hover' id='${product.id}'></i>` 
                            : "<span class= 'soldOut'>sold out <i class='bx bx-error-alt bx-spin'></i></span> "
        html += `
        <div class="product ${product.category}">
            <div class="product__img">
                <img src="${product.image}" alt="imagen"/>
            </div>
            <div class="product__info" id="${product.id}">
                <h4 class="product__info-h4">${product.name} | <span><b>Stock</b>:${product.quantity}</span></h4>
                ${buttonAdd}
                <h5>
                    $${product.price}
                    
                </h5>
            </div>
            
        </div>`;
    }
    productsHTML.innerHTML = html;
}
/* ---------- Funcion mostrar y ocultar evento del carrito---------- */
function handleShowCart(){
    const iconCartHTML = document.querySelector(".bx-cart");
    const cartHTML = document.querySelector(".cart")

    iconCartHTML.addEventListener("click",function(){
        cartHTML.classList.toggle("cart__show")
    })
}
/* ---------- Funcion mostrar y ocultar evento del carrito con la X cart__stop---------- */
function handleShowCartBtnx(){
    const iconCartHTML = document.querySelector(".cart__stop");
    const cartHTML = document.querySelector(".cart")

    iconCartHTML.addEventListener("click",function(){
        cartHTML.classList.toggle("cart__show")
    })
}
/* ---------- Funcion añadir al carro  desde el producto + percistencia de datos---------- */
function addToCartFromProduts(db){
    const productsHTML = document.querySelector(".products");
    productsHTML.addEventListener("click", function(e){
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.id);
            // tratar de meter esto en una funcion
            const productFind = db.products.find( // 1
                (product) => product.id === id // 2
            );
            // cremos, añadimos y revisamos la cantidad en bodega
            if (db.cart[productFind.id]) {
                if (productFind.quantity === db.cart[productFind.id].amount) { // 3
                    return alert("No tenemos mas en Bodega"); 
                }
                db.cart[productFind.id].amount++;
            }else{
                db.cart[productFind.id] = {...productFind, amount: 1};
            }
            //guardamos en el localStorage
            window.localStorage.setItem("cart", JSON.stringify(db.cart));
            //pintamos con la funcion creada
            printProductsIncart(db);
            // se encarga de realizar la funcionalidad de el total en el cart
            printTotal(db);
            // añadimos los contadores en el carrito parte superior derecha
            handlePrintAmountProducts(db);
        }
    })
}
/* ---------- Funcion que pinta los productos de la API dentro del carro ---------- */
function printProductsIncart(db){
    const cartProducts = document.querySelector(".cart__products");

    let html = "";
    for (const product in db.cart) {
        const {quantity,price,name,image,id,amount} = db.cart[product];
            html += `
            <div class="cart__product">
                <div class="cart__product--img">
                    <img src="${image}" alt="imagen" />
                </div>
                <div class= "cart__product--body">
                    <h4>${name} | <span>$${price}</span> </h4>
                    <p>Stock: ${quantity}</p>
                    <div class= "cart__product--body-op" id='${id}'>
                        <i class='bx bx-minus bx-tada-hover'></i>
                        <span>${amount} unit </span>
                        <i class='bx bx-plus bx-tada-hover'></i>
                        <i class='bx bx-trash bx-flashing-hover'></i>
                    </div>
                </div>
            </div>
            `;
        
    }
    cartProducts.innerHTML = html;
}
/* ---------- Funcion manejando los productos del carro agregar + quitar - y eliminar ---------- */
function handleProductsIncart(db){
    const cartProducts = document.querySelector(".cart__products");
    cartProducts.addEventListener("click",function(e){
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.parentElement.id);
            // tratar de meter esto en una funcion
            const productFind = db.products.find( // 1
                (product) => product.id === id // 2
            );
            if (productFind.quantity === db.cart[productFind.id].amount) { // 3
                return alert("No tenemos mas en Bodega"); // 4  
            }
            db.cart[id].amount++;    
        }
        if (e.target.classList.contains("bx-minus")) {
            const id = Number(e.target.parentElement.id);
            if(db.cart[id].amount === 1){
                // Refactorizar el codigo  #
                const response = confirm('Esta seguro que quieres eliminar este producto ?') // 1
                if (!response) return; // 2
                delete db.cart[id]; // 3
            }else{
                db.cart[id].amount--;
            }
            
        }
        if (e.target.classList.contains("bx-trash")) {
            const id = Number(e.target.parentElement.id);  // 1
            const response = confirm('Esta seguro que quieres eliminar este producto ?'); // 2
                if (!response) return; // 3
                delete db.cart[id];
        }
        
        //guardamos en LocalStorage  yseteamos el valor del nuevo carro o accion de agregar eliminar o quitar un producto 
        window.localStorage.setItem("cart", JSON.stringify(db.cart));
        //funcion que pinta la parte de carro o la caja derecha :)
        printProductsIncart(db);
        // se encarga de realizar la funcionalidad de el total en el cart
        printTotal(db);
        // añadimos los contadores en el carrito parte superior derecha
        handlePrintAmountProducts(db);
    });
}
/* Funcion que se encarga de mostrar el total inferior */
function printTotal(db) {
    const infoTotal = document.querySelector(".info__total");
    const infoAmount = document.querySelector(".info__amount");

    let totalProducts = 0;
    let amountProducts = 0;

    for (const product in db.cart) {
        const{amount, price} = db.cart[product];
        totalProducts += price * amount;
        amountProducts += amount;
    }

    infoAmount.textContent = amountProducts + "units";
    infoTotal.textContent = "$" + totalProducts + ".00";
}
/* Funcion que se encarga de mostrar el evento de compra en la parte inferior del cart total */
function handleTotal(db){
    const btnbuy = document.querySelector(".btn__buy");

    btnbuy.addEventListener('click',function(){
        if(!Object.values(db.cart).length) 
            return alert("Vas a comprar algo ?")
        
        const response = confirm("Seguro que quieres comprar ?");
        if(!response) return;

        const currentProducts = []

        for (const product of db.products) {
            const productCart = db.cart[product.id];
            if (product.id === productCart?.id){ // el signo ? nos funciona para que no estalle la aplicacion
                currentProducts.push({
                    ...product,
                    quantity: product.quantity - productCart.amount,
                });
            }else{
                currentProducts.push(product);
            }
        }

        // actualizamos los datos 
        db.products = currentProducts;
        db.cart = {}

        // actualizamos desde el localStorage
        window.localStorage.setItem("products",JSON.stringify(db.products));
        window.localStorage.setItem("cart",JSON.stringify(db.cart));

        // llamamos nuestra funciones
        printTotal(db);
        printProductsIncart(db);
        printProducts(db);
        // añadimos los contadores en el carrito parte superior derecha
        handlePrintAmountProducts(db);
    });
}
/* funcion que se encarga de contar los productos dentro del cart button */
function handlePrintAmountProducts(db){
    const amountProducts = document.querySelector(".amountProducts");

    let amount =0;

    for (const product in db.cart) {
        amount += db.cart[product].amount;
    }

    amountProducts.textContent = amount;
}

/* funcion libreria para seleccionar categorias */
function configmixItUp() {
	mixitup(".products", {
		selectors: {
			target: ".product",
		},
		animation: {
			duration: 300,
		},
	});
}
/*{
    /* funcion que se encarga de contar los productos dentro de las categorias de los botones */
/*function handlePrintAmountProductsCategoria(db){
    const amountProducts = document.querySelector(".categoriasProducts");

    let amount =0;

    for (const product in db.cart) {
        amount += db.cart[product].amount;
    }

    amountProducts.textContent = amount;
}
}*/

function getModal(db){
    /* main programando */
    /* html = "" */
    const productsHTML = document.querySelector(".products");
    const modalDaniloHTML = document.querySelector(".modal-danilo");
    let html= ""
    productsHTML.addEventListener("click", function(e){
        
        const identifi = Number(e.target.parentElement.id);
        
        const datosSelector = db.products.find(product => product.id === identifi  );
        
        if (e.target.classList.contains("product__info-h4")) {

            const {id,quantity,price,name,image,description,category} = datosSelector;
            
            const buttonAdd = quantity  // se encarga de revisar cuando este el prouducto agotado
                ? `<i  class='bx bxs-plus-circle bx-tada-hover plusModal' id='${id}'></i>` 
                : ` <span class= "soldOutModal">sold out <i class="bx bx-error-alt bx-spin" id='${id}'></i> </span>` 
            html= `
            <div class="modal__content" id='${id}'>
                <i class='bx bxs-x-circle bx-tada-hover closeModal'></i>
                <div class="contentProduct__img">
                    <img src="${image}" alt="imagen" />
                </div>
                <h3 class="contentProduct__name">${name} - <span>${category}</span> </h3>
                <p class="contentProduct__p">${description}</p>
                    
                <div class="contentProduct__info">
                    <div id='${id}' class="contentProduct__info-precio">
                        <h3> $${price}.00 </h3>  
                    </div>
                    <p>stock:${quantity}</p>
                </div>
                    
                ${buttonAdd}    
                
            </div>`;

        }
        modalDaniloHTML.innerHTML = html;
        

    });
    
    
}

function pintarModal(db){
    const productsHTML = document.querySelector(".products");
    const modalDaniloHTML = document.querySelector(".modal-danilo");
    productsHTML.addEventListener('click',function (e) {
        if (e.target.classList.contains("product__info-h4")) {
            modalDaniloHTML.classList.add("modalDanilo__show");
        }
    })

    
    const closeModal = document.querySelector(".closeModal")
        modalDaniloHTML.addEventListener('click',function(e){
        if (e.target.classList.contains("closeModal")) {
            modalDaniloHTML.classList.remove("modalDanilo__show");
            localStorage.setItem("modalDanilo__show", true);
        }
    })
}
function plusModal(db){
    const modalDaniloHTML = document.querySelector(".modal-danilo");
        //const closeModal = document.querySelector(".closeModal")
        modalDaniloHTML.addEventListener('click',function(e){
            

            const id = Number(e.target.parentElement.id);
            const datosSelector = db.products.find(product => product.id === id  );
            if (e.target.classList.contains("bxs-plus-circle")) {
                if (db.cart[datosSelector.id]) {
                    if (datosSelector.quantity === db.cart[datosSelector.id].amount) { // 3
                        return alert("No tenemos mas en Bodega"); 
                    }
                    db.cart[datosSelector.id].amount++;
                }else{
                    db.cart[datosSelector.id] = {...datosSelector, amount: 1};
                }
                //guardamos en el localStorage
                window.localStorage.setItem("cart", JSON.stringify(db.cart));
                //pintamos con la funcion creada
                printProductsIncart(db);
                // se encarga de realizar la funcionalidad de el total en el cart
                printTotal(db);
                // añadimos los contadores en el carrito parte superior derecha
                handlePrintAmountProducts(db);
            }
        })
}

function darkmode(db){

let toggle=document.getElementById('toggle');
let label_toggle=document.getElementById('label_toggle');


    function manejarDarckmode() {
        if(document.body.classList.contains('dark-theme')){
            document.body.classList.remove("dark-theme");
            label_toggle.innerHTML='<i class="bx bx-sun bx-tada-hover"></i>';
            localStorage.removeItem("dark-theme");
            
            
        }else{
            document.body.classList.add("dark-theme");
            label_toggle.innerHTML='<i class="bx bxs-moon bx-tada-hover"></i>';            
            localStorage.setItem("dark-theme", true);
            
            
        }
    }    

    toggle.addEventListener('change',()=>{manejarDarckmode()})


let validarChecker = localStorage.getItem("dark-theme");
if(validarChecker){
    document.body.classList.add("dark-theme");
    label_toggle.innerHTML='<i class="bx bx-sun bx-tada-hover"></i>';
}else{
    label_toggle.innerHTML='<i class="bx bxs-moon bx-tada-hover"></i>';
    document.body.classList.remove("dark-theme");
}
}
function scrollHeader(db){
    window.addEventListener("scroll",function(){
        let header = this.document.querySelector("header");
        header.classList.toggle("abajo",this.window.scrollY>0);
    })
}

/* ---------- Funcion que se encarga de los hover del color en el header ---------- */
function navAction(){
    const navbarIndentificar = document.querySelectorAll(".navbar_indentificar");
    navbarIndentificar.forEach(barra => {
        barra.addEventListener('click',function () {
            navbarIndentificar.forEach(barra => {
                barra.classList.remove('navbar_indentificar_acti');
            });
            barra.classList.add('navbar_indentificar_acti');
        })
    });
}

/* ---------- Funcion manejando el menu mobile o responsive ---------- */
/* revisar no me da muy bien y quedo pendiente de hacer
mostrar carta que la tengo mas arriba */
function openNav() {
    document.getElementById("mobile-menu").style.width = "100%";
}

function closeNav() {
    document.getElementById("mobile-menu").style.width = "0%";
}

// For Live Projects
function cargaLoady(){
    window.addEventListener('load',function(){
        document.querySelector('body').classList.add("loaded")  
    });
}

async function main(){
    const db = {
        products: JSON.parse(window.localStorage.getItem("products")) || (await getProducts()),
        cart: JSON.parse(window.localStorage.getItem('cart')) || {},
    };
    printProducts(db);
    handleShowCart();
    handleShowCartBtnx()
    addToCartFromProduts(db);
    printProductsIncart(db);
    handleProductsIncart(db);
    printTotal(db);
    handleTotal(db);
    handlePrintAmountProducts(db);
    configmixItUp();
    darkmode(db);
    scrollHeader(db);
    navAction();
    getModal(db);
    pintarModal(db);
    cargaLoady();
    plusModal(db);
    

        


    

}

main();