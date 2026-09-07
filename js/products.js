// ================= FIREBASE =================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ================= DANH SÁCH SẢN PHẨM =================

let products = [];


// ================= FORMAT GIÁ =================

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " ₫";
}


// ================= LẤY SẢN PHẨM TỪ FIRESTORE =================

async function loadProducts() {

    const productListElement =
        document.getElementById("productList");

    const emptyProducts =
        document.getElementById("emptyProducts");

    if (!productListElement) return;


    productListElement.innerHTML = `
        <div class="loading-products">
            Đang tải sản phẩm...
        </div>
    `;


    try {

        const snapshot =
            await getDocs(collection(db, "products"));


        products = snapshot.docs.map(item => ({

            id: item.id,

            ...item.data()

        }));


        console.log(
            "✅ Đã tải",
            products.length,
            "sản phẩm từ Firestore"
        );


        renderProducts(products);


    } catch (error) {

        console.error(
            "❌ Lỗi tải sản phẩm:",
            error
        );


        productListElement.innerHTML = `
            <div class="loading-products">
                ❌ Không thể tải sản phẩm.
                <br><br>
                ${error.message}
            </div>
        `;

    }

}


// ================= HIỂN THỊ SẢN PHẨM =================

function renderProducts(productList) {

    const productListElement =
        document.getElementById("productList");

    const emptyProducts =
        document.getElementById("emptyProducts");


    if (!productListElement) return;


    if (productList.length === 0) {

        productListElement.innerHTML = "";

        if (emptyProducts) {
            emptyProducts.style.display = "block";
        }

        return;
    }


    if (emptyProducts) {
        emptyProducts.style.display = "none";
    }


    productListElement.innerHTML =
        productList.map(product => `

            <div class="product-card">

                <div class="product-image">

                    <img
                        src="${product.image || "https://placehold.co/500x500?text=Mobile"}"
                        alt="${product.name || "Sản phẩm"}"
                    >

                </div>


                <div class="product-info">

                    <span class="product-brand">
                        ${product.brand || ""}
                    </span>


                    <h3>
                        ${product.name || "Sản phẩm"}
                    </h3>


                    <p class="product-description">
                        ${product.description || "Sản phẩm điện thoại chính hãng."}
                    </p>


                    <div class="product-bottom">

                        <span class="product-price">
                            ${formatPrice(product.price)}
                        </span>


                        <a
                            href="product-detail.html?id=${product.id}"
                            class="view-product-btn"
                        >
                            Xem sản phẩm
                        </a>

                    </div>

                </div>

            </div>

        `).join("");

}


// ================= TÌM KIẾM + LỌC =================

document.addEventListener("DOMContentLoaded", () => {

    const searchInput =
        document.getElementById("searchInput");

    const brandFilter =
        document.getElementById("brandFilter");


    function filterProducts() {

        const keyword =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const brand =
            brandFilter
                ? brandFilter.value
                : "all";


        const filtered =
            products.filter(product => {

                const productName =
                    (product.name || "")
                        .toLowerCase();


                const productBrand =
                    (product.brand || "")
                        .toLowerCase();


                const matchKeyword =
                    productName.includes(keyword) ||
                    productBrand.includes(keyword);


                const matchBrand =
                    brand === "all" ||
                    product.brand === brand;


                return matchKeyword && matchBrand;

            });


        renderProducts(filtered);

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterProducts
        );

    }


    if (brandFilter) {

        brandFilter.addEventListener(
            "change",
            filterProducts
        );

    }


    // Lấy sản phẩm từ Firestore
    loadProducts();

});