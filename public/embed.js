(function () {
  var script = document.currentScript;
  var apiUrl = script.getAttribute('data-api-url') || '';
  var width = script.getAttribute('data-width') || '400';
  var height = script.getAttribute('data-height') || '600';
  var position = script.getAttribute('data-position') || 'bottom-right';
  var src = script.getAttribute('data-src') || script.src.replace(/embed\.js$/, 'index.html');

  if (apiUrl) {
    var separator = src.indexOf('?') === -1 ? '?' : '&';
    src += separator + 'apiUrl=' + encodeURIComponent(apiUrl);
  }

  var container = document.createElement('div');
  container.id = 'ai-chat-embed';
  container.style.cssText =
    'position:fixed;z-index:999999;' +
    'width:' + width + 'px;height:' + height + 'px;' +
    'border:none;border-radius:12px;overflow:hidden;' +
    'box-shadow:0 4px 24px rgba(0,0,0,0.15);' +
    (position === 'bottom-left'
      ? 'bottom:20px;left:20px;'
      : 'bottom:20px;right:20px;');

  var iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.title = 'AI Chat';

  container.appendChild(iframe);
  document.body.appendChild(container);
})();
