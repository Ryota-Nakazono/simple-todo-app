// 1. タスクを表示する関数
// 引数: todoItems(タスクを追加するDOM要素), text(タスクのテキスト), completed(タスクの完了状態)
const displayTodo = (todoItems, text, completed) => {
  // li要素の作成とクラス名の追加
  const todoItem = document.createElement("li");
  todoItem.classList.add("todo__item");

  // タスクが完了している場合、クラス名"checked"を追加
  if (completed) {
    todoItem.classList.add("checked");
  }

  // タスクのHTMLを作成し、li要素の中に挿入
  todoItem.innerHTML = `
    <input class="todo__checkbox" type="checkbox">
    <span class="todo__text">${text}</span>
    <button class="todo__edit">編集</button>
    <button class="todo__delete">削除</button>
  `;

  // li要素をtodoItemsの子要素として追加
  todoItems.appendChild(todoItem);
};

// 2. ローカルストレージからタスクを読み込み、表示する関数
// 引数: todoItems(タスクを追加するDOM要素)
const loadTodo = (todoItems) => {
  // ローカルストレージからタスクを取得
  const todos = JSON.parse(localStorage.getItem("todos")) || [];

  // 取得した各タスクに対して、displayTodo関数を実行
  todos.forEach(({ text, completed }) => {
    displayTodo(todoItems, text, completed);
  });
};

// 3. タスクをローカルストレージに保存する関数
// 引数: todo(保存するタスクオブジェクト)
const saveTodo = (todo) => {
  // ローカルストレージから既存のタスクを取得し、新たなタスクを追加
  const todos = [...(JSON.parse(localStorage.getItem("todos")) || []), todo];

  // タスクをローカルストレージに保存
  localStorage.setItem("todos", JSON.stringify(todos));
};

// 4. 新しいタスクを作成する関数
// 引数: todoItems(タスクを追加するDOM要素), todoInput(タスク入力欄のDOM要素), e(イベントオブジェクト)
const createTodo = (todoItems, todoInput, e) => {
  // フォームのデフォルトの送信動作をキャンセル
  e.preventDefault();

  // ユーザーが入力したテキストを取得し、前後の空白を削除
  const newTodoText = todoInput.value.trim();

  // テキストが空の場合はアラートを表示して処理を終了
  if (!newTodoText) {
    alert("タスクを入力してください");
    return;
  }

  // ローカルストレージのタスクリストを取得
  const todos = JSON.parse(localStorage.getItem("todos")) || [];

  // 同じテキストを持つタスクが存在するかチェック
  const isDuplicate = todos.some((todo) => todo.text === newTodoText);
  if (isDuplicate) {
    // 同じタスクが存在する場合はアラートを表示して処理を終了
    alert("そのタスクは既に存在します");
    return;
  }

  // 新しいタスクオブジェクトを作成
  const todo = {
    text: newTodoText,
    completed: false,
  };

  // 新しいタスクを表示し、ローカルストレージに保存
  displayTodo(todoItems, todo.text, todo.completed);
  saveTodo(todo);

  // タスク入力欄を空にする
  todoInput.value = "";
};

// 5. タスクの編集を行う関数
// 引数: todoItems(タスクを追加するDOM要素), editInput(編集入力欄のDOM要素), formContainer(編集フォームのDOM要素), e(イベントオブジェクト)
const editTodo = (todoItems, editInput, formContainer, e) => {
  // フォームのデフォルトの送信動作をキャンセル
  e.preventDefault();

  // 編集入力欄のテキストを取得
  const { value: newText } = editInput;

  // テキストが空の場合はアラートを表示して処理を終了
  if (!newText) {
    alert("編集内容を入力してください");
    return;
  }

  // 編集対象のタスクのテキストを取得し、新しいテキストで更新
  const currentItem = todoItems.querySelector("[data-editing]");
  const oldText = currentItem.textContent;
  currentItem.textContent = newText;

  // 編集フォームを非表示にする
  formContainer.classList.add("hidden");

  // ローカルストレージのタスクを更新
  updateTodo(oldText, newText, currentItem.classList.contains("checked"));

  // 編集中のタスクのdata-editing属性を削除
  currentItem.removeAttribute("data-editing");
};

