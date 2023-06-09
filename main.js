// form要素とtodoリストのコンテナ要素を取得
const formElement = document.querySelector("#todo-form");
const taskContainer = document.querySelector("#todo-items");

// addTask関数を定義
const addTask = (event) => {
  event.preventDefault();
  const inputElement = document.querySelector("#todo-input");
  const taskElement = document.createElement("li");
  taskElement.className = "todo__item";
  taskElement.innerHTML = `<input class="todo__checkbox" type="checkbox">${inputElement.value}</li>`;
  taskContainer.appendChild(taskElement);
  inputElement.value = "";
};

// formを送信した時のイベントを設定
formElement.addEventListener("submit", addTask);

// todo(li要素)がクリックされたときのイベントを設定
taskContainer.addEventListener("click", (event) => {
  if (event.target.matches(".todo__item")) {
    event.target.classList.toggle("checked");
  }
});
