
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ===============================
// CẤU HÌNH THANH TOÁN
// ===============================
const BANK_ID = "Techcombank";
const BANK_ACCOUNT = "19074893826011";
const BANK_ACCOUNT_NAME = "DAO THANH HAI";

// ===============================
// LẤY GIỎ HÀNG
// ===============================
function getCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem("mobileStoreCart") || "[]"
        );

        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Lỗi đọc giỏ hàng:", error);
        return [];
    }
}

// ===============================
// ĐỊNH DẠNG
// ===============================
function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " ₫";
}

function generateOrderCode() {
    return "MS" + Date.now().toString().slice(-8);
}

function calculateTotal(cart) {
    return cart.reduce((sum, item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (
            !Number.isFinite(price) ||
            !Number.isFinite(quantity) ||
            price < 0 ||
            quantity <= 0
        ) {
            throw new Error("Giỏ hàng có sản phẩm hoặc số lượng không hợp lệ.");
        }

        return sum + price * quantity;
    }, 0);
}

// ===============================
// HIỂN THỊ TÓM TẮT ĐƠN HÀNG
// Khớp với HTML hiện tại: #orderSummary
// ===============================
function renderOrderSummary() {
    const container = document.getElementById("orderSummary");
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.textContent = "🛒 Giỏ hàng đang trống.";
        updateBankQR();
        return;
    }

    let total;

    try {
        total = calculateTotal(cart);
    } catch (error) {
        container.textContent = error.message;
        return;
    }

    container.replaceChildren();

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "order-item";

        const info = document.createElement("div");
        info.className = "order-item-info";

        const name = document.createElement("strong");
        name.textContent = item.name || "Sản phẩm";

        const quantity = document.createElement("span");
        quantity.textContent =
            `${Number(item.quantity)} × ${formatPrice(item.price)}`;

        const subtotal = document.createElement("strong");
        subtotal.textContent = formatPrice(
            Number(item.price) * Number(item.quantity)
        );

        info.append(name, quantity);
        row.append(info, subtotal);
        container.appendChild(row);
    });

    const totalRow = document.createElement("div");
    totalRow.className = "order-summary-total";

    const label = document.createElement("strong");
    label.textContent = "Tổng thanh toán";

    const amount = document.createElement("strong");
    amount.textContent = formatPrice(total);

    totalRow.append(label, amount);
    container.appendChild(totalRow);

    updateBankQR();
}

// ===============================
// TẠO VÀ HIỂN THỊ QR
// ===============================
let currentOrderCode = generateOrderCode();

function updateBankQR() {
    const box = document.getElementById("bankPaymentBox");
    const qrImage = document.getElementById("bankQrImage");
    const amountElement = document.getElementById("bankPaymentAmount");
    const contentElement = document.getElementById("bankPaymentContent");

    if (!box || !qrImage) return;

    const payment = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    const isBank = payment?.value === "BANK";
    const cart = getCart();

    box.hidden = !isBank;

    if (!isBank || cart.length === 0) {
        return;
    }

    let total;

    try {
        total = calculateTotal(cart);
    } catch (error) {
        console.error(error);
        return;
    }

    // Nội dung chuyển khoản ngắn, dễ đối soát.
    const transferContent = currentOrderCode;

    const params = new URLSearchParams({
        amount: String(Math.round(total)),
        addInfo: transferContent,
        accountName: BANK_ACCOUNT_NAME
    });

    qrImage.src =
        `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact2.png?${params.toString()}`;

    if (amountElement) {
        amountElement.textContent = formatPrice(total);
    }

    if (contentElement) {
        contentElement.textContent = transferContent;
    }
}

// ===============================
// KIỂM TRA SỐ ĐIỆN THOẠI
// ===============================
function isValidPhone(phone) {
    return /^(0|\+84)[0-9]{9,10}$/.test(phone);
}

