// ================= FIREBASE =================

import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ================= CHI TIẾT SẢN PHẨM =================

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);

    const productId = params.get("id");

    const productDetail =
        document.getElementById("productDetail");

    const productNotFound =
        document.getElementById("productNotFound");


    console.log("🔎 Product ID:", productId);


    if (!productDetail) {

        console.error("❌ Không tìm thấy #productDetail");

        return;

    }


    if (!productId) {

        productDetail.style.display = "none";

        if (productNotFound) {
            productNotFound.style.display = "block";
        }

        return;

    }


    try {

        // ================= LẤY DOCUMENT =================

        const productRef =
            doc(db, "products", productId);

        const productSnap =
            await getDoc(productRef);


        console.log(
            "📦 Document tồn tại:",
            productSnap.exists()
        );


        if (!productSnap.exists()) {

            productDetail.style.display = "none";

            if (productNotFound) {
                productNotFound.style.display = "block";
            }

            return;

        }


        // ================= DỮ LIỆU =================

        const product = {

            id: productSnap.id,

            ...productSnap.data()

        };


        console.log("✅ Sản phẩm:", product);


        // ================= TIÊU ĐỀ =================

        document.title =
            `${product.name || "Sản phẩm"} - Mobile Store`;


        // ================= HIỂN THỊ =================

        productDetail.innerHTML = `

            <div class="detail-image">

                <img
                    src="${product.image || "https://placehold.co/600x600?text=Mobile"}"
                    alt="${product.name || "Sản phẩm"}"
                >

            </div>


            <div class="detail-info">

                <span class="detail-brand">
                    ${product.brand || "Mobile Store"}
                </span>


                <h1>
                    ${product.name || "Sản phẩm"}
                </h1>


                <div class="detail-price">
                    ${Number(product.price || 0).toLocaleString("vi-VN")} ₫
                </div>


                <p class="detail-description">
                    ${product.description || "Sản phẩm điện thoại chính hãng."}
                </p>


                <div class="detail-meta">

                    <p>
                        <strong>Thương hiệu:</strong>
                        ${product.brand || "Đang cập nhật"}
                    </p>


                    <p>
                        <strong>Danh mục:</strong>
                        ${product.category || "Điện thoại"}
                    </p>


                    <p>
                        <strong>Tồn kho:</strong>
                        ${product.stock ?? 0}
                    </p>


                    <p>

                        <strong>Tình trạng:</strong>

                        <span class="stock">

                            ${
                                Number(product.stock || 0) > 0
                                ? "Còn hàng"
                                : "Hết hàng"
                            }

                        </span>

                    </p>

                </div>


                <div class="detail-actions">

                    <button
                        id="addToCartBtn"
                        class="add-cart-btn"
                        ${
                            Number(product.stock || 0) <= 0
                            ? "disabled"
                            : ""
                        }
                    >
                        🛒 Thêm vào giỏ hàng
                    </button>


                    <a
                        href="cart.html"
                        class="view-cart-btn"
                    >
                        Xem giỏ hàng
                    </a>

                </div>

            </div>

        `;


        // ================= THÊM GIỎ HÀNG =================

        const addToCartBtn =
            document.getElementById("addToCartBtn");


        if (addToCartBtn) {

            addToCartBtn.addEventListener(
                "click",
                () => {

                    if (
                        typeof window.addToCart === "function"
                    ) {

                        window.addToCart(product, 1);

                        addToCartBtn.innerHTML =
                            "✅ Đã thêm vào giỏ hàng";


                        setTimeout(() => {

                            addToCartBtn.innerHTML =
                                "🛒 Thêm vào giỏ hàng";

                        }, 1500);

                    } else {

                        console.error(
                            "❌ Không tìm thấy hàm addToCart"
                        );

                    }

                }
            );

        }

    }

    catch (error) {

        console.error(
            "❌ Lỗi tải chi tiết sản phẩm:",
            error
        );


        productDetail.innerHTML = `

            <div style="
                width:100%;
                text-align:center;
                padding:50px;
            ">

                <h2>❌ Không thể tải sản phẩm</h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

});