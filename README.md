# gulp-webpack

> 集成[Gulp](https://github.com/gulpjs/ "Gulp")，[webpack](https://github.com/webpack/webpack "webpack")，[bower](https://github.com/bower/bower "bower")的前端工作流；
> 
> 目录结构：
> 
- node_modules >> **npm install 生成**
- .tmp >> **备份目录(中间层)**
- dist >> **打包生成目**
	- fonts >> **文字目录**
	- images >> **图片目录**
	- scripts >> **脚本目录**
	- sprite >> **合并的雪碧图sprite**
	- styles >> **样式目录**
	- views xxx.html >> **html模板**
- src 开发目录(源文件)
	- bower_components >> **bower install 生成 第三方插件依赖**
	- fonts >> **文字目录**
	- images >> **图片目录**
	- scripts >> **脚本目录**
	- slice >> **需要合并的雪碧图sprite**
	- styles >> **样式目录**
	- videos >> **媒体文件目录**
	- views xxx.html >> **html模板**
- .bowerrc
- .gitignore
- bower.json
- gulpfile.js
- package.json
- webpack.config.js
- README.md


## gulp

### 安装 npm install -g gulp
- gulp dev开发环境 
- gulp 发布打包

## webpack 

### 安装 npm install -g webpack
- 已集成于gulp

## bower

### 安装 npm install -g bower
- 安装第三方依赖
- eg: bower install jQuery#1.11.2 --save-dev

### useref build 合并文件

    <!-- build:css ../styles/default.css -->
    <link rel="stylesheet" href="bower_components/swiper/dist/idangerous.swiper.css">
    <!-- endbuild -->
    
    <!-- build:css ../styles/common.css -->
    <link rel="stylesheet" type="text/css" href="styles/common.css">
    <link rel="stylesheet" type="text/css" href="styles/detail.css">
    <!-- endbuild -->