"use strict";

var _tools = require("./tools.js");

const handleFilesWrapper = files => {
  (0, _tools.handleFiles)(files).then(() => {
    location.reload();
  });
};

(0, _tools.docReady)(async () => {
  document.querySelector("h3").innerText = location.pathname.substring(1);
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });
  ['dragenter', 'dragover'].forEach(eventName => {
    document.body.addEventListener(eventName, () => {
      document.body.classList.add('highlight');
    }, false);
  });
  ['dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, () => {
      document.body.classList.remove('highlight');
    }, false);
  });
  document.body.addEventListener('drop', (_ref) => {
    let {
      dataTransfer
    } = _ref;
    const {
      files
    } = dataTransfer;
    handleFilesWrapper(files);
  }, false);
  const list = await (0, _tools.loadData)();
  list.map((_ref2) => {
    let {
      id,
      image
    } = _ref2;
    const li = document.createElement("li");
    li.id = id;
    li.setAttribute("data-image", image.medium);
    li.setAttribute("data-image-fullsize", image.fullsize);
    li.addEventListener("hasToBeDisplayed", displayPicture, false);
    li.addEventListener("hasToBeErrored", errorPicture, false);
    document.querySelector("ul#imageList").appendChild(li);
    hasToDiplayPicture(li);
  });
  window.addEventListener("scroll", hasToDiplayPictures, false);
  window.addEventListener("resize", hasToDiplayPictures, false);
});

const hasToDiplayPictures = () => {
  [...document.querySelectorAll("ul#imageList li[data-image]:not(data-image-loading)")].map(item => hasToDiplayPicture(item));
};

const hasToDiplayPicture = item => {
  if ((0, _tools.isVisible)(item)) {
    const img = new Image();

    img.onload = () => item.dispatchEvent(new Event("hasToBeDisplayed"));

    img.onerror = () => item.dispatchEvent(new Event("hasToBeErrored"));

    img.src = item.getAttribute("data-image");
    item.setAttribute("data-image-loading", true);
  }
};

const errorPicture = (_ref3) => {
  var _target$parentElement;

  let {
    target
  } = _ref3;
  (_target$parentElement = target.parentElement) === null || _target$parentElement === void 0 ? void 0 : _target$parentElement.removeChild(target);
  hasToDiplayPictures();
};

const displayPicture = (_ref4) => {
  let {
    target
  } = _ref4;
  target.removeEventListener("hasToBeDisplayed", displayPicture, false);
  target.removeEventListener("hasToBeErrored", errorPicture, false);
  target.style.backgroundImage = "url(".concat(target.getAttribute("data-image"), ")");
  target.removeAttribute("data-image");
  target.removeAttribute("data-image-loading");
};