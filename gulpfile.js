var os = require('os'),
	gulp = require('gulp'),							// 基础库
	gulpif = require('gulp-if'),					// if
	gutil = require('gulp-util'),					// util
	// < --- styles --- >
	sass = require('gulp-sass'),					// sass >> css预编译
	cssmin = require('gulp-minify-css'),			// minifycss >> css压缩
	cssnano = require('gulp-cssnano'),				// cssnano >> 压缩样式
	// uncss = require('gulp-uncss'),					// uncss >> 清除未使用的css
	autoprefixer = require('gulp-autoprefixer'),	// autoprefixer >> 补全浏览器前缀
	// < --- scripts --- >
	jshint = require('gulp-jshint'),				// jshint >> js代码检查
	uglify = require('gulp-uglify'),				// uglify >> js压缩
	// < --- images --- >
	imagemin = require('gulp-imagemin'),			// imagemin >> 图片压缩
	lazyImageCSS = require('gulp-lazyimagecss'),	// 自动为图片样式添加 宽/高/background-size 属性
	tmtsprite = require('gulp-tmtsprite'),			// 雪碧图合并
	// < --- html --- >
	htmlmin = require('gulp-htmlmin'),				// html >> 文档压缩
	// < --- all --- >
	rename = require('gulp-rename'),				// rename >> 重命名
	revAll = require('gulp-rev-all'),  				// reversion 重命名
	revDel = require('gulp-rev-delete-original'),	// 删除重命名原始文件
	useref = require('gulp-useref'),				// useref >> 合并html里面的js/css
	fileinclude = require('gulp-file-include'),		// fileinclude >> include文件
	// < --- other --- >
	cache = require('gulp-cache'),					// 
	concat = require('gulp-concat'),				// concat >> 文件合并
	clean = require('gulp-clean'),					// clean >> 清空
	connect = require('gulp-connect'),				// connect >> 创建本地服务器
	notify = require('gulp-notify'),				// notify >> 桌面提示、通知
	open = require('gulp-open'),
	wiredep = require('wiredep').stream,			// bower wiredep 
	// < --- webpack --- >
	webpack = require('webpack'),					// webpack
	webpackConfig = require('./webpack.config.js');	// webpack.config

// dir ../src ../.tmp ../dist
var SRC_DIR = './src/';
var TMP_DIR = './.tmp/';
var DIST_DIR = './dist/';

// host
var _host = {
    path: 'dist',
    port: 3000,
    html: 'index.html'
};

// mac chrome: "Google chrome", 
var _browser = os.platform() === 'linux' ? 'Google chrome' : (
	os.platform() === 'darwin' ? 'Google chrome' : (
	os.platform() === 'win32' ? 'chrome' : 'firefox'));

/*
 * 合并请求
 * <!-- build:css ../styles/index.pkg.css --><!-- endbuild -->
 * <!-- build:js ../scripts/index.pkg.js --><!-- endbuild -->
 */
gulp.task('html', ['fileinclude'], function() {
    return gulp.src('.tmp/views/**/*.html')
        .pipe( useref( {searchPath: ['.tmp', 'src', '.']} ) )
        .pipe( gulp.dest(DIST_DIR + 'views') )
		.pipe( notify({message: 'Pkg task complete'}) )
		.pipe( connect.reload() );
});

// 用于在html文件中直接include文件
gulp.task('fileinclude', function () {
	return gulp.src([SRC_DIR + 'views/**/*.html'])
		.pipe(fileinclude(
			{
				prefix: '@@',
				basepath: '@file'
			}
		))
		.pipe( gulp.dest(TMP_DIR + 'views') )
		.pipe( notify({message: 'File include task complete'}) )
		.pipe( connect.reload() );
});

// fonts
gulp.task('fonts', function () {
	return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
		.concat(SRC_DIR + 'fonts/**/*'))
		.pipe(gulp.dest(TMP_DIR + 'fonts'))
		.pipe(gulp.dest(DIST_DIR + 'fonts'));
});

