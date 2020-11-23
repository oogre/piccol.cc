"use strict";

var _tools = require("./tools.js");

(0, _tools.docReady)(async () => {
  ['submit'].forEach(eventName => {
    document.querySelector("form").addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();
    }, false);
  });
  document.querySelector("form").addEventListener("submit", event => location = event.target.boardName.value, false);
  const boardList = await (0, _tools.listBoard)();
  boardList.map(boardName => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = boardName;
    a.innerText = boardName;
    li.appendChild(a);
    document.querySelector("ul#boardList").appendChild(li);
  });
});