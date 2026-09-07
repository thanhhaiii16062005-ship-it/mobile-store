// =====================================================
// GIỎ HÀNG MOBILE STORE
// =====================================================


// =====================================================
// LẤY GIỎ HÀNG TỪ LOCAL STORAGE
// =====================================================

function getCart() {

    const cart = localStorage.getItem("mobileStoreCart");

    if (!cart) {
        return [];
    }

    try {
        return JSON.parse(cart);
    } catch (error) {
        console.error("❌ Lỗi đọc giỏ hàng:", error);
        return [];
    }
}


// =====================================================
// LƯU GIỎ HÀNG
// =====================================================

function saveCart(cart) {

    localStorage.setItem(
        "mobileStoreCart",
        JSON.stringify(cart)
    );

}


// =====================================================
// THÊM SẢN PHẨM
// =====================================================

function addToCart(product, quantity = 1) {

    const cart = getCart();

    const existingProduct = cart.find(
        item => String(item.id) === String(product.id)
    );


    if (existingProduct) {

        existingProduct.quantity += quantity;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            brand: product.brand,

            price: Number(product.price || 0),

            image: product.image || "",

            quantity: quantity

        });

    }


    saveCart(cart);

    updateCartCount();

    alert("✅ Đã thêm sản phẩm vào giỏ hàng!");

}


// =====================================================
// XÓA SẢN PHẨM
// =====================================================

function removeFromCart(productId) {

    let cart = getCart();

    cart = cart.filter(
        item => String(item.id) !== String(productId)
    );

    saveCart(cart);

    renderCart();

    updateCartCount();

}


// =====================================================
// TĂNG SỐ LƯỢNG
// =====================================================

function increaseQuantity(productId) {

    const cart = getCart();

    const product = cart.find(
        item => String(item.id) === String(productId)
    );


    if (product) {
        product.quantity++;
    }


    saveCart(cart);

    renderCart();

    updateCartCount();

}


// =====================================================
// GIẢM SỐ LƯỢNG
// =====================================================

function decreaseQuantity(productId) {

    const cart = getCart();

    const product = cart.find(
        item => String(item.id) === String(productId)
    );


    if (product) {

        product.quantity--;


        if (product.quantity <= 0) {

            removeFromCart(productId);

            return;

        }

    }


    saveCart(cart);

    renderCart();

    updateCartCount();

}


// =====================================================
// ĐỊNH DẠNG GIÁ
// =====================================================

function formatCartPrice(price) {

    return new Intl.NumberFormat("vi-VN")
        .format(Number(price || 0)) + " ₫";

}


// =====================================================
// CẬP NHẬT SỐ LƯỢNG TRÊN HEADER
// =====================================================

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }


    const cart = getCart();


    const totalQuantity = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );


    cartCount.textContent = totalQuantity;

}


// =====================================================
// HIỂN THỊ GIỎ HÀNG
// =====================================================

function renderCart() {

    const cartContent =
        document.getElementById("cartContent");


    if (!cartContent) {
        return;
    }


    const cart = getCart();


    // ================= GIỎ TRỐNG =================

    if (cart.length === 0) {

        cartContent.innerHTML = `

            <div class="cart-empty">

                <div class="cart-empty-icon">
                    🛒
                </div>

                <h2>
                    Giỏ hàng đang trống
                </h2>

                <p>
                    Hãy chọn một sản phẩm bạn yêu thích.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    Xem sản phẩm
                </a>

            </div>

        `;

        return;

    }


    // ================= TÍNH TỔNG =================

    let total = 0;

    let itemsHTML = "";


    cart.forEach(item => {

        const price =
            Number(item.price || 0);

        const quantity =
            Number(item.quantity || 1);

        const itemTotal =
            price * quantity;


        total += itemTotal;


        // Escape ID để dùng an toàn trong onclick
        const safeId =
            String(item.id)
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'");


        itemsHTML += `

            <div class="cart-item">

                <div class="cart-product">

                    <img
                        src="${item.image || "https://placehold.co/150x150?text=Mobile"}"
                        alt="${item.name || "Sản phẩm"}"
                    >

                    <div>

                        <span class="cart-brand">
                            ${item.brand || ""}
                        </span>

                        <h3>
                            ${item.name || "Sản phẩm"}
                        </h3>

                        <p class="cart-price">
                            ${formatCartPrice(price)}
                        </p>

                    </div>

                </div>


                <div class="quantity-control">

                    <button
                        onclick="decreaseQuantity('${safeId}')"
                    >
                        −
                    </button>

                    <span>
                        ${quantity}
                    </span>

                    <button
                        onclick="increaseQuantity('${safeId}')"
                    >
                        +
                    </button>

                </div>


                <div class="cart-item-total">

                    ${formatCartPrice(itemTotal)}

                </div>


                <button
                    class="remove-cart-btn"
                    onclick="removeFromCart('${safeId}')"
                >
                    🗑️
                </button>

            </div>

        `;

    });


    // ================= GIAO DIỆN TỔNG =================

    cartContent.innerHTML = `

        <div class="cart-layout">

            <div class="cart-list">

                ${itemsHTML}

            </div>


            <div class="cart-summary">

                <h2>
                    Tổng đơn hàng
                </h2>


                <div class="summary-row">

                    <span>
                        Tạm tính
                    </span>

                    <strong>
                        ${formatCartPrice(total)}
                    </strong>

                </div>


                <div class="summary-row">

                    <span>
                        Phí vận chuyển
                    </span>

                    <strong>
                        Miễn phí
                    </strong>

                </div>


                <hr>


                <div class="summary-total">

                    <span>
                        Tổng cộng
                    </span>

                    <strong>
                        ${formatCartPrice(total)}
                    </strong>

                </div>


                <button
                    class="checkout-btn"
                    onclick="checkoutCart()"
                >
                    Tiến hành đặt hàng
                </button>


                <a
                    href="products.html"
                    class="continue-shopping"
                >
                    ← Tiếp tục mua hàng
                </a>

            </div>

        </div>

    `;

}


// =====================================================
// ĐẶT HÀNG
// =====================================================

function checkoutCart() {

    const cart = getCart();


    if (cart.length === 0) {

        alert("🛒 Giỏ hàng đang trống!");

        return;

    }


    window.location.href = "orders.html";

}


// =====================================================
// KHỞI ĐỘNG
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderCart();

        updateCartCount();

    }
);