// 6. タスクを削除する関数
// 引数: todoItems(タスクを追加するDOM要素), e(イベントオブジェクト)
const deleteTodo = (todoItems, e) => {
  // クリックした要素が削除ボタンでなければ処理を終了
  if (!e.target.classList.contains("todo__delete")) return;

  // フォームのデフォルトの送信動作をキャンセル
  e.preventDefault();

  // 削除するタスクのテキストを取得
  const todoText = e.target.parentElement.querySelector(".todo__text").textContent;

  // タスクをDOMから削除
  e.target.parentElement.remove();

  // ローカルストレージのタスクを削除
  deleteTodoFromLocalStorage(todoText);
};

// 7. タスクのチェック状態を更新する関数
// 引数: e(イベントオブジェクト)
const checkTodo = (e) => {
  // クリックした要素がタスク項目でなければ処理を終了
  if (!e.target.classList.contains("todo__item")) return;

  // フォームのデフォルトの送信動作をキャンセル
  e.preventDefault();

  // タスク項目のチェック状態を切り替える
  const todoItem = e.target;
  todoItem.classList.toggle("checked");

  // タスクのテキストを取得
  const todoText = todoItem.querySelector(".todo__text").textContent;

  // ローカルストレージのタスクを更新
  updateTodo(todoText, todoText, todoItem.classList.contains("checked"));
};

// 8. タスクの編集フォームを表示する関数
// 引数: editInput(編集入力欄のDOM要素), formContainer(編集フォームのDOM要素), e(イベントオブジェクト)
const displayEditForm = (editInput, formContainer, e) => {
  // クリックした要素が編集ボタンでなければ処理を終了
  if (!e.target.classList.contains("todo__edit")) return;

  // フォームのデフォルトの送信動作をキャンセル
  e.preventDefault();

  // 編集対象のタスクを取得
  const currentItem = e.target.parentElement;

  // 編集対象のタスクのテキストを取得し、編集入力欄に設定
  const todo = currentItem.querySelector(".todo__text");

  // 編集中のタスクのdata-editing属性を設定
  todo.dataset.editing = todo.textContent;

  // 編集入力欄に編集対象のタスクのテキストを設定
  editInput.value = todo.textContent;

  // 編集フォームを表示
  formContainer.classList.remove("hidden");

  // 編集入力欄にフォーカスを設定
  editInput.focus();
};

// 9. ローカルストレージのタスクを更新する関数
// 引数: oldText(更新前のタスクのテキスト), newText(更新後のタスクのテキスト), completed(タスクの完了状態)
const updateTodo = (oldText, newText, completed) => {
  // ローカルストレージのタスクを取得し、更新対象のタスクを新しい情報で更新
  const todos = (JSON.parse(localStorage.getItem("todos")) || []).map((todo) =>
    todo.text === oldText ? { text: newText, completed } : todo
  );

  // 更新したタスクリストをローカルストレージに保存
  localStorage.setItem("todos", JSON.stringify(todos));
};

// 10. ローカルストレージからタスクを削除する関数
// 引数: todoText(削除するタスクのテキスト)
const deleteTodoFromLocalStorage = (todoText) => {
  // ローカルストレージのタスクを取得し、削除対象のタスクを削除
  const todos = (JSON.parse(localStorage.getItem("todos")) || []).filter(
    (todo) => todo.text !== todoText
  );

  // 更新したタスクリストをローカルストレージに保存
  localStorage.setItem("todos", JSON.stringify(todos));
};

// 11. イベントハンドラ、イベントリスナーの設定
// 詳細：DOMの読み込みが完了したら、各要素を取得し、イベントハンドラ、イベントリスナーを設定します。
window.addEventListener("DOMContentLoaded", (event) => {
  const todoItems = document.getElementById("todo-items");
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoEditFormContainer = document.getElementById("todo-edit-form-container");
  const todoEditForm = document.getElementById("todo-edit-form");
  const todoEditInput = document.getElementById("todo-edit-input");

  // ローカルストレージからタスクを読み込み、表示
  loadTodo(todoItems);

  // 新規タスクの追加フォームのsubmitイベントに対して、createTodo関数をイベントハンドラとして設定
  todoForm.addEventListener("submit", (e) => createTodo(todoItems, todoInput, e));

  // タスクの編集フォームのsubmitイベントに対して、editTodo関数をイベントハンドラとして設定
  todoEditForm.addEventListener("submit", (e) =>
    editTodo(todoItems, todoEditInput, todoEditFormContainer, e)
  );

  // タスク項目のクリックイベントに対して、deleteTodo、checkTodo、displayEditForm関数をイベントハンドラとして設定
  todoItems.addEventListener("click", (e) => {
    deleteTodo(todoItems, e);
    checkTodo(e);
    displayEditForm(todoEditInput, todoEditFormContainer, e);
  });
});