// videos
gulp.task('videos', function () {
	return gulp.src(require('main-bower-files')('**/*.{mp4}', function (err) {})
		.concat(SRC_DIR + 'videos/**/*'))
		.pipe(gulp.dest(TMP_DIR + 'videos'))
		.pipe(gulp.dest(DIST_DIR + 'videos'));
});

// images copy
gulp.task('images', function () {
	return gulp.src(SRC_DIR + 'images/**/*.{gif,jpeg,jpg,png}')
		.pipe( gulp.dest(TMP_DIR + 'images') )
		.pipe( notify({message: 'Images task complete'}) )
		.pipe( connect.reload() );
});

// slice copy
gulp.task('slice', function () {
	return gulp.src(SRC_DIR + 'slice/**/*.{gif,jpeg,jpg,png}')
		.pipe( gulp.dest(TMP_DIR + 'slice') )
		.pipe( notify({message: 'Slice task complete'}) )
		.pipe( connect.reload() );
});

// 样式 sass && autoprefixer 自动补全浏览器前缀 && cssmin
gulp.task('styles', function () {
	return gulp.src([SRC_DIR + 'styles/**/*.scss', SRC_DIR + 'styles/**/*.css'])
		.pipe( sass({style: 'expanded'}) )
		.pipe( autoprefixer('> 1%', 'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4') )
		.pipe( gulp.dest(TMP_DIR + 'styles') )
		.pipe( notify({message: 'Styles task complete'}) )
		.pipe( connect.reload() );
});

// 脚本 jshint && uglify
gulp.task('scripts', ['webpack-js'], function () {
	return gulp.src(TMP_DIR + 'scripts/**/*.js')
		.pipe( jshint() )
		.pipe( jshint.reporter('default') )
		.pipe( gulp.dest(TMP_DIR + 'scripts') )
		.pipe( notify({message: 'Scripts task complete'}) )
		.pipe( connect.reload() );
});

// 雪碧图操作，应该先拷贝图片并压缩合并css
gulp.task('sprite', ['slice'], function (done) {
    return gulp.src(TMP_DIR + 'styles/**/*.css')
        .pipe( lazyImageCSS({imagePath: ['../slice']}) )
        .pipe( tmtsprite({margin: 4}) )
        .pipe( gulpif('*.png', gulp.dest(TMP_DIR + 'sprite'), gulp.dest(TMP_DIR + 'styles')) )
		.pipe( notify({message: 'sprite task complete'}) );
});

// min:image
gulp.task('min:images', ['images'], function () {
	return gulp.src(TMP_DIR + 'images/**/*.{gif,jpeg,jpg,png}')
		.pipe( imagemin({optimizationLevel: 3, progressive: true, interlaced: true}) )
		.pipe( gulp.dest(DIST_DIR + 'images') )
		.pipe( notify({message: 'min:images task complete'}) )
		.pipe( connect.reload() );
});

// min:sprite
gulp.task('min:sprite', ['sprite'], function () {
    return gulp.src(TMP_DIR + 'sprite/**/*.{gif,jpeg,jpg,png}')
		.pipe( imagemin({optimizationLevel: 3, progressive: true, interlaced: true}) )
		.pipe( gulp.dest(DIST_DIR + 'sprite') )
		.pipe( notify({message: 'min:sprite task complete'}) )
		.pipe( connect.reload() );
});

// min:css
gulp.task('min:css', ['min:images', 'min:sprite', 'styles'], function () {
    return gulp.src(TMP_DIR + 'styles/*.css')
		.pipe( cssmin() )
		.pipe( gulp.dest(TMP_DIR + 'styles') )
		.pipe( notify({message: 'min:css task complete'}) );
});

