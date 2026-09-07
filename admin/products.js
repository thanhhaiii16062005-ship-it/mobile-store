import { db } from "../js/firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ===============================
// BIẾN
// ===============================

let products = [];
let categories = [];

let editingProductId = null;
let deletingProductId = null;


// ===============================
// DOM
// ===============================

const productTableBody = document.getElementById("productTableBody");
const productCount = document.getElementById("productCount");

const productSearch = document.getElementById("productSearch");
const productBrandFilter = document.getElementById("productBrandFilter");
const productSort = document.getElementById("productSort");

const addProductBtn = document.getElementById("addProductBtn");

const productModal = document.getElementById("productModal");
const deleteModal = document.getElementById("deleteModal");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const productForm = document.getElementById("productForm");

const productCategory =
    document.getElementById("productCategory");


// ===============================
// KIỂM TRA JS
// ===============================

console.log("✅ admin/products.js đã chạy");


// ===============================
// FORMAT GIÁ
// ===============================

function formatPrice(price) {

    return Number(price || 0).toLocaleString("vi-VN") + " ₫";

}


// ===============================
// LOAD CATEGORIES
// ===============================

async function loadCategories() {

    if (!productCategory) return;

    try {

        const snapshot = await getDocs(
            collection(db, "categories")
        );

        categories = snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));

        console.log(
            "✅ Đã tải",
            categories.length,
            "danh mục"
        );

        renderCategoryOptions();

    } catch (error) {

        console.error(
            "❌ Lỗi tải danh mục:",
            error
        );

        productCategory.innerHTML = `
            <option value="">
                Không thể tải danh mục
            </option>
        `;

    }

}


// ===============================
// HIỂN THỊ DANH MỤC
// ===============================

