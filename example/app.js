'use strict';

var koa = require('koa');
var xload = require('..');

var app = koa();

// 配置api
app.use(xload(app, {
  path: './data',
  upload: {
    /*
        encoding: 'utf-8',
        maxFieldsSize: 2 * 1024 * 1024,
        maxFields: 1000*/
  },
  download: {

  }
}));

app.use(function*() {
  let data;

  // 数据请求
  if (this.path == '/download') {
    yield this.download('1.pic.jpg');
    return;
  } else if (this.path == '/upload') {
    this.body = yield this.upload();
    return;
  }


  this.body = '' +
    '<form action="/upload" enctype="multipart/form-data" method="post">' +
    '<input type="text" name="title"><br>' +
    '<input type="file" name="upload1" multiple="multiple"><br>' +
    '<input type="file" name="upload2" multiple="multiple"><br>' +
    '<input type="submit" value="Upload">' +
    '</form>';
});

app.listen(3000, function() {
  console.log('Listening on 3000!');
});