// min:js
gulp.task('min:js', ['scripts'], function () {
    return gulp.src(TMP_DIR + 'scripts/**/*.js')
		.pipe( uglify() )
		.pipe( gulp.dest(DIST_DIR + 'scripts') )
		.pipe( notify({message: 'min:js task complete'}) );
});

// copy:css
gulp.task('copy:css', ['min:images', 'min:sprite', 'styles'], function () {
    return gulp.src(TMP_DIR + 'styles/*.css')
		.pipe( gulp.dest(TMP_DIR + 'styles') )
		.pipe( notify({message: 'copy:css task complete'}) );
});

// copy:js
gulp.task('copy:js', ['scripts'], function () {
    return gulp.src([TMP_DIR + 'scripts/**/*.js', TMP_DIR + 'scripts/**/*.map'])
		.pipe( gulp.dest(DIST_DIR + 'scripts') )
		.pipe( notify({message: 'copy:js task complete'}) );
});

// rev-all
gulp.task('rev:all', ['min:css', 'min:js', 'html', 'fonts', 'videos'], function () {
    return gulp.src([DIST_DIR + '**/*'])
	    .pipe(revAll.revision({ dontRenameFile: [/^\/favicon.ico$/g, '.html'] }))
	    .pipe(gulp.dest(DIST_DIR))
	    .pipe(revDel({
            exclude: /(.html|.htm)$/
        }))
        .pipe(gulp.dest(DIST_DIR));
});

// copy:all
gulp.task('copy:all', ['copy:css', 'copy:js', 'html', 'fonts', 'videos'], function () {
    return gulp.src(DIST_DIR + '**/*')
        .pipe(gulp.dest(DIST_DIR));
});

// clean
gulp.task('clean', function () {
	return gulp.src(['.tmp', 'dist'], {read: false})
		.pipe( clean() );
});

// inject bower components 暂无用 功能待定
gulp.task('wiredep', function () {
	gulp.src(SRC_DIR + 'styles/*.scss')
	.pipe(wiredep({
		ignorePath: /^(\.\.\/)+/
	}))
	.pipe(gulp.dest(SRC_DIR + 'styles'));

	gulp.src(SRC_DIR + 'views/*.html')
	.pipe(wiredep({
		exclude: ['bootstrap-sass'],
		ignorePath: /^(\.\.\/)*\.\./
	}))
	.pipe(gulp.dest(SRC_DIR + 'views'));
});

// webpack && webpack-js
var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);
gulp.task('webpack-js', function(callback) {
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError('webpack:webpack-js', err);

        gutil.log('[webpack:webpack-js]', stats.toString({
            colors: true
        }));
        
        callback();
    });
});

// wacth
gulp.task('watch', function () {
	// fonts
  	gulp.watch(SRC_DIR + 'fonts/**/*', ['fonts']);

	// images
	gulp.watch(SRC_DIR + 'images/**/*', ['min:images']);

	// sprite
	gulp.watch(SRC_DIR + 'slice/**/*', ['min:sprite']);

	// styles
	gulp.watch(SRC_DIR + 'styles/**/*', ['copy:css']);

	// scripts
	gulp.watch(SRC_DIR + 'scripts/**/*.js', ['copy:js']);

	// fileinclude
	gulp.watch(SRC_DIR + 'views/**/*', ['html']);
});

// connect
gulp.task('connect', function () {
    console.log('connect------------');

    connect.server({
        root: _host.path,
        port: _host.port,
        livereload: true
    });
});

// open
gulp.task('open', function () {
    gulp.src('')
        .pipe(open({
            app: _browser,
            uri: 'http://localhost:3000/views'
        }))
		.pipe( notify({message: 'Open task complete'}) );
});

// default 发布
gulp.task('default', ['clean'], function () {
	gulp.start('connect', 'rev:all', 'open');
});

// dev 开发
gulp.task('dev', ['clean'], function () {
	gulp.start('connect', 'copy:all', 'watch', 'open');
});