// ===============================
// ĐẶT HÀNG
// ===============================
async function submitOrder(event) {
    event.preventDefault();

    const form = document.getElementById("orderForm");
    const button = form?.querySelector('button[type="submit"]');
    const message = document.getElementById("orderMessage");

    const showMessage = text => {
        if (message) {
            message.textContent = text;
        } else {
            alert(text);
        }
    };

    const cart = getCart();

    if (cart.length === 0) {
        showMessage("Giỏ hàng đang trống!");
        return;
    }

    const customerName =
        document.getElementById("customerName")?.value.trim() || "";

    const customerPhone =
        document.getElementById("customerPhone")?.value.trim() || "";

    const customerAddress =
        document.getElementById("customerAddress")?.value.trim() || "";

    const note =
        document.getElementById("orderNote")?.value.trim() || "";

    const payment = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    const paymentMethod = payment?.value || "COD";

    if (!customerName) {
        showMessage("Vui lòng nhập họ và tên.");
        return;
    }

    if (!isValidPhone(customerPhone)) {
        showMessage("Số điện thoại không hợp lệ.");
        return;
    }

    if (!customerAddress) {
        showMessage("Vui lòng nhập địa chỉ nhận hàng.");
        return;
    }

    let total;

    try {
        total = calculateTotal(cart);
    } catch (error) {
        showMessage(error.message);
        return;
    }

    if (!Number.isFinite(total) || total <= 0) {
        showMessage("Tổng đơn hàng không hợp lệ.");
        return;
    }

    const orderCode = currentOrderCode;

    const orderData = {
        orderCode,
        customerName,
        phone: customerPhone,
        address: customerAddress,
        note,
        paymentMethod,
        items: cart,
        total,
        status: "Chờ xác nhận",
        paymentStatus:
            paymentMethod === "BANK"
                ? "Chưa thanh toán"
                : paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : "Chưa thanh toán",
        createdAt: serverTimestamp()
    };

    if (button) {
        button.disabled = true;
        button.textContent = "Đang lưu đơn hàng...";
    }

    if (message) message.textContent = "";

    try {
        await addDoc(collection(db, "orders"), orderData);

        // Chỉ xóa giỏ hàng sau khi lưu đơn thành công.
        localStorage.removeItem("mobileStoreCart");

        if (typeof window.updateCartCount === "function") {
            window.updateCartCount();
        }

        const codeElement = document.getElementById("orderCode");
        if (codeElement) {
            codeElement.textContent = orderCode;
        }

        if (form) {
            form.style.display = "none";
        }

        const success = document.getElementById("orderSuccess");
        if (success) {
            success.style.display = "block";
        }

        // Nếu chuyển khoản, giữ QR hiển thị để khách thanh toán.
        // Không tự động đánh dấu đơn là đã thanh toán.
        if (paymentMethod === "BANK") {
            const box = document.getElementById("bankPaymentBox");
            if (box) box.hidden = false;

            const amountElement =
                document.getElementById("bankPaymentAmount");

            const contentElement =
                document.getElementById("bankPaymentContent");

            if (amountElement) {
                amountElement.textContent = formatPrice(total);
            }

            if (contentElement) {
                contentElement.textContent = orderCode;
            }
        } else {
            const box = document.getElementById("bankPaymentBox");
            if (box) box.hidden = true;
        }

        // Cho phép tạo mã mới nếu khách quay lại đặt đơn khác.
        currentOrderCode = generateOrderCode();

        renderOrderSummary();

    } catch (error) {
        console.error("Lỗi lưu đơn hàng:", error);
        showMessage("Không thể lưu đơn hàng. Vui lòng thử lại.");

        if (button) {
            button.disabled = false;
            button.textContent = "Đặt hàng";
        }
    }
}

// ===============================
// KHỞI TẠO TRANG
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    renderOrderSummary();

    document.getElementById("orderForm")?.addEventListener(
        "submit",
        submitOrder
    );

    document.querySelectorAll(
        'input[name="paymentMethod"]'
    ).forEach(input => {
        input.addEventListener("change", updateBankQR);
    });

    if (typeof window.updateCartCount === "function") {
        window.updateCartCount();
    }
});
