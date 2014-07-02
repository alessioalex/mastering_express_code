$(function() {
  var urls = ['http://127.0.0.1:7777/metrics'];

  var attrs = [
    'http.requestsPerSecond.mean',
    'http.responseTime.histogram.mean',
    'process.memory-usage.rss',
    'process.eventLoopDelay.histogram.mean',
    'os.load-average.0'
  ];
  var ids = {
    'http.requestsPerSecond.mean': 'requestsPerSecond',
    'http.responseTime.histogram.mean': 'responseTime',
    'process.memory-usage.rss': 'rss',
    'process.eventLoopDelay.histogram.mean': 'eventLoopDelay',
    'os.load-average.0': 'osLoadAverage'
  };
  var plots = {};

  var reach = function(obj, propChain) {
    var propChain = propChain.split('.');
    var ret = obj;

    for (var i = 0; i < propChain.length; i++) {
      ret = ret[propChain[i]];
    }

    return ret;
  };

  var tmpl = '<div class="plot-container"><div class="placeholder" id="{{ id }}">';
  tmpl += '</div><div class="axisLabel yaxisLabel">{{ name }}</div>';

  var contentEl = $('#content');

  $.ajax(urls[0]).done(function(data, textStatus, jqXHR) {
    attrs.forEach(function(attr) {
      var val = reach(data, attr);
      if (attr.indexOf('rss') !== -1) {
        val = (val / 1024) / 1024;
      }

      var id = '0-' + ids[attr];
      // console.log(id, val);
      plots[id] = initPlot(id, val);
    });

    // NOTE: the interval is set to 1 second here so we can get a fast plot
    // in production it should be set to a higher value (for example 15 seconds
    // minimum)
    setInterval(function() {
      $.ajax(urls[0]).done(function(data, textStatus, jqXHR) {
        attrs.forEach(function(attr) {
          var val = reach(data, attr);
          if (attr.indexOf('rss') !== -1) {
            val = (val / 1024) / 1024;
          }

          var id = '0-' + ids[attr];
          plots[id](val);
          // console.log(id, val);
        });
      });
    }, 1000);
  });

  urls.forEach(function(url, index) {
    attrs.forEach(function(attr) {
      var id = '0-' + ids[attr];
      var template = tmpl.replace('{{ name }}', url + ' - ' + attr);
      template = template.replace('{{ id }}', id);
      $(template).appendTo(contentEl);
    });
  });

  function initPlot(id, val) {
    var container = $('#' + id);

    var oldValues = [[Date.now(), val]];

    function getData() {
      return {
        data: oldValues
      };
    }

    var plot = $.plot(container, [ getData(val) ], {
      series: {
        shadowSize: 0 // Drawing is faster without shadows
      },
      yaxis: {},
      xaxis: {
        mode: "time",
        timeformat: "%H:%M",
        minTickSize: [5, "seconds"]
        // show: false
      }
    });

    function update(val) {
      oldValues.push([Date.now(), val]);
      if (oldValues.length > 100) {
        oldValues = oldValues.slice(oldValues.length - 100);
      }

      plot.setData([oldValues]);

      plot.setupGrid();
      plot.draw();
      // setTimeout(update, updateInterval);
    }

    update(getData(val));

    return update;
  }
});
