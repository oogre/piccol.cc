#!/usr/bin/env node

/*----------------------------------------*\
  readWiki - main.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2020-10-26 14:15:32
  @Last Modified time: 2020-11-24 00:11:32
\*----------------------------------------*/
"use strict";

require("core-js/modules/es6.regexp.to-string");

var _oauth = require("oauth");

var _tumblrwks = _interopRequireDefault(require("tumblrwks"));

var _fs = _interopRequireDefault(require("fs"));

var _imgbbjs = _interopRequireDefault(require("imgbbjs"));

var _express = _interopRequireDefault(require("express"));

var _expressFileupload = _interopRequireDefault(require("express-fileupload"));

var _util = require("util");

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const exists = (0, _util.promisify)(_fs.default.exists);
const writeFile = (0, _util.promisify)(_fs.default.writeFile);
const readFile = (0, _util.promisify)(_fs.default.readFile);
const readDir = (0, _util.promisify)(_fs.default.readdir);
const mkdir = (0, _util.promisify)(_fs.default.mkdir);
const app = (0, _express.default)();
app.use(_bodyParser.default.json());
app.use((0, _expressFileupload.default)());
app.use(_bodyParser.default.urlencoded({
  extended: true
}));
app.use(_express.default.static("client"));
console.log(process.env.PWD);
const APIEntries = [{
  route: "/favicon.ico",
  type: "GET",
  action: async (req, res) => {}
}, {
  route: "/",
  type: "GET",
  action: async (req, res) => res.sendFile("".concat(process.env.PWD, "/client/ui/index.html"))
}, {
  route: "/init",
  type: "POST",
  action: async (_ref, res) => {
    let {
      body
    } = _ref;
    const {
      boardName,
      imgbbKey
    } = body;

    if (APIEntries.map((_ref2) => {
      let {
        route
      } = _ref2;
      return route.substr(1);
    }).includes(boardName)) {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false
      }));
    }

    const isBoardExist = await exists("".concat(process.env.PWD, "/boards/").concat(boardName));

    if (isBoardExist) {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false
      }));
    }

    const imgbb = new _imgbbjs.default({
      key: imgbbKey
    });
    const photo = await readFile("".concat(process.env.PWD, "/public/test.jpg"), "base64");
    const {
      success
    } = await imgbb.upload(photo, null, 60);

    if (success) {
      await mkdir("".concat(process.env.PWD, "/boards/").concat(boardName));
      await writeFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/imgbbKey"), imgbbKey);
      await writeFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/content.json"), JSON.stringify([]));
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true
      }));
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false
    }));
  }
}, {
  route: '/list',
  type: "GET",
  action: async (req, res) => {
    const rawContent = await readDir("".concat(process.env.PWD, "/boards"));
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      content: rawContent
    }));
  }
}, {
  route: '/add',
  type: "POST",
  action: async (req, res) => {
    const {
      files
    } = req;
    const {
      boardName
    } = req.body;
    const imgbb = new _imgbbjs.default({
      key: await readFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/imgbbKey"))
    });
    const data = await imgbb.upload(files.file.data.toString('base64'), null);

    if (data.success) {
      const rawContent = await readFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/content.json"));
      const content = JSON.parse(rawContent) || [];
      content.unshift(data);
      await writeFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/content.json"), JSON.stringify(content, null, '\t'));
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true
      }));
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false
    }));
  }
}, {
  route: '/remove',
  type: "POST",
  action: async (_ref3, res) => {
    let {
      body
    } = _ref3;
    const {
      id,
      boardName
    } = body;
    const rawContent = await readFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/content.json"));
    const content = JSON.parse(rawContent) || [];
    const elementId = content.findIndex((_ref4) => {
      let {
        data
      } = _ref4;
      return data.id === id;
    });

    if (elementId > -1) {
      content.splice(elementId, 1);
      await writeFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/content.json"), JSON.stringify(content, null, '\t'));
      const {
        delete_url
      } = content.find((_ref5) => {
        let {
          data
        } = _ref5;
        return data.id === id;
      }).data;
      (0, _nodeFetch.default)(delete_url).catch(error => console.log(error));
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true
    }));
  }
}, {
  route: '/content',
  type: "GET",
  action: async (_ref6, res) => {
    let {
      query
    } = _ref6;
    const {
      boardName
    } = query;
    const isBoardExist = await exists("".concat(process.env.PWD, "/boards/").concat(boardName));

    if (isBoardExist) {
      const rawContent = await readFile("".concat(process.env.PWD, "/boards/").concat(boardName, "/content.json"));
      const content = JSON.parse(rawContent);

      if (content) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          content: content.map((_ref7) => {
            var _data$medium;

            let {
              data
            } = _ref7;
            return {
              id: data.id,
              image: {
                fullSize: data.image.url,
                medium: ((_data$medium = data.medium) === null || _data$medium === void 0 ? void 0 : _data$medium.url) || data.image.url
              }
            };
          })
        }));
      }
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false
    }));
  }
}, {
  route: '/:boardName',
  type: "GET",
  action: async (_ref8, res) => {
    let {
      params
    } = _ref8;
    const {
      boardName
    } = params;
    const isBoardExist = await exists("".concat(process.env.PWD, "/boards/").concat(boardName));

    if (isBoardExist) {
      res.sendFile("".concat(process.env.PWD, "/client/ui/board.html"));
    } else {
      res.sendFile("".concat(process.env.PWD, "/client/ui/initialization.html"));
    }
  }
}];
APIEntries.map((_ref9) => {
  let {
    route,
    type,
    action
  } = _ref9;

  if (type === "POST") {
    app.post(route, action);
  } else if (type === "GET") {
    app.get(route, action);
  }
});
app.listen(3000);