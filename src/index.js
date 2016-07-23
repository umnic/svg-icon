require('./style/index.less');
import $ from 'jquery';
require('tabslet');
import {
  saveAs
} from 'file-saver';

const icons = require('json!./data/icons.json');

const $body = $('body');
const $icons = $('#icons');
const $types = $('#icon-types');
const $loading = $('#loading');

function renderIconsByType(type) {
  const meta = icons[type] || icons.ant;
  if (meta && !meta.rendered) {
    $loading[0].setAttribute('style', 'display: block;');
    $.get(`./dist/sprite/symbol/${type}.svg`, (res) => {
      $body.prepend(new XMLSerializer().serializeToString(res));
      const $type = $(`#${type}`);
      $.each(icons[type].icons, (index, icon) => {
        const id = `si-${type}-${icon}`;
        $type.append(`<figure class="si-figure" data-type="${type}" data-id="${id}">
          <div id="figure-${id}"></div>
          <figcaption>${type}-${icon}</figcaption>
        </figure>`);
        $(`#figure-${id}`).append(`<div class="si-wrapper ${id}">
          <svg class="si"><use xlink:href="#${id}"></use></svg>
        </div>`);
      });
      meta.rendered = true;
      $loading.hide();
    });
  }
}

$.each(icons, (type, meta) => {
  $types.append(`<li data-type="${type}">
    <a href="#${type}">${meta.name}<span class="selected-count" data-type="${type}"></span></a>
  </li>`);
  $icons.append(`<div class="tab-content" id="${type}">
    <p class="center"><input type="checkbox" class="select-all" data-type="${type}"/> Select All</p>
  </div>`);
});
$icons.tabslet({
  deeplinking: true
});
$icons.on('_after', (e) => {
  const $tab = $(e.target);
  const type = $tab.data('type');
  console.log(type);
  renderIconsByType(type);
});

renderIconsByType(location.hash.replace(/^#/, ''));

function syncSelectedCount(type) {
  const count = $(`#${type}`).find('.si-figure.selected').length;
  if (count) {
    $(`.selected-count[data-type=${type}]`).html(count);
  } else {
    $(`.selected-count[data-type=${type}]`).html('');
  }
}

$('.select-all').on('change', function () {
  const $checkbox = $(this);
  const checked = $checkbox[0].checked;
  const type = $checkbox.data('type');
  if (checked) {
    $(`#${type}`).find('.si-figure').addClass('selected');
  } else {
    $(`#${type}`).find('.si-figure').removeClass('selected');
  }
  syncSelectedCount(type);
});

$(document).on('click', '.si-figure', function () {
  const selected = $(this).hasClass('selected');
  console.log(selected);
  if (selected) {
    $(this).removeClass('selected');
  } else {
    $(this).addClass('selected');
  }
  syncSelectedCount($(this).data('type'));
});

$('#download').on('click', () => {
  const ids = $.map($('.selected.si-figure'), (item) => $(item).data('id'));
  if (!ids.length) {
    alert('Please select at lease one icon');
  } else {
    const symbols = $.map(ids, (id) => {
      if ($(`#${id}`)[0]) {
        return $(`#${id}`)[0].outerHTML;
      }
      return '';
    });
    const svgSprite = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none;">${symbols.join('')}</svg>`;
    const blob = new Blob([
      svgSprite
    ], {
      type: 'text/plain;charset=utf-8'
    });
    saveAs(blob, 'si-sprite.svg');
  }
});
