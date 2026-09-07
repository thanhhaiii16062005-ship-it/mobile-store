import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");

    if (!form) return;


    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Kiểm tra mật khẩu
        if (password !== confirmPassword) {

            message.textContent = "Mật khẩu nhập lại không khớp.";
            message.style.color = "red";

            return;
        }


        if (password.length < 6) {

            message.textContent =
                "Mật khẩu phải có ít nhất 6 ký tự.";

            message.style.color = "red";

            return;
        }


        try {

            message.textContent = "Đang tạo tài khoản...";
            message.style.color = "";


            // Tạo tài khoản Firebase Authentication
            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            // Lưu tên người dùng vào Firebase Authentication
            await updateProfile(credential.user, {
                displayName: name
            });


            // Lưu thông tin người dùng vào Firestore
            await setDoc(
                doc(db, "users", credential.user.uid),
                {
                    uid: credential.user.uid,
                    name: name,
                    email: email,
                    role: "customer",
                    createdAt: serverTimestamp()
                }
            );


            message.textContent =
                "Đăng ký thành công! Đang chuyển đến trang đăng nhập...";

            message.style.color = "green";


            form.reset();


            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);


        } catch (error) {

            console.error("Lỗi đăng ký:", error);


            let errorMessage =
                "Đăng ký thất bại. Vui lòng thử lại.";


            if (error.code === "auth/email-already-in-use") {

                errorMessage =
                    "Email này đã được đăng ký.";

            }
            else if (error.code === "auth/invalid-email") {

                errorMessage =
                    "Email không hợp lệ.";

            }
            else if (error.code === "auth/weak-password") {

                errorMessage =
                    "Mật khẩu quá yếu. Hãy dùng ít nhất 6 ký tự.";

            }


            message.textContent = errorMessage;
            message.style.color = "red";

        }

    });

});