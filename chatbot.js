// ========================================
// MOBILE STORE - CUSTOMER CHATBOT
// ========================================

(function () {

    // Tạo giao diện chatbot
    const chatbotHTML = `
        <div id="chatbot-container">

            <!-- Nút mở chatbot -->
            <button id="chatbot-toggle" type="button">
                <span class="chatbot-icon">💬</span>
                <span class="chatbot-badge">1</span>
            </button>

            <!-- Cửa sổ chatbot -->
            <div id="chatbot-box">

                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">🤖</div>
                        <div>
                            <strong>Mobile Store AI</strong>
                            <span>● Đang hoạt động</span>
                        </div>
                    </div>

                    <button id="chatbot-close" type="button">
                        ×
                    </button>
                </div>


                <div id="chatbot-messages">

                    <div class="chatbot-message bot">
                        <div class="message-avatar">🤖</div>

                        <div class="message-content">
                            Xin chào! 👋<br>
                            Mình là trợ lý AI của <strong>Mobile Store</strong>.<br><br>
                            Mình có thể hỗ trợ bạn:
                            <br>📱 Tư vấn điện thoại
                            <br>💰 Tìm sản phẩm theo ngân sách
                            <br>📦 Hỏi về đơn hàng
                            <br>💳 Thanh toán
                            <br>🚚 Giao hàng
                            <br>🛠️ Bảo hành
                        </div>
                    </div>

                </div>


                <!-- Câu hỏi nhanh -->
                <div class="chatbot-quick">

                    <button type="button" data-question="Tư vấn điện thoại cho tôi">
                        📱 Tư vấn điện thoại
                    </button>

                    <button type="button" data-question="Điện thoại nào giá rẻ?">
                        💰 Điện thoại giá rẻ
                    </button>

                    <button type="button" data-question="Tôi muốn hỏi về đơn hàng">
                        📦 Hỏi đơn hàng
                    </button>

                </div>


                <!-- Ô nhập -->
                <form id="chatbot-form">

                    <input
                        type="text"
                        id="chatbot-input"
                        placeholder="Nhập câu hỏi..."
                        autocomplete="off"
                    >

                    <button type="submit" id="chatbot-send">
                        ➤
                    </button>

                </form>

            </div>

        </div>
    `;


    // Chèn chatbot vào cuối body
    function initChatbot() {

        if (!document.body) return;

        // Không tạo chatbot 2 lần
        if (document.getElementById("chatbot-container")) {
            return;
        }

        document.body.insertAdjacentHTML("beforeend", chatbotHTML);


        const toggle = document.getElementById("chatbot-toggle");
        const close = document.getElementById("chatbot-close");
        const box = document.getElementById("chatbot-box");
        const form = document.getElementById("chatbot-form");
        const input = document.getElementById("chatbot-input");
        const messages = document.getElementById("chatbot-messages");
        const badge = document.querySelector(".chatbot-badge");


        // Mở chatbot
        toggle.addEventListener("click", function () {

            box.classList.add("active");

            badge.style.display = "none";

            setTimeout(function () {
                input.focus();
            }, 200);

        });


        // Đóng chatbot
        close.addEventListener("click", function () {

            box.classList.remove("active");

        });


        // Gửi tin nhắn
        form.addEventListener("submit", function (event) {

            event.preventDefault();

            const message = input.value.trim();

            if (!message) return;

            sendUserMessage(message);

            input.value = "";

        });


        // Câu hỏi nhanh
        document.querySelectorAll(".chatbot-quick button")
            .forEach(function (button) {

                button.addEventListener("click", function () {

                    const question = button.dataset.question;

                    sendUserMessage(question);

                });

            });


        // Thêm tin nhắn người dùng
        function sendUserMessage(message) {

            addMessage(message, "user");

            // Hiện trạng thái đang suy nghĩ
            showTyping();

            /*
             * Tạm thời chatbot trả lời bằng hệ thống hỗ trợ
             * Sau bước này chúng ta sẽ kết nối AI thật.
             */
            setTimeout(function () {

                removeTyping();

                const answer = getBotAnswer(message);

                addMessage(answer, "bot");

            }, 700);

        }


        // Thêm tin nhắn
        function addMessage(message, type) {

            const messageElement = document.createElement("div");

            messageElement.className =
                "chatbot-message " + type;


            if (type === "bot") {

                messageElement.innerHTML = `
                    <div class="message-avatar">🤖</div>

                    <div class="message-content">
                        ${message}
                    </div>
                `;

            } else {

                messageElement.innerHTML = `
                    <div class="message-content">
                        ${message}
                    </div>
                `;

            }


            messages.appendChild(messageElement);

            messages.scrollTop = messages.scrollHeight;

        }


        // Hiệu ứng đang nhập
        function showTyping() {

            const typing = document.createElement("div");

            typing.id = "chatbot-typing";

            typing.innerHTML = `
                <div class="message-avatar">🤖</div>

                <div class="typing-content">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;

            messages.appendChild(typing);

            messages.scrollTop = messages.scrollHeight;

        }


        function removeTyping() {

            const typing =
                document.getElementById("chatbot-typing");

            if (typing) {
                typing.remove();
            }

        }


        // ========================================
        // HỆ THỐNG TRẢ LỜI TẠM THỜI
        // ========================================

        function getBotAnswer(message) {

            const text = message.toLowerCase();


            if (
                text.includes("tư vấn") ||
                text.includes("điện thoại nào") ||
                text.includes("mua điện thoại")
            ) {

                return `
                    📱 Mình có thể giúp bạn chọn điện thoại phù hợp!<br><br>
                    Bạn hãy cho mình biết <strong>ngân sách</strong>
                    của bạn, ví dụ: <strong>5 triệu, 10 triệu,
                    15 triệu...</strong>
                `;

            }


            if (
                text.includes("giá rẻ") ||
                text.includes("rẻ") ||
                text.includes("ngân sách")
            ) {

                return `
                    💰 Bạn cho mình biết ngân sách tối đa nhé.
                    <br><br>
                    Ví dụ: <strong>"Tôi có 10 triệu"</strong>.
                    <br>
                    Mình sẽ giúp bạn tìm sản phẩm phù hợp.
                `;

            }


            if (
                text.includes("đơn hàng") ||
                text.includes("đặt hàng") ||
                text.includes("order")
            ) {

                return `
                    📦 Bạn có thể kiểm tra đơn hàng tại
                    <strong>Trang đơn hàng</strong> của Mobile Store.
                    <br><br>
                    Nếu bạn muốn hỏi về một đơn cụ thể,
                    hãy cung cấp <strong>mã đơn hàng</strong>.
                `;

            }


            if (
                text.includes("thanh toán") ||
                text.includes("payment")
            ) {

                return `
                    💳 Mobile Store hỗ trợ nhiều phương thức
                    thanh toán như:
                    <br><br>
                    💵 Thanh toán khi nhận hàng
                    <br>🏦 Chuyển khoản ngân hàng
                    <br>📱 Ví điện tử
                `;

            }


            if (
                text.includes("giao hàng") ||
                text.includes("ship") ||
                text.includes("vận chuyển")
            ) {

                return `
                    🚚 Mobile Store hỗ trợ giao hàng đến địa chỉ
                    khách hàng cung cấp khi đặt hàng.
                    <br><br>
                    Bạn hãy nhập chính xác địa chỉ và số điện thoại
                    khi đặt hàng nhé!
                `;

            }


            if (
                text.includes("bảo hành") ||
                text.includes("bảo trì")
            ) {

                return `
                    🛠️ Về chính sách bảo hành, bạn có thể liên hệ
                    với bộ phận chăm sóc khách hàng của Mobile Store
                    để được hỗ trợ chi tiết.
                `;

            }


            if (
                text.includes("xin chào") ||
                text.includes("hello") ||
                text.includes("chào")
            ) {

                return `
                    Xin chào bạn! 👋<br><br>
                    Bạn đang cần mình hỗ trợ vấn đề gì?
                    <br>
                    📱 Tư vấn điện thoại
                    <br>
                    💰 Tìm sản phẩm theo giá
                    <br>
                    📦 Kiểm tra đơn hàng
                `;

            }


            return `
                🤖 Mình chưa hiểu chính xác câu hỏi của bạn.
                <br><br>
                Bạn có thể hỏi mình về:
                <br>📱 Sản phẩm
                <br>💰 Giá điện thoại
                <br>📦 Đơn hàng
                <br>💳 Thanh toán
                <br>🚚 Giao hàng
                <br>🛠️ Bảo hành
            `;

        }

    }


    // Khởi động
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initChatbot
        );

    } else {

        initChatbot();

    }

})();