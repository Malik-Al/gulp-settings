const {src, dest} = require('gulp')
const gulp = require('gulp')
const browsersync = require('browser-sync').create();
const include = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');


const project_folder = 'dist';
const source_folder = 'src';


const path = {
    build: {
        html: `${project_folder}/`,
        css: `${project_folder}/css/`,
        js: `${project_folder}/js/`,
        img: `${project_folder}/img/`,
        font: `${project_folder}/font`
    },
    src: {
        html: [`${source_folder}/*.html`, '!'+`${source_folder}/_*.html`],
        css: `${source_folder}/scss/style.scss`,
        js: `${source_folder}/js/script.js`,
        img: `${source_folder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
        font: `${source_folder}/font/**/*.{eot,ttf,otf,otc,ttc,woff,woff,woff2,svg}`
    },
    watch: {
        html: `${source_folder}/**/*.html`,
        css: `${source_folder}/scss/**/*.scss`,
        js: `${source_folder}/js/**/*.js`,
        img: `${source_folder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
        font: `${source_folder}/font/**/*.{eot,ttf,otf,otc,ttc,woff,woff,woff2,svg}`

    },
    clean: `./${project_folder}/`
}

function browserSync(){
    browsersync.init({
        server: {
            baseDir: `./${project_folder}/`
        },
        port: 3000,
        notify: false
    })
}

function html(){
    return src(path.src.html)
        .pipe(include())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css(){
    return src(path.src.css)
        .pipe(scss({
            outputStyle: 'expanded'
        }))
        .pipe(group_media())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js(){
    return src(path.src.js)
        .pipe(include())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images(){
    return src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function font(){
    return src(path.src.font)
        .pipe(dest(path.build.font))
        .pipe(fonter({
            formats: ['ttf','woff', 'eot', 'svg']
        }))
        .pipe(dest(path.build.font))
        .pipe(ttf2woff2())
        .pipe(dest(path.build.font))
        .pipe(browsersync.stream())
}

function watchFiles(){
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.font], font);
}

function clean(){
    return del(path.clean)
}

const build = gulp.series(clean, gulp.parallel(js, css, html, images, font))
const watch = gulp.parallel(build, watchFiles, browserSync);


exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;