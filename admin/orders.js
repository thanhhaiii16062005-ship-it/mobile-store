import { db } from "../js/firebase.js";

import {
    collection,
    getDocs,
    updateDoc,
    doc,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let orders = [];


// ===============================
// ĐỊNH DẠNG GIÁ
// ===============================
function formatPrice(price) {

    return Number(price || 0).toLocaleString("vi-VN") + " ₫";

}


// ===============================
// ĐỊNH DẠNG NGÀY
// ===============================
function formatDate(timestamp) {

    if (!timestamp) {
        return "Chưa xác định";
    }

    try {

        const date = timestamp.toDate();

        return date.toLocaleString("vi-VN");

    } catch (error) {

        return "Chưa xác định";

    }

}


// ===============================
// LOAD ĐƠN HÀNG
// ===============================
async function loadOrders() {

    const orderList = document.getElementById("orderList");

    if (!orderList) return;


    orderList.innerHTML = `
        <div class="loading-products">
            Đang tải đơn hàng...
        </div>
    `;


    try {

        const ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );


        const snapshot = await getDocs(ordersQuery);


        orders = snapshot.docs.map(item => ({

            id: item.id,

            ...item.data()

        }));


        console.log("✅ Đã tải", orders.length, "đơn hàng");


        renderOrders(orders);


    } catch (error) {

        console.error("❌ Lỗi tải đơn hàng:", error);


        // Nếu chưa có index hoặc createdAt có vấn đề
        // thì thử tải bình thường

        try {

            const snapshot = await getDocs(
                collection(db, "orders")
            );


            orders = snapshot.docs.map(item => ({

                id: item.id,

                ...item.data()

            }));


            orders.sort((a, b) => {

                const timeA = a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.toMillis?.() || 0;

                return timeB - timeA;

            });


            renderOrders(orders);


        } catch (secondError) {

            console.error(
                "❌ Không thể tải đơn hàng:",
                secondError
            );


            orderList.innerHTML = `
                <div class="empty-products">
                    Không thể tải danh sách đơn hàng.
                </div>
            `;

        }

    }

}


// ===============================
// HIỂN THỊ ĐƠN HÀNG
// ===============================
function renderOrders(orderData) {

    const orderList = document.getElementById("orderList");

    if (!orderList) return;


    if (orderData.length === 0) {

        orderList.innerHTML = `
            <div class="empty-products">
                Chưa có đơn hàng nào.
            </div>
        `;

        return;

    }


    orderList.innerHTML = `

        <div class="admin-order-table">

            <table>

                <thead>

                    <tr>

                        <th>Mã đơn</th>

                        <th>Khách hàng</th>

                        <th>Số điện thoại</th>

                        <th>Tổng tiền</th>

                        <th>Trạng thái</th>

                        <th>Ngày đặt</th>

                        <th>Thao tác</th>

                    </tr>

                </thead>


                <tbody>

                    ${orderData.map(order => `

                        <tr>

                            <td>
                                <strong>
                                    ${order.orderCode || order.id}
                                </strong>
                            </td>


                            <td>
                                ${order.customerName || "Không có"}
                            </td>


                            <td>
                                ${order.phone || "Không có"}
                            </td>


                            <td>
                                <strong class="order-price">
                                    ${formatPrice(order.total)}
                                </strong>
                            </td>


                            <td>

                                <select
                                    class="order-status-select"
                                    onchange="changeOrderStatus(
                                        '${order.id}',
                                        this.value
                                    )"
                                >

                                    <option
                                        value="Chờ xác nhận"
                                        ${order.status === "Chờ xác nhận" ? "selected" : ""}
                                    >
                                        Chờ xác nhận
                                    </option>


                                    <option
                                        value="Đã xác nhận"
                                        ${order.status === "Đã xác nhận" ? "selected" : ""}
                                    >
                                        Đã xác nhận
                                    </option>


                                    <option
                                        value="Đang giao"
                                        ${order.status === "Đang giao" ? "selected" : ""}
                                    >
                                        Đang giao
                                    </option>


                                    <option
                                        value="Đã giao"
                                        ${order.status === "Đã giao" ? "selected" : ""}
                                    >
                                        Đã giao
                                    </option>


                                    <option
                                        value="Đã hủy"
                                        ${order.status === "Đã hủy" ? "selected" : ""}
                                    >
                                        Đã hủy
                                    </option>

                                </select>

                            </td>


                            <td>
                                ${formatDate(order.createdAt)}
                            </td>


                            <td>

                                <button
                                    class="admin-action-btn"
                                    onclick="viewOrder('${order.id}')"
                                >
                                    👁️ Xem
                                </button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// ===============================
