'use strict';

const util = require('util');

const formidable = require('./lib/co-formidable');
const sendfile = require('./lib/sendfile');

/**
 * 
 * @param  {string} app     context
 * @param  {object} options 配置项
 *         {object} options.api api配置项，例如local对应http://localhost:3000，则为：api:{local:'http://localhost:3000'}
 * @return {function}
 */
function xload(app, options) {

  let path = options.path || './data';

  return function*(next) {
    if (this.download) return yield next

    let ctx = this;
    let req = ctx.req;
    let res = ctx.res;

    Object.assign(this, {
      upload: function*(opt) {
        // 注入配置项
        let config = Object.assign({
          uploadDir: path,
          encoding: 'utf-8',
          maxFieldsSize: 2 * 1024 * 1024,
          maxFields: 1000,
          keepExtensions: true
        }, options.upload, opt);

        // 执行上传
        return yield formidable(req, config);
      },
      download: function*(filename, opt) {
        // 注入配置项
        let config = Object.assign({
          downloadDir: path,
        }, options.upload, opt);

        let userAgent = (this.get('user-agent') || '').toLowerCase();

        // 更新Content-Disposition
        if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
          this.set('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
        } else if (userAgent.indexOf('firefox') >= 0) {
          this.set('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename) + '"');
        } else {
          this.set('Content-Disposition', 'attachment; filename=' + new Buffer(filename).toString('binary'));
        }

        return yield sendfile(this, filename, config);
      }
    });

    yield next;
  };
}

module.exports = xload;
