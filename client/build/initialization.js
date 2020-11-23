"use strict";

var _tools = require("./tools.js");

(0, _tools.docReady)(() => {
  document.querySelector("form input[type=hidden]").value = location.pathname.substring(1);
  ['submit'].forEach(eventName => {
    document.querySelector("form").addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();
    }, false);
  });
  document.querySelector("form").addEventListener("submit", event => (0, _tools.submitInit)(event).then(() => location.reload()), false);
});