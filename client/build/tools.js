"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isVisible = isVisible;
exports.submitInit = exports.listBoard = exports.loadData = exports.removeFile = exports.uploadFile = exports.handleFiles = exports.docReady = void 0;

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/web.dom.iterable");

/*----------------------------------------*\
  collaborativeImageBoard - tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2020-11-19 12:17:20
  @Last Modified time: 2020-11-20 09:03:08
\*----------------------------------------*/
const docReady = fn => {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

exports.docReady = docReady;

const handleFiles = files => {
  return Promise.all([...files].map(file => uploadFile(file)));
};

exports.handleFiles = handleFiles;

const uploadFile = file => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('boardName', location.pathname.substring(1));
  return fetch('/add', {
    method: 'POST',
    body: formData
  }).then(response => response.json()).then(data => {
    if (!data.success) return new Error();
    return true;
  });
};

exports.uploadFile = uploadFile;

const removeFile = id => {
  const formData = new FormData();
  formData.append('id', id);
  formData.append('boardName', location.pathname.substring(1));
  return fetch('/remove', {
    method: 'POST',
    body: formData
  }).then(response => response.json()).then(data => {
    if (!data.success) return new Error();
    return true;
  });
};

exports.removeFile = removeFile;

const loadData = () => {
  var url = new URL("".concat(location.origin, "/content"));
  url.search = new URLSearchParams({
    boardName: location.pathname.substring(1)
  }).toString();
  return fetch(url).then(response => response.json()).then(data => {
    if (!data.success) return new Error("");
    return data;
  }).then((_ref) => {
    let {
      content
    } = _ref;
    return content;
  });
};

exports.loadData = loadData;

const listBoard = async () => {
  var url = new URL("".concat(location.origin, "/list"));
  return fetch(url).then(response => response.json()).then(data => {
    if (!data.success) return new Error("");
    return data;
  }).then((_ref2) => {
    let {
      content
    } = _ref2;
    return content;
  });
};

exports.listBoard = listBoard;

const submitInit = (_ref3) => {
  let {
    target
  } = _ref3;
  var url = new URL("".concat(location.origin, "/init"));
  return fetch(url, {
    method: 'POST',
    body: new FormData(target)
  }).then(response => response.json()).then(data => {
    if (!data.success) return new Error("");
    return data;
  });
};

exports.submitInit = submitInit;

function isVisible(elem) {
  if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
  const style = getComputedStyle(elem);
  if (style.display === 'none') return false;
  if (style.visibility !== 'visible') return false;
  if (style.opacity < 0.1) return false;

  if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height + elem.getBoundingClientRect().width === 0) {
    return false;
  }

  const elemTopLeft = {
    x: elem.getBoundingClientRect().left,
    y: elem.getBoundingClientRect().top
  };
  if (elemTopLeft.x < 0) return false;
  if (elemTopLeft.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
  if (elemTopLeft.y < 0) return false;
  if (elemTopLeft.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
  let pointContainer = document.elementFromPoint(elemTopLeft.x, elemTopLeft.y);

  do {
    if (pointContainer === elem) return true;
  } while (pointContainer && (pointContainer = pointContainer.parentNode));

  return false;
}