// THAY ĐỔI TRẠNG THÁI
// ===============================
window.changeOrderStatus = async function (
    orderId,
    newStatus
) {

    try {

        await updateDoc(
            doc(db, "orders", orderId),
            {
                status: newStatus
            }
        );


        const order = orders.find(
            item => item.id === orderId
        );


        if (order) {

            order.status = newStatus;

        }


        alert("✅ Đã cập nhật trạng thái đơn hàng");


    } catch (error) {

        console.error(
            "❌ Lỗi cập nhật trạng thái:",
            error
        );


        alert(
            "❌ Không thể cập nhật trạng thái đơn hàng"
        );

    }

};


// ===============================
// XEM CHI TIẾT ĐƠN HÀNG
// ===============================
window.viewOrder = function (orderId) {

    const order = orders.find(
        item => item.id === orderId
    );


    if (!order) {

        alert("Không tìm thấy đơn hàng.");

        return;

    }


    const items = order.items || [];


    let itemsHTML = "";


    if (items.length === 0) {

        itemsHTML = `
            <p>Không có sản phẩm.</p>
        `;

    } else {

        itemsHTML = items.map(item => `

            <div class="order-detail-item">

                <div>

                    <strong>
                        ${item.name || "Sản phẩm"}
                    </strong>

                    <br>

                    <span>
                        Số lượng: ${item.quantity || 1}
                    </span>

                </div>


                <strong>
                    ${formatPrice(
                        (item.price || 0) *
                        (item.quantity || 1)
                    )}
                </strong>

            </div>

        `).join("");

    }


    const modal = document.createElement("div");

    modal.className = "order-detail-modal";


    modal.innerHTML = `

        <div class="order-detail-box">

            <div class="order-detail-header">

                <div>

                    <p>ORDER DETAIL</p>

                    <h2>
                        Chi tiết đơn hàng
                    </h2>

                </div>


                <button
                    class="order-detail-close"
                    onclick="this.closest('.order-detail-modal').remove()"
                >
                    ✕
                </button>

            </div>


            <div class="order-detail-info">

                <p>
                    <strong>Mã đơn:</strong>
                    ${order.orderCode || order.id}
                </p>


                <p>
                    <strong>Khách hàng:</strong>
                    ${order.customerName || "Không có"}
                </p>


                <p>
                    <strong>Số điện thoại:</strong>
                    ${order.phone || "Không có"}
                </p>


                <p>
                    <strong>Địa chỉ:</strong>
                    ${order.address || "Không có"}
                </p>


                <p>
                    <strong>Phương thức thanh toán:</strong>
                    ${order.paymentMethod || "Không có"}
                </p>


                <p>
                    <strong>Ghi chú:</strong>
                    ${order.note || "Không có"}
                </p>


                <p>
                    <strong>Trạng thái:</strong>
                    ${order.status || "Chờ xác nhận"}
                </p>

            </div>


            <div class="order-detail-products">

                <h3>
                    Sản phẩm trong đơn
                </h3>

                ${itemsHTML}

            </div>


            <div class="order-detail-total">

                <span>
                    Tổng cộng
                </span>

                <strong>
                    ${formatPrice(order.total)}
                </strong>

            </div>

        </div>

    `;


    document.body.appendChild(modal);

};


// ===============================
// TÌM KIẾM + LỌC
// ===============================
document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
            document.getElementById("orderSearch");


        const statusFilter =
            document.getElementById("statusFilter");


        function filterOrders() {

            const keyword =
                searchInput
                    ? searchInput.value
                        .toLowerCase()
                        .trim()
                    : "";


            const status =
                statusFilter
                    ? statusFilter.value
                    : "all";


            const filteredOrders =
                orders.filter(order => {

                    const orderCode =
                        String(
                            order.orderCode || ""
                        ).toLowerCase();


                    const customerName =
                        String(
                            order.customerName || ""
                        ).toLowerCase();


                    const phone =
                        String(
                            order.phone || ""
                        ).toLowerCase();


                    const orderStatus =
                        order.status || "";


                    const matchKeyword =
                        orderCode.includes(keyword) ||
                        customerName.includes(keyword) ||
                        phone.includes(keyword);


                    const matchStatus =
                        status === "all" ||
                        orderStatus === status;


                    return (
                        matchKeyword &&
                        matchStatus
                    );

                });


            renderOrders(filteredOrders);

        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterOrders
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                filterOrders
            );

        }


        loadOrders();

    }
);