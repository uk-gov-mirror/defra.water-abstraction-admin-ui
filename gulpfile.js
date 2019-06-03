const gulp = require('gulp');
const del = require('del');
const replace = require('gulp-replace');

const paths = {
  public: 'public/',
  govukModules: 'govuk_modules/'
};

gulp.task('clean', () => {
  return del([paths.public, paths.govukModules]);
});

// Copy govuk files

gulp.task('copy-govuk-toolkit', function () {
  return gulp.src(['node_modules/govuk_frontend_toolkit/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_frontend_toolkit/'));
});

gulp.task('copy-govuk-template', function () {
  return gulp.src(['node_modules/govuk_template_mustache/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_template_mustache/'));
});

gulp.task('copy-govuk-elements-sass', function () {
  return gulp.src(['node_modules/govuk-elements-sass/public/sass/**'])
    .pipe(gulp.dest(paths.govukModules + '/govuk-elements-sass/'));
});

gulp.task('copy-govuk-files', gulp.series(
  'copy-govuk-toolkit',
  'copy-govuk-template',
  'copy-govuk-elements-sass',
  done => done()
));

// Install the govuk files into our application

gulp.task('copy-template-assets', () => {
  return gulp
    .src(paths.govukModules + '/govuk_template_mustache/assets/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*}')
    .pipe(gulp.dest(paths.public));
});

gulp.task('copy-frontend-toolkit-assets', () => {
  return gulp
    .src(paths.govukModules + '/govuk_frontend_toolkit/{images/**/*.*,javascripts/**/*.*}')
    .pipe(gulp.dest(paths.public));
});

gulp.task('copy-template-view', function () {
  return gulp
    .src('node_modules/govuk_template_mustache/views/**/*.*')
    .pipe(gulp.dest('views/govuk_template_mustache'));
});

gulp.task('install-govuk-files', gulp.series(
  'copy-template-assets',
  'copy-template-view',
  'copy-frontend-toolkit-assets',
  done => done()
));

gulp.task('copy-static-assets', () => {
  // copy images and javascript to public
  return gulp
    .src('src/public/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*}')
    .pipe(replace('/public/images/', '/public/admin/images/'))
    .pipe(gulp.dest(paths.public));
});

gulp.task('build', gulp.series(
  'clean',
  'copy-govuk-files',
  'install-govuk-files',
  'copy-static-assets',
  done => done()
));

// Default task
gulp.task('default', gulp.series('build'));
