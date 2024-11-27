// 從 Cookie 顯示資料的方法
function getFromCookie() {
    // 解析 Cookie 字符串
    const cookies = document.cookie.split("; ");
    const userCookie = cookies.find(cookie => cookie.startsWith("userData="));

    if (!userCookie) {
        console.log("No user data found in cookie.");
        return null;
    }

    // 解碼並解析 JSON
    const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    console.log("Data retrieved from cookie:", userData);
    return userData;
}
(async () => {
    $('.main__content').load(`view_page/info.html`, function (response, status, xhr) {
        if (status == "error") {
            $('.main__content').html("<p>無法載入內容，請稍後再試。</p>");
        } else {
            let userData = getFromCookie();
            if (!userData || !userData.uid) window.location.href = '/404.html';
            $(".main__input.name").val(userData.displayName);
            $(".main__avatar--overlay").text(userData.displayName)
            // 假設 userData.lastLoginTime 是 UTC 時間
            const lastLoginTimeUTC = userData.lastLoginTime;
            // 創建一個 Date 對象
            const lastLoginDate = new Date(lastLoginTimeUTC);
            // 轉換為本地時區的時間格式（可以根據需求格式化）
            const localLastLoginTime = lastLoginDate.toLocaleString();  // 使用本地化的時間格式
            // 輸出到指定的 input 元素
            $(".main__input.login_time").val(localLastLoginTime);
            $(".main__avatar").css("background-image", `url(${userData.photoURL})`);
            $(".sidebar__header p").text(userData.displayName)
            $(".sidebar__avatar").attr("src", `${userData.photoURL}`);
            $(".sidebar__header p").text(userData.displayName)
            $(".main__input.email").val(userData.email);
            console.log(userData);
        }
    });
})()
$(".sidebar__menu-item").on('click', function () {
    $('.sidebar__menu-item').removeClass('sidebar__menu-item--active');
    $(this).addClass('sidebar__menu-item--active');
    $('.main__header h2').text($(this).text());

    // 動態載入對應的 .html 文件
    const pageName = $(this).data('page'); // 假設你有一個 data-page 屬性儲存要載入的頁面名稱
    $('.main__content').load(`view_page/${pageName}.html?timestamp=${new Date().getTime()}`, function (response, status, xhr) {
        if (status === "error") {
            $('.main__content').html("<p>無法載入內容，請稍後再試。</p>");
        }
    });
    
})