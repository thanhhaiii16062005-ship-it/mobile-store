import { db } from "../js/firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// FORMAT TIỀN
// ==========================================

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + " ₫";
}


// ==========================================
// FORMAT NGÀY
// ==========================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Chưa xác định";
    }

    try {

        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleString("vi-VN");
        }

        return new Date(timestamp).toLocaleString("vi-VN");

    } catch (error) {
        return "Chưa xác định";
    }
}


// ==========================================
// CHUYỂN CREATEDAT THÀNH TIMESTAMP
// ==========================================

function getTime(timestamp) {

    if (!timestamp) {
        return 0;
    }

    try {

        if (timestamp.toDate) {
            return timestamp.toDate().getTime();
        }

        return new Date(timestamp).getTime();

    } catch (error) {

        return 0;

    }
}


// ==========================================
// SẢN PHẨM
// ==========================================

async function loadProducts() {

    const element =
        document.getElementById("totalProducts");

    if (!element) return;

    try {

        const snapshot =
            await getDocs(
                collection(db, "products")
            );

        element.textContent = snapshot.size;

    } catch (error) {

        console.error("Lỗi tải sản phẩm:", error);

        element.textContent = "0";
    }
}


// ==========================================
// ĐƠN HÀNG + THỐNG KÊ
// ==========================================

async function loadOrders() {

    const totalOrders =
        document.getElementById("totalOrders");

    const totalRevenue =
        document.getElementById("totalRevenue");

    const pendingOrders =
        document.getElementById("pendingOrders");

    const shippingOrders =
        document.getElementById("shippingOrders");

    const completedOrders =
        document.getElementById("completedOrders");

    const cancelledOrders =
        document.getElementById("cancelledOrders");


    try {

        const snapshot =
            await getDocs(
                collection(db, "orders")
            );


        let revenue = 0;

        let pending = 0;
        let shipping = 0;
        let completed = 0;
        let cancelled = 0;


        snapshot.forEach(orderDocument => {

            const order =
                orderDocument.data();


            revenue += Number(order.total || 0);


            switch (order.status) {

                case "Chờ xác nhận":
                    pending++;
                    break;

                case "Đang giao":
                    shipping++;
                    break;

                case "Đã giao":
                case "Hoàn thành":
                    completed++;
                    break;

                case "Đã hủy":
                    cancelled++;
                    break;

            }

        });


        if (totalOrders) {
            totalOrders.textContent = snapshot.size;
        }


        if (totalRevenue) {
            totalRevenue.textContent =
                formatPrice(revenue);
        }


        if (pendingOrders) {
            pendingOrders.textContent = pending;
        }


        if (shippingOrders) {
            shippingOrders.textContent = shipping;
        }


        if (completedOrders) {
            completedOrders.textContent = completed;
        }


        if (cancelledOrders) {
            cancelledOrders.textContent = cancelled;
        }


    } catch (error) {

        console.error(
            "Lỗi tải đơn hàng:",
            error
        );

    }
}


// ==========================================
// KHÁCH HÀNG
// ==========================================

async function loadCustomers() {

    const element =
        document.getElementById("totalCustomers");

    if (!element) return;


    try {

        const snapshot =
            await getDocs(
                collection(db, "users")
            );

        element.textContent = snapshot.size;

    } catch (error) {

        console.error(
            "Lỗi tải khách hàng:",
            error
        );

        element.textContent = "0";
    }
}


// ==========================================
// ĐƠN HÀNG GẦN ĐÂY
// ==========================================

async function loadRecentOrders() {

    const container =
        document.getElementById("recentOrders");

    if (!container) return;


    try {

        container.innerHTML = `
            <div class="admin-loading">
                Đang tải đơn hàng...
            </div>
        `;


        const snapshot =
            await getDocs(
                collection(db, "orders")
            );


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="admin-empty">
                    🧾 Chưa có đơn hàng nào
                </div>
            `;

            return;
        }


        // Chuyển Firestore thành mảng
        const orders = snapshot.docs.map(orderDocument => {

            return {
                id: orderDocument.id,
                ...orderDocument.data()
            };

        });


        // Sắp xếp đơn mới nhất lên đầu
        orders.sort((a, b) => {

            return getTime(b.createdAt) -
                   getTime(a.createdAt);

        });


        // Chỉ lấy 5 đơn gần nhất
        const recentOrders =
            orders.slice(0, 5);


        container.innerHTML = "";


        recentOrders.forEach(order => {

            const item =
                document.createElement("div");

            item.className =
                "admin-recent-order";


            item.innerHTML = `

                <div class="recent-order-info">

                    <strong>
                        ${order.orderCode || "Không có mã"}
                    </strong>

                    <span>
                        ${order.customerName || "Khách hàng"}
                    </span>

                    <small>
                        ${formatDate(order.createdAt)}
                    </small>

                </div>


                <div class="recent-order-right">

                    <strong>
                        ${formatPrice(order.total)}
                    </strong>

                    <span class="order-status">
                        ${order.status || "Chưa xác định"}
                    </span>

                </div>

            `;


            container.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Lỗi tải đơn hàng gần đây:",
            error
        );


        container.innerHTML = `
            <div class="admin-error">
                ❌ Không thể tải đơn hàng
            </div>
        `;

    }
}


// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    console.log(
        "🚀 Admin Dashboard đang tải..."
    );


    await Promise.all([

        loadProducts(),

        loadOrders(),

        loadCustomers(),

        loadRecentOrders()

    ]);


    console.log(
        "✅ Admin Dashboard đã tải xong"
    );

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);