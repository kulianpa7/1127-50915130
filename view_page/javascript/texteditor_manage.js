// Firebase 初始化設定
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAv3DXVCQSlKRtWbHptoMyB7CMbtnWueTk",
    authDomain: "okok-44e11.firebaseapp.com",
    projectId: "okok-44e11",
    databaseURL: "https://okok-44e11-default-rtdb.asia-southeast1.firebasedatabase.app/",
    storageBucket: "okok-44e11.firebasestorage.app",
    messagingSenderId: "802160967963",
    appId: "1:802160967963:web:65c99065ddef3c749713be",
    measurementId: "G-MY47KBCFXW"
};
// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let scoresRef;

const loading = () => {
    const userData = getFromCookie();
    scoresRef = ref(database, `name_email/${userData.uid}`);

    // 先移除舊的監聽器以防止重複監聽
    onValue(scoresRef, () => { }, { onlyOnce: true });

    onValue(scoresRef, (snapshot) => {
        $('#data-table').empty();
        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const data = childSnapshot.val();
            $('#data-table').append(`
                <tr>
                    <td><input type="checkbox" data-key="${key}" class="select-item"></td>
                    <td>${data.name}</td>
                    <td>${data.email}</td>
                </tr>
            `);
        });
    });
};
$(document).ready(function () {
    console.log("ININ");
    loading(); // 初始化時載入資料
    let editingRow = null;
    // 全選/取消全選
    $('#select-all').on('change', function () {
        $('.select-item').prop('checked', this.checked);
        toggleButtons();
    });

    // 單選項目切換
    $(document).on('change', '.select-item', function () {
        toggleButtons();
        $('#select-all').prop('checked', $('.select-item').length === $('.select-item:checked').length);
    });

    // 新增按鈕
    $('#btn-add').on('click', function () {
        editingRow = null;
        $('#crudModal').data('key',"");
        $('#crudForm')[0].reset();
        $('#crudModalLabel').text('新增項目');
        $('#crudModal').modal('show');
    });

    // 編輯按鈕
    $('#btn-edit').on('click', function () {
        // 確保只選擇了單一項目
        const selectedItems = $('.select-item:checked');
        if (selectedItems.length !== 1) {
            alert('請選擇一個項目進行編輯');
            return;
        }

        // 取得選中行的資料
        editingRow = selectedItems.closest('tr');
        const key = selectedItems.data('key'); // 取得選中項目的 key
        const name = editingRow.find('td:eq(1)').text();
        const email = editingRow.find('td:eq(2)').text();

        // 顯示資料在模態框中
        $('#name').val(name);
        $('#email').val(email);
        $('#crudModalLabel').text('編輯項目');

        // 保存 key，以便在儲存資料時使用
        $('#crudModal').data('key', key);

        // 顯示模態框
        $('#crudModal').modal('show');
    });

    // 儲存按鈕
    $('#save-btn').on('click', async function () {
        const name = $('#name').val();
        const email = $('#email').val();
        const userData = getFromCookie();
        const key = $('#crudModal').data('key');  // 取得編輯項目的 key
        const scoresRef = ref(database, `name_email/${userData.uid}${key?`/${key}`:""}`);
        if(key){
            await set(scoresRef, {
                name: name,
                email: email
            });
        }else{
            const newScoreRef = push(scoresRef);
            await set(newScoreRef, {
                name: name,
                email: email
            });
        }

        loading();
        $('#crudModal').modal('hide');
    });

    // 刪除按鈕
    $('#btn-delete').on('click', function () {
        const userData = getFromCookie();
        $('.select-item:checked').each(function () {
            const key = $(this).data('key'); // 取得選中項目的 key
            const dataRef = ref(database, `name_email/${userData.uid}/${key}`); // 指定節點路徑
            remove(dataRef)
                .then(() => {
                    $(this).closest('tr').remove(); // 從 DOM 中移除該行
                    console.log("刪除成功，Key:", key);
                })
                .catch((error) => {
                    console.error("刪除失敗：", error);
                });
        });
        toggleButtons();
    });

    // 切換按鈕狀態
    function toggleButtons() {
        const selectedCount = $('.select-item:checked').length;
        $('#btn-edit').prop('disabled', selectedCount !== 1);
        $('#btn-delete').prop('disabled', selectedCount === 0);
    }
});