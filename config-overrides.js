const path = require('path');

module.exports = {
    paths: function (paths, env) {
        paths.appBuild = path.resolve(__dirname, 'dist'); // เปลี่ยน dest ได้ที่นี่
        return paths;
    },
};