function renderCategoryOptions(selectedCategory = "") {

    if (!productCategory) return;

    productCategory.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;

    categories.forEach(category => {

        const name = category.name || "";

        const option = document.createElement("option");

        option.value = name;

        option.textContent = name;

        if (name === selectedCategory) {

            option.selected = true;

        }

        productCategory.appendChild(option);

    });

}


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    console.log(
        "⏳ Đang tải products từ Firestore..."
    );

    try {

        const snapshot = await getDocs(
            collection(db, "products")
        );

        console.log(
            "✅ Firestore trả về:",
            snapshot.size,
            "sản phẩm"
        );

        products = snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));

        renderProducts();

    } catch (error) {

        console.error(
            "❌ Lỗi Firestore:",
            error
        );

        productTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="admin-table-loading"
                >
                    ❌ Không thể tải sản phẩm
                    <br><br>
                    ${error.message}
                </td>
            </tr>
        `;

    }

}


// ===============================
// RENDER PRODUCTS
// ===============================

function renderProducts() {

    let result = [...products];


    // SEARCH

    const keyword =
        productSearch.value
            .trim()
            .toLowerCase();

    if (keyword) {

        result = result.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const brand =
                String(product.brand || "")
                    .toLowerCase();

            return (
                name.includes(keyword) ||
                brand.includes(keyword)
            );

        });

    }


    // BRAND

    const brand =
        productBrandFilter.value;

    if (brand) {

        result = result.filter(
            product =>
                product.brand === brand
        );

    }


    // SORT

    if (productSort.value === "priceLow") {

        result.sort(
            (a, b) =>
                Number(a.price || 0) -
                Number(b.price || 0)
        );

    }

    else if (productSort.value === "priceHigh") {

        result.sort(
            (a, b) =>
                Number(b.price || 0) -
                Number(a.price || 0)
        );

    }

    else if (productSort.value === "nameAZ") {

        result.sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        "vi"
                    )
        );

    }


    productCount.textContent =
        result.length;


    // EMPTY

    if (result.length === 0) {

        productTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="admin-table-loading"
                >
                    📦 Chưa có sản phẩm
                </td>
            </tr>
        `;

        return;

    }


    // TABLE

    productTableBody.innerHTML =
        result.map(product => {

            const stock =
                Number(product.stock || 0);

            let stockText;
            let stockClass;


            if (stock <= 0) {

                stockText = "Hết hàng";
                stockClass = "out";

            }

            else if (stock <= 5) {

                stockText = "Sắp hết";
                stockClass = "low";

            }

            else {

                stockText = "Còn hàng";
                stockClass = "available";

            }


            return `
                <tr>

                    <td>

                        <div
                            class="admin-product-cell"
                        >

                            <img
                                src="${
                                    product.image ||
                                    "https://placehold.co/80x80?text=Phone"
                                }"
                                alt="${
                                    product.name ||
                                    "Sản phẩm"
                                }"
                                onerror="this.src='https://placehold.co/80x80?text=Phone'"
                            >

                            <div>

                                <strong>
                                    ${
                                        product.name ||
                                        "Chưa đặt tên"
                                    }
                                </strong>

                                <small>
                                    ID: ${product.id}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${product.brand || "-"}
                    </td>


                    <td>

                        <strong
                            class="admin-product-price"
                        >
                            ${formatPrice(product.price)}
                        </strong>

                    </td>


                    <td>
                        ${stock}
                    </td>


                    <td>

                        <span
                            class="admin-stock ${stockClass}"
                        >
                            ${stockText}
                        </span>

                    </td>


                    <td>

                        <div
                            class="admin-action-buttons"
                        >

                            <button
                                type="button"
                                class="admin-edit-btn"
                                data-id="${product.id}"
                            >
                                ✏️
                            </button>

                            <button
                                type="button"
                                class="admin-delete-btn"
                                data-id="${product.id}"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    // NÚT SỬA

    document
        .querySelectorAll(".admin-edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    editProduct(
                        button.dataset.id
                    );

                }
            );

        });


    // NÚT XÓA

    document
        .querySelectorAll(".admin-delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteProduct(
                        button.dataset.id
                    );

                }
            );

        });

}


// ===============================
// MỞ FORM THÊM
// ===============================

async function openAddModal() {

    editingProductId = null;

    document.getElementById(
        "modalTitle"
    ).textContent = "Thêm sản phẩm";

    productForm.reset();

    // Cập nhật danh mục mới nhất

    await loadCategories();

    renderCategoryOptions();

    productModal.classList.add("show");

}


// ===============================
// ĐÓNG MODAL
// ===============================

function closeProductModal() {

    productModal.classList.remove("show");

    productForm.reset();

    editingProductId = null;

}


// ===============================
// SỬA SẢN PHẨM
// ===============================

async function editProduct(id) {

    const product =
        products.find(
            item => item.id === id
        );

    if (!product) {

        alert(
            "Không tìm thấy sản phẩm."
        );

        return;

    }


    editingProductId = id;

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Chỉnh sửa sản phẩm";


    // Tải danh mục mới nhất

    await loadCategories();

    renderCategoryOptions(
        product.category || ""
    );


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productBrand"
    ).value =
        product.brand || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock || "";


    document.getElementById(
        "productImage"
    ).value =
        product.image || "";


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    productModal.classList.add("show");

}


// ===============================
// LƯU SẢN PHẨM
// ===============================

async function saveProduct(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("productName")
            .value
            .trim();


    const brand =
        document
            .getElementById("productBrand")
            .value;


    const category =
        document
            .getElementById("productCategory")
            .value;


    const price =
        Number(
            document
                .getElementById("productPrice")
                .value
        );


    const stock =
        Number(
            document
                .getElementById("productStock")
                .value
        );


    const image =
        document
            .getElementById("productImage")
            .value
            .trim();


    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();


    if (!name) {

        alert(
            "Vui lòng nhập tên sản phẩm."
        );

        return;

    }


    if (!brand) {

        alert(
            "Vui lòng chọn thương hiệu."
        );

        return;

    }


    if (!category) {

        alert(
            "Vui lòng chọn danh mục."
        );

        return;

    }


    try {

        const data = {

            name,
            brand,
            category,
            price,
            stock,
            image,
            description,

            updatedAt:
                serverTimestamp()

        };


        if (editingProductId === null) {

            await addDoc(
                collection(db, "products"),
                {
                    ...data,
                    createdAt:
                        serverTimestamp()
                }
            );

            alert(
                "✅ Thêm sản phẩm thành công!"
            );

        }

        else {

            await updateDoc(
                doc(
                    db,
                    "products",
                    editingProductId
                ),
                data
            );

            alert(
                "✅ Cập nhật sản phẩm thành công!"
            );

        }


        closeProductModal();

        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert(
            "❌ Lỗi khi lưu sản phẩm:\n" +
            error.message
        );

    }

}


// ===============================
// XÓA SẢN PHẨM
// ===============================

function deleteProduct(id) {

    const product =
        products.find(
            item => item.id === id
        );

    if (!product) return;


    deletingProductId = id;


    document.getElementById(
        "deleteMessage"
    ).textContent =
        `Bạn có chắc chắn muốn xóa "${product.name}"?`;


    deleteModal.classList.add("show");

}


// ===============================
// XÁC NHẬN XÓA
// ===============================

async function confirmDelete() {

    if (!deletingProductId) return;


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                deletingProductId
            )
        );


        alert(
            "✅ Đã xóa sản phẩm."
        );


        deleteModal.classList.remove(
            "show"
        );

        deletingProductId = null;

        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert(
            "❌ Không thể xóa sản phẩm:\n" +
            error.message
        );

    }

}


// ===============================
// EVENT
// ===============================

addProductBtn.addEventListener(
    "click",
    openAddModal
);


closeModalBtn.addEventListener(
    "click",
    closeProductModal
);


cancelModalBtn.addEventListener(
    "click",
    closeProductModal
);


productForm.addEventListener(
    "submit",
    saveProduct
);


cancelDeleteBtn.addEventListener(
    "click",
    () => {

        deleteModal.classList.remove(
            "show"
        );

        deletingProductId = null;

    }
);


confirmDeleteBtn.addEventListener(
    "click",
    confirmDelete
);


productSearch.addEventListener(
    "input",
    renderProducts
);


productBrandFilter.addEventListener(
    "change",
    renderProducts
);


productSort.addEventListener(
    "change",
    renderProducts
);


// ===============================
// CLICK OVERLAY
// ===============================

document
    .querySelector(
        "#productModal .admin-modal-overlay"
    )
    .addEventListener(
        "click",
        closeProductModal
    );


document
    .querySelector(
        "#deleteModal .admin-modal-overlay"
    )
    .addEventListener(
        "click",
        () => {

            deleteModal.classList.remove(
                "show"
            );

            deletingProductId = null;

        }
    );


// ===============================
// KHỞI ĐỘNG
// ===============================

async function init() {

    await loadCategories();

    await loadProducts();

}

init();