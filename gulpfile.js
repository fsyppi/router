/**
 * GulpFile.js 
 * Собирает приложение "Router".
 * 
 * Плагины:
 * gulp-include - Подключает файлы (классы).
 * gulp-rename - Переименовывает файлы.
 * gulp-uglify-es - Компрессор кода.
 * browser-sync - Автообновление страницы в браузере.
 */
let gulp = require("gulp"),
	include = require("gulp-include"),
	rename = require("gulp-rename"),
	uglify = require("gulp-uglify-es").default,
	
	browserSync = require("browser-sync").create(),
	reload = browserSync.reload,
	
	/** Имя проекта в dist. */
	fileName = "router.js",
	
	/** Пути. */
	paths = {
		js: {
			src: "src/js/main.js",
			dist: "dist/js/"
		},
		html: {
			src: "src/index.html",
			dist: "dist/"
		},
		css: {
			src: "src/css/*.css",
			dist: "dist/css"
		},
		watch: {
			js: "src/js/**/*.js"
		}
	};

/**
 * Задача "include". Работает с JS. 
 * Подключает классы к файлу проекта (main.js). Переименовывает файл main.js в <fileName> - (имя проекта) и копирует в dist. 
 * Минимизирует код, переименовывает, копирует в dist.
 */
gulp.task("include", function () {
	return gulp.src(paths.js.src)
		.pipe(include())
		.pipe(rename(fileName))
		.pipe(gulp.dest(paths.js.dist))
		.pipe(uglify())
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest(paths.js.dist));
});

/**
 * Задача "copyHTML". Работает с HTML.
 * Просто копирует index.html в dist.
 */
gulp.task("copyHTML", function () {
	return gulp.src(paths.html.src)
		.pipe(gulp.dest(paths.html.dist));
});

/**
 * Задача "copyCSS". Работает с CSS.
 * Копирует стили в dist.
 */
gulp.task("copyCSS", function () {
	return gulp.src(paths.css.src)
		.pipe(gulp.dest(paths.css.dist))
		.pipe(browserSync.stream());
});

/**
 * Задача "Watсh".
 * Регистрирует объекты наблюдения.
 */
gulp.task("watch", function () {
	gulp.watch(paths.watch.js, ["include"]).on("change", reload);
	gulp.watch(paths.html.src, ["copyHTML"]).on("change", reload);
	gulp.watch(paths.css.src, ["copyCSS"]);
});

/**
 * Задача "browserSync".
 * Автообновление страницы в браузере.
 */
gulp.task("browserSync", function() {
    browserSync.init({
        server: "dist/"
    });
});

/**
 * Задача "default".
 * Запускает задачи.
 */
gulp.task("default", ["include", "copyHTML", "copyCSS", "watch", "browserSync"]);