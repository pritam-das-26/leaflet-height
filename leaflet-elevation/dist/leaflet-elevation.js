(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    // Following https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md
    (function (factory, window) {
      // define an AMD module that relies on 'leaflet'
      if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory); // define a Common JS module that relies on 'leaflet'
      } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
      } // attach your plugin to the global 'L' variable


      if (typeof window !== 'undefined' && window.L) {
        factory(window.L);
      }
    })(function (L) {
      L.locales = {};
      L.locale = null;

      L.registerLocale = function registerLocale(code, locale) {
        L.locales[code] = L.Util.extend({}, L.locales[code], locale);
      };

      L.setLocale = function setLocale(code) {
        L.locale = code;
      };

      return L.i18n = L._ = function translate(string, data) {
        if (L.locale && L.locales[L.locale] && L.locales[L.locale][string]) {
          string = L.locales[L.locale][string];
        }

        try {
          // Do not fail if some data is missing
          // a bad translation should not break the app
          string = L.Util.template(string, data);
        } catch (err) {
          /*pass*/
        }

        return string;
      };
    }, window);

    var SEC = 1000;
    var MIN = SEC * 60;
    var HOUR = MIN * 60;
    var DAY = HOUR * 24;
    /**
     * Convert a duration time (millis) to a human readable string (%Dd %H:%M'%S")
     */

    function formatTime(t) {
      var d = Math.floor(t / DAY);
      var h = Math.floor((t - d * DAY) / HOUR);
      var m = Math.floor((t - d * DAY - h * HOUR) / MIN);
      var s = Math.round((t - d * DAY - h * HOUR - m * MIN) / SEC);

      if (s === 60) {
        m++;
        s = 0;
      }

      if (m === 60) {
        h++;
        m = 0;
      }

      if (h === 24) {
        d++;
        h = 0;
      }

      return (d ? d + "d " : '') + h.toString().padStart(2, 0) + ':' + m.toString().padStart(2, 0) + "'" + s.toString().padStart(2, 0) + '"';
    }
    /**
     * Generate download data event.
     */

    function saveFile(dataURI, fileName) {
      var a = create('a', '', {
        href: dataURI,
        target: '_new',
        download: fileName || "",
        style: "display:none;"
      });
      var b = document.body;
      b.appendChild(a);
      a.click();
      b.removeChild(a);
    }
    /**
     * Async JS script download.
     */

    function lazyLoader(url, skip, loader) {
      if (skip === false) {
        return Promise.resolve();
      }

      if (loader instanceof Promise) {
        return loader;
      }

      return new Promise(function (resolve, reject) {
        var tag = document.createElement("script");
        tag.addEventListener('load', resolve, {
          once: true
        });
        tag.src = url;
        document.head.appendChild(tag);
      });
    }
    /**
     * Convert SVG Path into Path2D and then update canvas
     */

    function drawCanvas(ctx, path) {
      path.classed('canvas-path', true);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      var p = new Path2D(path.attr('d'));
      ctx.strokeStyle = path.attr('stroke');
      ctx.fillStyle = path.attr('fill');
      ctx.lineWidth = 1.25;
      ctx.globalCompositeOperation = 'source-over'; // stroke opacity

      ctx.globalAlpha = path.attr('stroke-opacity') || 0.3;
      ctx.stroke(p); // fill opacity

      ctx.globalAlpha = path.attr('fill-opacity') || 0.45;
      ctx.fill(p);
      ctx.globalAlpha = 1;
      ctx.closePath();
    }
    /**
     * Limit a number between min / max values
     */

    function clamp(val, range) {
      if (range) return val < range[0] ? range[0] : val > range[1] ? range[1] : val;
      return val;
    }
    /**
     * A little bit safier than L.DomUtil.addClass
     */

    function addClass(targetNode, className) {
      if (targetNode) className.split(" ").every(function (s) {
        return s && L.DomUtil.addClass(targetNode, s);
      });
    }
    /**
     * A little bit safier than L.DomUtil.removeClass()
     */

    function removeClass(targetNode, className) {
      if (targetNode) className.split(" ").every(function (s) {
        return s && L.DomUtil.removeClass(targetNode, s);
      });
    }
    function toggleClass(targetNode, className, conditional) {
      return (conditional ? addClass : removeClass).call(null, targetNode, className);
    }
    function replaceClass(targetNode, removeClassName, addClassName) {
      if (removeClassName) removeClass(targetNode, removeClassName);
      if (addClassName) addClass(targetNode, addClassName);
    }
    function style(targetNode, name, value) {
      if (typeof value === "undefined") return L.DomUtil.getStyle(targetNode, name);else return targetNode.style.setProperty(name, value);
    }
    function toggleStyle(targetNode, name, value, conditional) {
      return style(targetNode, name, conditional ? value : '');
    }
    function toggleEvent(leafletElement, eventName, handler, conditional) {
      return leafletElement[conditional ? 'on' : 'off'](eventName, handler);
    }
    /**
     * A little bit shorter than L.DomUtil.create()
     */

    function create(tagName, className, attributes, parent) {
      var elem = L.DomUtil.create(tagName, className || "");
      if (attributes) setAttributes(elem, attributes);
      if (parent) append(parent, elem);
      return elem;
    }
    /**
     * Same as node.appendChild()
     */

    function append(parent, child) {
      return parent.appendChild(child);
    }
    /**
     * Same as node.insertAdjacentElement()
     */

    function insert(parent, child, position) {
      return parent.insertAdjacentElement(position, child);
    }
    /**
     * Loop for node.setAttribute()
     */

    function setAttributes(elem, attrs) {
      for (var k in attrs) {
        elem.setAttribute(k, attrs[k]);
      }
    }
    /**
     * Same as node.querySelector().
     */

    function select(selector, context) {
      return (context || document).querySelector(selector);
    }
    /**
     * Alias for L.DomEvent.on.
     */

    var on = L.DomEvent.on;
    /**
     * Alias for L.DomEvent.off.
     */

    var off = L.DomEvent.off;
    /**
     * Alias for L.DomUtil.hasClass.
     */

    var hasClass = L.DomUtil.hasClass;
    /**
     * Generate a random string
     */

    function randomId() {
      return Math.random().toString(36).substr(2, 9);
    }
    /**
     * Execute a function foreach element in object
     */

    function each(obj, fn) {
      for (var i in obj) {
        fn(obj[i], i);
      }
    }

    var _ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        formatTime: formatTime,
        saveFile: saveFile,
        lazyLoader: lazyLoader,
        drawCanvas: drawCanvas,
        clamp: clamp,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        replaceClass: replaceClass,
        style: style,
        toggleStyle: toggleStyle,
        toggleEvent: toggleEvent,
        create: create,
        append: append,
        insert: insert,
        setAttributes: setAttributes,
        select: select,
        on: on,
        off: off,
        hasClass: hasClass,
        randomId: randomId,
        each: each
    });

    var Colors = {
      'lightblue': {
        area: '#3366CC',
        alpha: 0.45,
        stroke: '#3366CC'
      },
      'magenta': {
        area: '#FF005E'
      },
      'yellow': {
        area: '#FF0'
      },
      'purple': {
        area: '#732C7B'
      },
      'steelblue': {
        area: '#4682B4'
      },
      'red': {
        area: '#F00'
      },
      'lime': {
        area: '#9CC222',
        line: '#566B13'
      }
    };
    var Area = function Area(_ref) {
      var width = _ref.width,
          height = _ref.height,
          xAttr = _ref.xAttr,
          yAttr = _ref.yAttr,
          scaleX = _ref.scaleX,
          scaleY = _ref.scaleY,
          _ref$interpolation = _ref.interpolation,
          interpolation = _ref$interpolation === void 0 ? "curveLinear" : _ref$interpolation;
      return d3.area().curve(typeof interpolation === 'string' ? d3[interpolation] : interpolation).x(function (d) {
        return d.xDiagCoord = scaleX(d[xAttr]);
      }).y0(height).y1(function (d) {
        return scaleY(d[yAttr]);
      });
    };
    var Path = function Path(_ref2) {
      var name = _ref2.name,
          color = _ref2.color,
          strokeColor = _ref2.strokeColor,
          strokeOpacity = _ref2.strokeOpacity,
          fillOpacity = _ref2.fillOpacity;
      var path = d3.create('svg:path');
      if (name) path.classed(name, true);
      path.style("pointer-events", "none");
      path.attr("fill", color || '#3366CC').attr("stroke", strokeColor || '#000').attr("stroke-opacity", strokeOpacity || '1').attr("fill-opacity", fillOpacity || '0.8');
      return path;
    };
    var Axis = function Axis(_ref3) {
      var _ref3$type = _ref3.type,
          type = _ref3$type === void 0 ? "axis" : _ref3$type,
          _ref3$tickSize = _ref3.tickSize,
          tickSize = _ref3$tickSize === void 0 ? 6 : _ref3$tickSize,
          _ref3$tickPadding = _ref3.tickPadding,
          tickPadding = _ref3$tickPadding === void 0 ? 3 : _ref3$tickPadding,
          position = _ref3.position,
          height = _ref3.height,
          width = _ref3.width,
          axis = _ref3.axis,
          scale = _ref3.scale,
          ticks = _ref3.ticks,
          tickFormat = _ref3.tickFormat,
          label = _ref3.label,
          labelX = _ref3.labelX,
          labelY = _ref3.labelY,
          _ref3$name = _ref3.name,
          name = _ref3$name === void 0 ? "" : _ref3$name,
          onAxisMount = _ref3.onAxisMount;
      return function (g) {
        var w = 0,
            h = 0;
        if (position == "bottom") h = height;
        if (position == "right") w = width;

        if (axis == "x" && type == "grid") {
          tickSize = -height;
        } else if (axis == "y" && type == "grid") {
          tickSize = -width;
        }

        var axisScale = d3["axis" + position.replace(/\b\w/g, function (l) {
          return l.toUpperCase();
        })]().scale(scale).ticks(ticks).tickPadding(tickPadding).tickSize(tickSize).tickFormat(tickFormat);
        var axisGroup = g.append("g").attr("class", [axis, type, position, name].join(" ")).attr("transform", "translate(" + w + "," + h + ")").call(axisScale);

        if (label) {
          axisGroup.append("svg:text").attr("x", labelX).attr("y", labelY).text(label);
        }

        if (onAxisMount) {
          axisGroup.call(onAxisMount);
        }

        return axisGroup;
      };
    };
    var Grid = function Grid(props) {
      props.type = "grid";
      return Axis(props);
    };
    var PositionMarker = function PositionMarker(_ref4) {
      var theme = _ref4.theme,
          _ref4$xCoord = _ref4.xCoord,
          xCoord = _ref4$xCoord === void 0 ? 0 : _ref4$xCoord,
          _ref4$yCoord = _ref4.yCoord,
          yCoord = _ref4$yCoord === void 0 ? 0 : _ref4$yCoord,
          _ref4$labels = _ref4.labels,
          labels = _ref4$labels === void 0 ? {} : _ref4$labels,
          _ref4$item = _ref4.item,
          item = _ref4$item === void 0 ? {} : _ref4$item,
          _ref4$length = _ref4.length,
          length = _ref4$length === void 0 ? 0 : _ref4$length;
      return function (g) {
        g.attr("class", "height-focus-group");
        var line = g.select('.height-focus.line');
        var circle = g.select('.height-focus.circle-lower');
        var text = g.select('.height-focus-label');
        if (!line.node()) line = g.append('svg:line');
        if (!circle.node()) circle = g.append('svg:circle');
        if (!text.node()) text = g.append('svg:text');
        if (isNaN(xCoord) || isNaN(yCoord)) return g;
        circle.attr("class", theme + " height-focus circle-lower").attr("transform", "translate(" + xCoord + "," + yCoord + ")").attr("r", 6).attr("cx", 0).attr("cy", 0);
        line.attr("class", theme + " height-focus line").attr("x1", xCoord).attr("x2", xCoord).attr("y1", yCoord).attr("y2", length);
        text.attr("class", theme + " height-focus-label").style("pointer-events", "none").attr("x", xCoord + 5).attr("y", length);
        var label;
        Object.keys(labels).sort(function (a, b) {
          return labels[a].order - labels[b].order;
        }) // TODO: any performance issues?
        .forEach(function (i) {
          label = text.select(".height-focus-" + labels[i].name);

          if (!label.size()) {
            label = text.append("svg:tspan").attr("class", "height-focus-" + labels[i].name).attr("dy", "1.5em");
          }

          label.text(typeof labels[i].value !== "function" ? labels[i].value : labels[i].value(item));
        });
        text.select('tspan').attr("dy", text.selectAll('tspan').size() > 1 ? "-1.5em" : "0em");
        text.selectAll('tspan').attr("x", xCoord + 5);
        return g;
      };
    };
    var LegendItem = function LegendItem(_ref5) {
      var name = _ref5.name,
          label = _ref5.label,
          width = _ref5.width,
          height = _ref5.height,
          _ref5$margins = _ref5.margins,
          margins = _ref5$margins === void 0 ? {} : _ref5$margins,
          color = _ref5.color,
          path = _ref5.path;
      return function (g) {
        g.attr("class", "legend-item legend-" + name.toLowerCase()).attr("data-name", name);
        g.on('click.legend', function () {
          return d3.select(g.node().ownerSVGElement || g).dispatch("legend_clicked", {
            detail: {
              path: path.node(),
              name: name,
              legend: g.node(),
              enabled: !path.classed('leaflet-hidden')
            }
          });
        });
        g.append("svg:rect").attr("x", width / 2 - 50).attr("y", height + margins.bottom / 2).attr("width", 50).attr("height", 10).attr("fill", color).attr("stroke", "#000").attr("stroke-opacity", "0.5").attr("fill-opacity", "0.25");
        g.append('svg:text').text(L._(label || name)).attr("x", width / 2 + 5).attr("font-size", 10).style("text-decoration-thickness", "2px").style("font-weight", "700").attr('y', height + margins.bottom / 2).attr('dy', "0.75em");
        return g;
      };
    };
    var Tooltip = function Tooltip(_ref6) {
      var xCoord = _ref6.xCoord,
          yCoord = _ref6.yCoord,
          width = _ref6.width,
          height = _ref6.height,
          _ref6$labels = _ref6.labels,
          labels = _ref6$labels === void 0 ? {} : _ref6$labels,
          _ref6$item = _ref6.item,
          item = _ref6$item === void 0 ? {} : _ref6$item;
      return function (g) {
        var line = g.select('.mouse-focus-line');
        var box = g.select('.mouse-focus-label');
        if (!line.node()) line = g.append('svg:line');
        if (!box.node()) box = g.append("g");
        var rect = box.select(".mouse-focus-label-rect");
        var text = box.select(".mouse-focus-label-text");
        if (!rect.node()) rect = box.append("svg:rect");
        if (!text.node()) text = box.append("svg:text"); // Sets focus-label-text position to the left / right of the mouse-focus-line

        var xAlign = 0;
        var yAlign = 0;
        var bbox = {
          width: 0,
          height: 0
        };

        try {
          bbox = text.node().getBBox();
        } catch (e) {
          return g;
        }

        if (xCoord) xAlign = xCoord + (xCoord < width / 2 ? 10 : -bbox.width - 10);
        if (yCoord) yAlign = Math.max(yCoord - bbox.height, L.Browser.webkit ? 0 : -Infinity);
        line.attr('class', 'mouse-focus-line').attr('x2', xCoord).attr('y2', 0).attr('x1', xCoord).attr('y1', height);
        box.attr('class', 'mouse-focus-label');
        rect.attr("class", "mouse-focus-label-rect").attr("x", xAlign - 5).attr("y", yAlign - 5).attr("width", bbox.width + 10).attr("height", bbox.height + 10).attr("rx", 3).attr("ry", 3);
        text.attr("class", "mouse-focus-label-text").style("font-weight", "700").attr("y", yAlign);
        var label;
        Object.keys(labels).sort(function (a, b) {
          return labels[a].order - labels[b].order;
        }) // TODO: any performance issues?
        .forEach(function (i) {
          label = text.select(".mouse-focus-label-" + labels[i].name);

          if (!label.size()) {
            label = text.append("svg:tspan", ".mouse-focus-label-x").attr("class", "mouse-focus-label-" + labels[i].name).attr("dy", "1.5em");
          }

          label.text(typeof labels[i].value !== "function" ? labels[i].value : labels[i].value(item));
        });
        text.select('tspan').attr("dy", "1em");
        text.selectAll('tspan').attr("x", xAlign);
        return g;
      };
    };
    var Ruler = function Ruler(_ref7) {
      var height = _ref7.height,
          width = _ref7.width;
      return function (g) {
        g.data([{
          "x": 0,
          "y": height
        }]).attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        var rect = g.selectAll('.horizontal-drag-rect').data([{
          w: width
        }]);
        var line = g.selectAll('.horizontal-drag-line').data([{
          w: width
        }]);
        var label = g.selectAll('.horizontal-drag-label').data([{
          w: width - 8
        }]);
        var symbol = g.selectAll('.horizontal-drag-symbol').data([{
          "type": d3.symbolTriangle,
          "x": width + 7,
          "y": 0,
          "angle": -90,
          "size": 50
        }]);
        rect.exit().remove();
        line.exit().remove();
        label.exit().remove();
        symbol.exit().remove();
        rect.enter().append("svg:rect").attr("class", "horizontal-drag-rect").attr("x", 0).attr("y", -8).attr("height", 8).attr('fill', 'none').attr('pointer-events', 'all').merge(rect).attr("width", function (d) {
          return d.w;
        });
        line.enter().append("svg:line").attr("class", "horizontal-drag-line").attr("x1", 0).merge(line).attr("x2", function (d) {
          return d.w;
        });
        label.enter().append("svg:text").attr("class", "horizontal-drag-label").attr("text-anchor", "end").attr("y", -8).merge(label).attr("x", function (d) {
          return d.w;
        });
        symbol.enter().append("svg:path").attr("class", "horizontal-drag-symbol").merge(symbol).attr("d", d3.symbol().type(function (d) {
          return d.type;
        }).size(function (d) {
          return d.size;
        })).attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ") rotate(" + d.angle + ")";
        });
        return g;
      };
    };
    var CheckPoint = function CheckPoint(_ref8) {
      var point = _ref8.point,
          height = _ref8.height,
          width = _ref8.width,
          x = _ref8.x,
          y = _ref8.y;
      return function (g) {
        if (isNaN(x) || isNaN(y)) return g;

        if (!point.item || !point.item.property('isConnected')) {
          point.position = point.position || "bottom";
          point.item = g.append('g');
          point.item.append("svg:line").attr("y1", 0).attr("x1", 0).attr("style", "stroke: rgb(51, 51, 51); stroke-width: 0.5; stroke-dasharray: 2, 2;");
          point.item.append("svg:circle").attr("class", " height-focus circle-lower").attr("r", 3);

          if (point.label) {
            point.item.append("svg:text").attr("dx", "4px").attr("dy", "-4px");
          }
        }

        point.item.datum({
          pos: point.position,
          x: x,
          y: y
        }).attr("class", function (d) {
          return "point " + d.pos;
        }).attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        point.item.select('line').datum({
          y2: {
            'top': -y,
            'bottom': height - y
          }[point.position],
          x2: {
            'left': -x,
            'right': width - x
          }[point.position] || 0
        }).attr("y2", function (d) {
          return d.y2;
        }).attr("x2", function (d) {
          return d.x2;
        });

        if (point.label) {
          point.item.select('text').text(point.label);
        }

        return g;
      };
    };
    var Domain = function Domain(_ref9) {
      var min = _ref9.min,
          max = _ref9.max,
          attr = _ref9.attr,
          name = _ref9.name,
          forceBounds = _ref9.forceBounds,
          scale = _ref9.scale;
      return function (data) {
        attr = attr || name;
        if (scale && scale.attr) attr = scale.attr;
        var domain = data && data.length ? d3.extent(data, function (d) {
          return d[attr];
        }) : [0, 1];

        if (typeof min !== "undefined" && (min < domain[0] || forceBounds)) {
          domain[0] = min;
        }

        if (typeof max !== "undefined" && (max > domain[1] || forceBounds)) {
          domain[1] = max;
        }

        return domain;
      };
    };
    var Range = function Range(_ref10) {
      var axis = _ref10.axis;
      return function (width, height) {
        if (axis == 'x') return [0, width];else if (axis == 'y') return [height, 0];
      };
    };
    var Scale = function Scale(_ref11) {
      var data = _ref11.data,
          attr = _ref11.attr,
          min = _ref11.min,
          max = _ref11.max,
          forceBounds = _ref11.forceBounds,
          range = _ref11.range;
      return d3.scaleLinear().range(range).domain(Domain({
        min: min,
        max: max,
        attr: attr,
        forceBounds: forceBounds
      })(data));
    };
    var Bisect = function Bisect(_ref12) {
      var _ref12$data = _ref12.data,
          data = _ref12$data === void 0 ? [0, 1] : _ref12$data,
          scale = _ref12.scale,
          x = _ref12.x,
          attr = _ref12.attr;
      return d3.bisector(function (d) {
        return d[attr];
      }).left(data, scale.invert(x));
    };
    var Chart = function Chart(_ref13) {
      var width = _ref13.width,
          height = _ref13.height,
          _ref13$margins = _ref13.margins,
          margins = _ref13$margins === void 0 ? {} : _ref13$margins,
          ruler = _ref13.ruler;

      var _width = width - margins.left - margins.right;

      var _height = height - margins.top - margins.bottom; // SVG Container


      var svg = d3.create("svg:svg").attr("class", "background"); // SVG Groups

      var g = svg.append("g");
      var panes = {
        grid: g.append("g").attr("class", "grid"),
        area: g.append('g').attr("class", "area"),
        axis: g.append('g').attr("class", "axis"),
        point: g.append('g').attr("class", "point"),
        brush: g.append("g").attr("class", "brush"),
        tooltip: g.append("g").attr("class", "tooltip").attr('display', 'none'),
        ruler: g.append('g').attr('class', 'ruler'),
        legend: g.append('g').attr("class", "legend")
      }; // SVG Paths

      var mask = panes.area.append("svg:mask").attr("id", 'elevation-clipper').attr('fill-opacity', 1);
      var maskRect = mask.append("svg:rect").attr('class', 'zoom').attr('fill', 'white'); // white = transparent
      // Canvas Paths

      var foreignObject = panes.area.append('svg:foreignObject').attr('mask', 'url(#' + mask.attr('id') + ')');
      var canvas = foreignObject.append('xhtml:canvas').attr('class', 'canvas-plot');
      var context = canvas.node().getContext('2d'); // Add tooltip

      panes.tooltip.call(Tooltip({
        xCoord: 0,
        yCoord: 0,
        height: _height,
        width: _width,
        labels: {}
      })); // Add the brushing

      var brush = d3.brushX().on('start.cursor end.cursor brush.cursor', function () {
        return panes.brush.select(".overlay").attr('cursor', null);
      }); // Scales

      var scale = function scale(opts) {
        return {
          x: Scale(opts.x),
          y: Scale(opts.y)
        };
      };

      var utils = {
        mask: mask,
        canvas: canvas,
        context: context,
        brush: brush
      };
      var chart = {
        svg: svg,
        g: g,
        panes: panes,
        utils: utils,
        scale: scale
      }; // Resize

      chart._resize = function (_ref14) {
        var width = _ref14.width,
            height = _ref14.height,
            _ref14$margins = _ref14.margins,
            margins = _ref14$margins === void 0 ? {} : _ref14$margins,
            ruler = _ref14.ruler;

        var _width = width - margins.left - margins.right;

        var _height = height - margins.top - margins.bottom;

        svg.attr("viewBox", "0 0 ".concat(width, " ").concat(height)).attr("width", width).attr("height", height);
        g.attr("transform", "translate(" + margins.left + "," + margins.top + ")"); // Partially fix: https://github.com/Raruto/leaflet-elevation/issues/123

        if (/Mac|iPod|iPhone|iPad/.test(navigator.platform) && /AppleWebkit/i.test(navigator.userAgent)) {
          canvas.style("transform", "translate(" + margins.left + "px," + margins.top + "px)");
        }

        maskRect.attr("x", 0).attr("y", 0).attr("width", _width).attr("height", _height);
        foreignObject.attr('width', _width).attr('height', _height);
        canvas.attr('width', _width).attr('height', _height);

        if (ruler) {
          panes.ruler.call(Ruler({
            height: _height,
            width: _width
          }));
        }

        panes.brush.call(brush.extent([[0, 0], [_width, _height]]));
        panes.brush.select(".overlay").attr('cursor', null);
        chart._width = _width;
        chart._height = _height;
        chart.svg.dispatch('resize', {
          detail: {
            width: _width,
            height: _height
          }
        });
      };

      chart.pane = function (name) {
        if (!panes[name]) {
          panes[name] = g.append('g').attr("class", name);
        }

        return panes[name];
      };

      chart.get = function (name) {
        return utils[name];
      };

      chart._resize({
        width: width,
        height: height,
        margins: margins
      });

      return chart;
    };

    var D3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Colors: Colors,
        Area: Area,
        Path: Path,
        Axis: Axis,
        Grid: Grid,
        PositionMarker: PositionMarker,
        LegendItem: LegendItem,
        Tooltip: Tooltip,
        Ruler: Ruler,
        CheckPoint: CheckPoint,
        Domain: Domain,
        Range: Range,
        Scale: Scale,
        Bisect: Bisect,
        Chart: Chart
    });

    var Chart$1 = L.Class.extend({
      includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
      initialize: function initialize(opts, control) {
        var _this = this;

        this.options = opts;
        this.control = control;
        this._data = []; // cache registered components

        this._props = {
          scales: {},
          paths: {},
          areas: {},
          grids: {},
          axes: {},
          legendItems: {},
          tooltipItems: {}
        };
        this._scales = {};
        this._domains = {};
        this._ranges = {};
        this._paths = {};
        this._brushEnabled = opts.dragging;
        this._zoomEnabled = opts.zooming;
        var chart = this._chart = Chart(opts); // SVG Container

        var svg = this._container = chart.svg; // Panes

        this._grid = chart.pane('grid');
        this._area = chart.pane('area');
        this._point = chart.pane('point');
        this._axis = chart.pane('axis');
        this._legend = chart.pane('legend');
        this._tooltip = chart.pane('tooltip');
        this._ruler = chart.pane('ruler'); // Scales

        this._initScale(); // Helpers


        this._mask = chart.get('mask');
        this._context = chart.get('context');
        this._brush = chart.get('brush');
        this._zoom = d3.zoom();
        this._drag = d3.drag(); // Interactions

        this._initInteractions(); // svg.on('resize', (e)=>console.log(e.detail));
        // Handle multi-track segments (BETA)


        this._maskGaps = [];
        control.on('eletrack_added', function (e) {
          _this._maskGaps.push(e.index);

          control.once('eledata_updated', function (e) {
            return _this._maskGaps.push(e.index);
          });
        });
      },
      update: function update(props) {
        if (props) {
          if (props.data) this._data = props.data;
          if (props.options) this.options = props.options;
        }

        this._updateScale();

        this._updateArea();

        this._updateAxis();

        this._updateLegend();

        this._updateClipper();

        return this;
      },
      render: function render() {
        var _this2 = this;

        return function (container) {
          return container.append(function () {
            return _this2._container.node();
          });
        };
      },
      clear: function clear() {
        this._resetDrag();

        this._hideDiagramIndicator();

        this._area.selectAll('path').attr("d", "M0 0");

        this._context.clearRect(0, 0, this._width(), this._height()); // if (this._path) {
        // this._x.domain([0, 1]);
        // this._y.domain([0, 1]);
        // }


        this._maskGaps = [];

        this._mask.selectAll(".gap").remove();
      },
      _drawPath: function _drawPath(name) {
        var path = this._paths[name];
        var area = this._props.areas[name];
        path.datum(this._data).attr("d", Area(L.extend({}, area, {
          width: this._width(),
          height: this._height(),
          scaleX: this._scales[area.scaleX],
          scaleY: this._scales[area.scaleY]
        })));
        if (path.classed('leaflet-hidden')) return;

        if (this.options.preferCanvas) {
          drawCanvas(this._context, path);
        } else {
          this._area.append(function () {
            return path.node();
          });
        }
      },
      _hasActiveLayers: function _hasActiveLayers() {
        var paths = this._paths;

        for (var i in paths) {
          if (!paths[i].classed('leaflet-hidden')) {
            return true;
          }
        }

        return false;
      },

      /**
       * Initialize "d3-brush".
       */
      _initBrush: function _initBrush(e) {
        var _this3 = this;

        var brush = function brush(e) {
          if (!_this3._data.length) return;
          var extent = e.selection;

          if (extent) {
            var start = _this3._findIndexForXCoord(extent[0]);

            var end = _this3._findIndexForXCoord(extent[1]);

            _this3.fire('dragged', {
              dragstart: _this3._data[start],
              dragend: _this3._data[end]
            });
          }
        };

        var focus = function focus(e) {
          if (!_this3._data.length) return;
          if (e.type == 'brush' && !e.sourceEvent) return;

          var rect = _this3._chart.panes.brush.select('.overlay').node();

          var coords = d3.pointers(e, rect)[0];
          var xCoord = coords[0];

          var item = _this3._data[_this3._findIndexForXCoord(xCoord)];

          _this3.fire("mouse_move", {
            item: item,
            xCoord: xCoord
          });
        };

        this._brush.filter(function (e) {
          return _this3._brushEnabled && !e.shiftKey && !e.button;
        }).on("end.update", brush).on("brush.update", focus);

        this._chart.panes.brush.on("mouseenter.focus touchstart.focus", this.fire.bind(this, "mouse_enter")).on("mouseout.focus touchend.focus", this.fire.bind(this, "mouse_out")).on("mousemove.focus touchmove.focus", focus);
      },

      /**
       * Initialize "d3-zoom"
       */
      _initClipper: function _initClipper() {
        var _this4 = this;

        var svg = this._container;
        var margin = this.options.margins;
        var zoom = this._zoom;

        var onStart = function onStart(e) {
          if (e.sourceEvent && e.sourceEvent.type == "mousedown") svg.style('cursor', 'grabbing');

          if (e.transform.k == 1 && e.transform.x == 0) {
            _this4._container.classed('zoomed', true); // Apply d3-zoom (bind <clipPath> mask)


            if (_this4._mask) {
              _this4._point.attr('mask', 'url(#' + _this4._mask.attr('id') + ')');
            }
          }

          _this4.zooming = true;
        };

        var onEnd = function onEnd(e) {
          if (e.transform.k == 1 && e.transform.x == 0) {
            _this4._container.classed('zoomed', false); // Apply d3-zoom (bind <clipPath> mask)


            if (_this4._mask) {
              _this4._point.attr('mask', null);
            }
          }

          _this4.zooming = false;
          svg.style('cursor', '');
        };

        var onZoom = function onZoom(e) {
          // TODO: find a faster way to redraw the chart.
          _this4.zooming = false;

          _this4._updateScale(); // hacky way for restoring x scale when zooming out


          _this4.zooming = true;
          _this4._scales.distance = _this4._x = e.transform.rescaleX(_this4._x); // calculate x scale at zoom level

          if (_this4._scales.time) _this4._scales.time = e.transform.rescaleX(_this4._scales.time); // calculate x scale at zoom level

          _this4._resetDrag();

          if (e.sourceEvent && e.sourceEvent.type == "mousemove") {
            _this4._hideDiagramIndicator();
          }

          _this4.fire('zoom');
        };

        zoom.scaleExtent([1, 10]).extent([[margin.left, 0], [this._width() - margin.right, this._height()]]).translateExtent([[margin.left, -Infinity], [this._width() - margin.right, Infinity]]).filter(function (e) {
          return _this4._zoomEnabled && (e.shiftKey || e.buttons == 4);
        }).on("start", onStart).on("end", onEnd).on("zoom", onZoom);
        svg.call(zoom); // add zoom functionality to "svg" group
        // d3.select("body").on("keydown.grabzoom keyup.grabzoom", (e) => svg.style('cursor', e.shiftKey ? 'move' : ''));
      },
      _initInteractions: function _initInteractions() {
        this._initBrush();

        this._initRuler();

        this._initClipper();

        this._initLegend();
      },

      /**
       * Toggle chart data on legend click
       */
      _initLegend: function _initLegend() {
        var _this5 = this;

        this._container.on('legend_clicked', function (e) {
          var _e$detail = e.detail,
              path = _e$detail.path,
              legend = _e$detail.legend,
              name = _e$detail.name,
              enabled = _e$detail.enabled;
          if (!path) return;

          var label = select('text', legend);

          var rect = select('rect', legend);

          toggleStyle(label, 'text-decoration-line', 'line-through', enabled);

          toggleStyle(rect, 'fill-opacity', '0', enabled);

          toggleClass(path, 'leaflet-hidden', enabled);

          _this5._updateArea();

          _this5.fire("elepath_toggle", {
            path: path,
            name: name,
            legend: legend,
            enabled: enabled
          });
        });
      },

      /**
       * Initialize "ruler".
       */
      _initRuler: function _initRuler() {
        var _this6 = this;

        if (!this.options.ruler) return; // const yMax      = this._height();

        var formatNum = d3.format(".0f");
        var drag = this._drag;

        var label = function label(e, d) {
          var yMax = _this6._height();

          var y = _this6._ruler.data()[0].y;

          if (y >= yMax || y <= 0) _this6._ruler.select(".horizontal-drag-label").text('');

          _this6._hideDiagramIndicator();
        };

        var position = function position(e, d) {
          var yMax = _this6._height();

          var yCoord = d3.pointers(e, _this6._area.node())[0][1];
          var y = yCoord > 0 ? yCoord < yMax ? yCoord : yMax : 0;

          var z = _this6._y.invert(y);

          var data = L.extend(_this6._ruler.data()[0], {
            y: y
          });

          _this6._ruler.data([data]).attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          }).classed('active', y < yMax);

          _this6._container.select(".horizontal-drag-label").text(formatNum(z) + " " + (_this6.options.imperial ? 'ft' : 'm'));

          _this6.fire('ruler_filter', {
            coords: yCoord < yMax && yCoord > 0 ? _this6._findCoordsForY(yCoord) : []
          });
        };

        drag.on("start end", label).on("drag", position);

        this._ruler.call(drag);
      },

      /**
       * Initialize x and y scales
       */
      _initScale: function _initScale() {
        var opts = this.options;

        this._registerAxisScale({
          axis: 'x',
          position: 'bottom',
          attr: opts.xAttr,
          min: opts.xAxisMin,
          max: opts.xAxisMax,
          name: 'distance'
        });

        this._registerAxisScale({
          axis: 'y',
          position: 'left',
          attr: opts.yAttr,
          min: opts.yAxisMin,
          max: opts.yAxisMax,
          name: 'altitude'
        });

        this._x = this._scales.distance;
        this._y = this._scales.altitude;
      },
      _registerAreaPath: function _registerAreaPath(props) {
        if (props.scale == 'y') props.scale = this._y;else if (props.scale == 'x') props.scale = this._x;
        var opts = this.options;
        if (!props.xAttr) props.xAttr = opts.xAttr;
        if (!props.yAttr) props.yAttr = opts.yAttr;
        if (typeof props.preferCanvas === "undefined") props.preferCanvas = opts.preferCanvas;
        var path = Path(props); // Save paths in memory for latter usage

        this._paths[props.name] = path;
        this._props.areas[props.name] = props;

        if (opts.legend) {
          this._props.legendItems[props.name] = {
            name: props.name,
            label: props.label,
            color: props.color,
            path: path
          };
        }
      },
      _registerAxisGrid: function _registerAxisGrid(props) {
        if (props.scale == 'y') props.scale = this._y;else if (props.scale == 'x') props.scale = this._x;
        this._props.grids[props.name || props.axis] = props;
      },
      _registerAxisScale: function _registerAxisScale(props) {
        if (props.scale == 'y') props.scale = this._y;else if (props.scale == 'x') props.scale = this._x;
        var opts = this.options;
        var scale = props.scale;

        if (typeof this._scales[props.name] === 'function') {
          props.scale = this._scales[props.name]; // retrieve cached scale
        } else if (typeof scale !== 'function') {
          scale = L.extend({
            data: this._data,
            forceBounds: opts.forceAxisBounds
          }, scale);
          scale.attr = scale.attr || props.name;
          var domain = this._domains[props.name] = Domain(props);
          var range = this._ranges[props.name] = Range(props);
          scale.range = scale.range || range(this._width(), this._height());
          scale.domain = scale.domain || domain(this._data);
          this._props.scales[props.name] = scale;
          props.scale = this._scales[props.name] = Scale(scale);
        }

        if (!props.ticks) {
          if (props.axis == 'x') props.ticks = opts.xTicks;else if (props.axis == 'y') props.ticks = opts.yTicks;
        }

        this._props.axes[props.name] = props;
        return scale;
      },

      /**
       * Add a point of interest over the chart
       */
      _registerCheckPoint: function _registerCheckPoint(point) {
        if (!this._data.length) return;
        var item, x, y;

        if (point.latlng) {
          item = this._data[this._findIndexForLatLng(point.latlng)];
          x = this._x(item.dist);
          y = this._y(item.z);
        } else if (!isNaN(point.dist)) {
          x = this._x(point.dist);
          item = this._data[this._findIndexForXCoord(x)];
          y = this._y(item.z);
        }

        this._point.call(CheckPoint({
          point: point,
          width: this._width(),
          height: this._height(),
          x: x,
          y: y
        }));
      },
      _registerTooltip: function _registerTooltip(props) {
        var _props$order;

        props.order = (_props$order = props.order) !== null && _props$order !== void 0 ? _props$order : 100;
        this._props.tooltipItems[props.name] = props;
      },
      _updateArea: function _updateArea() {
        var paths = this._paths; // Reset and update chart profiles

        this._context.clearRect(0, 0, this._width(), this._height());

        for (var i in paths) {
          if (!paths[i].classed('leaflet-hidden')) {
            this._drawPath(i);
          }
        }
      },
      _updateAxis: function _updateAxis() {
        var opts = this.options; // Reset chart axis.

        this._grid.selectAll('g').remove();

        this._axis.selectAll('g').remove();

        var grids = this._props.grids;
        var axes = this._props.axes;
        var props, axis, grid;
        var gridOpts = {
          width: this._width(),
          height: this._height(),
          tickFormat: ""
        };
        var axesOpts = {
          width: this._width(),
          height: this._height()
        }; // Render grids

        for (var i in grids) {
          props = L.extend({}, gridOpts, grids[i]);
          grid = Grid(props);

          this._grid.call(grid);
        } // Render axis


        for (var _i in axes) {
          if (opts[_i] === false || opts[_i] === 'summary') continue;
          props = L.extend({}, axesOpts, axes[_i]);
          axis = Axis(props);

          this._axis.call(axis);
        } // Adjust axis scale positions


        this._axis.selectAll('.y.axis.right').each(function (d, i, n) {
          var axis = d3.select(n[i]);
          var transform = axis.attr('transform');
          var translate = transform.substring(transform.indexOf("(") + 1, transform.indexOf(")")).split(",");
          axis.attr('transform', 'translate(' + (+translate[0] + i * 40) + ',' + translate[1] + ')');

          if (i > 0) {
            axis.select(':scope > path').attr('opacity', 0.25);
            axis.selectAll(':scope > .tick line').attr('opacity', 0.75);
          }
        });
      },
      _updateClipper: function _updateClipper() {
        var _this7 = this;

        var margin = this.options.margins;

        this._zoom.scaleExtent([1, 10]).extent([[margin.left, 0], [this._width() - margin.right, this._height()]]).translateExtent([[margin.left, -Infinity], [this._width() - margin.right, Infinity]]); // Apply svg mask on multi-track segments (BETA)


        this._mask.selectAll(".gap").remove();

        this._maskGaps.forEach(function (d, i) {
          if (i >= _this7._maskGaps.length - 2) return;
          var d1 = _this7._data[_this7._maskGaps[i]];
          var d2 = _this7._data[_this7._maskGaps[i + 1]];

          var x1 = _this7._x(_this7._data[_this7._findIndexForLatLng(d1.latlng)].dist);

          var x2 = _this7._x(_this7._data[_this7._findIndexForLatLng(d2.latlng)].dist);

          _this7._mask.append("rect").attr("x", x1).attr("y", 0).attr("width", x2 - x1).attr("height", _this7._height()).attr('class', 'gap').attr('fill-opacity', '0.8').attr("fill", 'black'); // black = hide

        });
      },
      _updateLegend: function _updateLegend() {
        var _this8 = this;

        if (this.options.legend === false) return;
        var legends = this._props.legendItems;
        var legend; // Reset legend items

        this._legend.selectAll('g').remove();

        for (var i in legends) {
          legend = LegendItem(L.extend({
            width: this._width(),
            height: this._height(),
            margins: this.options.margins
          }, legends[i]));

          this._legend.append("g").call(legend);
        } // Get legend items


        var items = this._legend.selectAll('.legend-item'); // Calculate legend item positions


        var n = items.nodes().length;
        var v = Array(Math.floor(n / 2)).fill(null).map(function (d, i) {
          return (i + 1) * 2 - (1 - Math.sign(n % 2));
        });
        var rev = v.slice().reverse().map(function (d) {
          return -d;
        });

        if (n % 2 !== 0) {
          rev.push(0);
        }

        v = rev.concat(v); // Get chart margins

        var xAxesB = this._axis.selectAll('.x.axis.bottom').nodes().length;

        var marginB = 30 + xAxesB * 2;
        var marginR = n * 30; // Adjust chart right margins

        if (n && this.options.margins.right < marginR) {
          this.options.margins.right = marginR;
          this.fire('margins_updated');
        } // Adjust chart bottom margins


        if (xAxesB && this.options.margins.bottom < marginB) {
          this.options.margins.bottom = marginB;
          this.fire('margins_updated');
        }

        items.each(function (d, i, n) {
          var legend = d3.select(n[i]);
          var rect = legend.select('rect');
          var name = legend.attr('data-name');
          var path = _this8._paths[name];
          var tx = v[i] * 55;
          var ty = xAxesB * 2;
          legend // Adjust legend item positions
          .attr("transform", "translate(" + tx + ", " + ty + ")"); // Set initial state (disabled controls)

          if (name in _this8.options && _this8.options[name] == 'disabled') {
            path.classed('leaflet-hidden', true);
            legend.select('text').style('text-decoration-line', 'line-through');
            legend.select('rect').style('fill-opacity', '0');
          } // Apply d3-zoom (bind <clipPath> mask)


          if (_this8._mask) {
            path.attr('mask', 'url(#' + _this8._mask.attr('id') + ')');
          }
        });
      },
      _updateScale: function _updateScale() {
        if (this.zooming) return {
          x: this._x,
          y: this._y
        };

        for (var i in this._scales) {
          this._scales[i].domain(this._domains[i](this._data)).range(this._ranges[i](this._width(), this._height()));
        }

        return {
          x: this._x,
          y: this._y
        };
      },

      /**
       * Calculates chart width.
       */
      _width: function _width() {
        return this._chart._width;
      },

      /**
       * Calculates chart height.
       */
      _height: function _height() {
        return this._chart._height;
      },

      /*
       * Finds data entries above a given y-elevation value and returns geo-coordinates
       */
      _findCoordsForY: function _findCoordsForY(y) {
        var data = this._data;

        var z = this._y.invert(y); // save indexes of elevation values above the horizontal line


        var list = data.reduce(function (array, item, index) {
          if (item.z >= z) array.push(index);
          return array;
        }, []);
        var start = 0;
        var next; // split index list into blocks of coordinates

        var coords = list.reduce(function (array, _, curr) {
          next = curr + 1;

          if (list[next] !== list[curr] + 1 || next === list.length) {
            array.push(list.slice(start, next).map(function (i) {
              return data[i].latlng;
            }));
            start = next;
          }

          return array;
        }, []);
        return coords;
      },

      /*
       * Finds a data entry for a given x-coordinate of the diagram
       */
      _findIndexForXCoord: function _findIndexForXCoord(x) {
        var _this9 = this;

        return d3.bisector(function (d) {
          return d[_this9.options.xAttr];
        }).left(this._data || [0, 1], this._x.invert(x));
      },

      /*
       * Finds a data entry for a given latlng of the map
       */
      _findIndexForLatLng: function _findIndexForLatLng(latlng) {
        var result = null;
        var d = Infinity;

        this._data.forEach(function (item, index) {
          var dist = latlng.distanceTo(item.latlng);

          if (dist < d) {
            d = dist;
            result = index;
          }
        });

        return result;
      },

      /*
       * Removes the drag rectangle and zoms back to the total extent of the data.
       */
      _resetDrag: function _resetDrag() {
        if (this._chart.panes.brush.select(".selection").attr('width')) {
          this._chart.panes.brush.call(this._brush.clear);

          this._hideDiagramIndicator();

          this.fire('reset_drag');
        }
      },
      _resetZoom: function _resetZoom() {
        if (this._zoom) {
          this._zoom.transform(this._chart.svg, d3.zoomIdentity);
        }
      },

      /**
       * Display distance and altitude level ("focus-rect").
       */
      _showDiagramIndicator: function _showDiagramIndicator(item, xCoordinate) {
        this._tooltip.attr("display", null).call(Tooltip({
          xCoord: xCoordinate,
          yCoord: this._y(item[this.options.yAttr]),
          height: this._height(),
          width: this._width(),
          labels: this._props.tooltipItems,
          item: item
        }));
      },
      _hideDiagramIndicator: function _hideDiagramIndicator() {
        this._tooltip.attr("display", 'none');
      }
    });

    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    var Marker = L.Class.extend({
      initialize: function initialize(options) {
        this.options = options;

        switch (this.options.marker) {
          case 'elevation-line':
            // this._container = d3.create("g").attr("class", "height-focus-group");
            break;

          case 'position-marker':
            // this._marker   = L.circleMarker([0, 0], { pane: 'overlayPane', radius: 6, fillColor: '#fff', fillOpacity:1, color: '#000', weight:1, interactive: false });
            this._marker = L.marker([0, 0], {
              icon: this.options.markerIcon,
              zIndexOffset: 1000000,
              interactive: false
            });
            break;
        }

        this._labels = {};
        return this;
      },
      addTo: function addTo(map) {
        this._map = map;

        switch (this.options.marker) {
          case 'elevation-line':
            this._container = d3.select(map.getPane('elevationPane')).select("svg > g").call(PositionMarker({}));
            break;

          case 'position-marker':
            this._marker.addTo(map, {
              pane: 'overlayPane'
            });

            break;
        }

        return this;
      },

      /**
       * Update position marker ("leaflet-marker").
       */
      update: function update(props) {
        if (props) this._props = props;else props = this._props;
        if (!props) return;
        if (props.options) this.options = props.options;
        if (!this._map) this.addTo(props.map);
        this._latlng = props.item.latlng;

        switch (this.options.marker) {
          case 'elevation-line':
            if (this._container) {
              var point = this._map.latLngToLayerPoint(this._latlng);

              point = L.extend({}, props.item, this._map._rotate ? this._map.rotatedPointToMapPanePoint(point) : point);

              this._container.classed("leaflet-hidden", false);

              this._container.call(PositionMarker({
                theme: this.options.theme,
                xCoord: point.x,
                yCoord: point.y,
                length: point.y - this._height() / props.maxElevation * point.z,
                // normalized Y
                labels: this._labels,
                item: point
              }));
            }

            break;

          case 'position-marker':
            removeClass(this._marker.getElement(), 'leaflet-hidden');

            this._marker.setLatLng(this._latlng);

            break;
        }
      },

      /*
       * Hides the position/height indicator marker drawn onto the map
       */
      remove: function remove() {
        this._props = null;

        switch (this.options.marker) {
          case 'elevation-line':
            this._container && this._container.classed("leaflet-hidden", true);
            break;

          case 'position-marker':
            addClass(this._marker.getElement(), 'leaflet-hidden');

            break;
        }
      },
      getLatLng: function getLatLng() {
        return this._latlng;
      },

      /**
       * Calculates chart height.
       */
      _height: function _height() {
        var opts = this.options;
        return opts.height - opts.margins.top - opts.margins.bottom;
      },
      _registerTooltip: function _registerTooltip(props) {
        this._labels[props.name] = props;
      }
    });

    var Summary = L.Class.extend({
      initialize: function initialize(opts, control) {
        this.options = opts;
        this.control = control;
        this.labels = {};

        var summary = this._container = create("div", "elevation-summary " + (opts.summary ? opts.summary + "-summary" : ''));

        style(summary, 'max-width', opts.width ? opts.width + 'px' : '');
      },
      render: function render() {
        var _this = this;

        return function (container) {
          return container.append(function () {
            return _this._container;
          });
        };
      },
      reset: function reset() {
        this._container.innerHTML = '';
      },
      append: function append(className, label, value) {
        this._container.innerHTML += "<span class=\"".concat(className, "\"><span class=\"summarylabel\">").concat(label, "</span><span class=\"summaryvalue\">").concat(value, "</span></span>");
        return this;
      },
      update: function update() {
        var _this2 = this;

        Object.keys(this.labels).sort(function (a, b) {
          return _this2.labels[a].order - _this2.labels[b].order;
        }) // TODO: any performance issues?
        .forEach(function (i) {
          _this2.append(i, L._(_this2.labels[i].label), typeof _this2.labels[i].value !== "function" ? _this2.labels[i].value : _this2.labels[i].value(_this2.control.track_info));
        });
      },
      _registerSummary: function _registerSummary(data) {
        for (var i in data) {
          var _data$i$order;

          data[i].order = (_data$i$order = data[i].order) !== null && _data$i$order !== void 0 ? _data$i$order : 100;
          this.labels[i] = data[i];
        }
      }
    });

    var Options = {
      autofitBounds: true,
      autohide: !L.Browser.mobile,
      autohideMarker: true,
      almostover: true,
      altitude: true,
      collapsed: false,
      detached: true,
      distance: true,
      distanceMarkers: {
        lazy: true,
        distance: true,
        direction: true
      },
      decimalsX: 2,
      decimalsY: 0,
      dragging: !L.Browser.mobile,
      downloadLink: 'link',
      elevationDiv: "#elevation-div",
      followMarker: true,
      forceAxisBounds: false,
      height: 200,
      imperial: false,
      interpolation: "curveLinear",
      lazyLoadJS: true,
      legend: true,
      margins: {
        top: 30,
        right: 30,
        bottom: 30,
        left: 40
      },
      marker: 'elevation-line',
      markerIcon: L.divIcon({
        className: 'elevation-position-marker',
        html: '<i class="elevation-position-icon"></i>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      }),
      position: "topright",
      polyline: {
        className: 'elevation-polyline',
        color: '#000',
        opacity: 0.75,
        weight: 5,
        lineCap: 'round'
      },
      polylineSegments: {
        className: 'elevation-polyline-segments',
        color: '#F00',
        interactive: false
      },
      preferCanvas: false,
      reverseCoords: false,
      ruler: true,
      skipNullZCoords: false,
      theme: "lightblue-theme",
      summary: 'inline',
      slope: false,
      slopeDeltaMax: undefined,
      slopeRange: undefined,
      speed: false,
      speedDeltaMax: undefined,
      speedRange: undefined,
      time: false,
      timeFactor: 3600,
      timeFormat: false,
      timestamps: false,
      width: 600,
      waypoints: true,
      wptIcons: {
        '': L.divIcon({
          className: 'elevation-waypoint-marker',
          html: '<i class="elevation-waypoint-icon default"></i>',
          iconSize: [30, 30],
          iconAnchor: [8, 30]
        })
      },
      wptLabels: true,
      xAttr: "dist",
      xLabel: "km",
      xTicks: undefined,
      yAttr: "z",
      yAxisMax: undefined,
      yAxisMin: undefined,
      yLabel: "m",
      yTicks: undefined,
      zFollow: false,
      zooming: !L.Browser.Mobile
    };

    var Elevation = L.Control.Elevation = L.Control.extend({
      includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
      options: Options,
      __mileFactor: 0.621371,
      __footFactor: 3.28084,
      __D3: 'https://unpkg.com/d3@6.5.0/dist/d3.min.js',
      __TOGEOJSON: 'https://unpkg.com/@tmcw/togeojson@4.5.0/dist/togeojson.umd.js',
      __LGEOMUTIL: 'https://unpkg.com/leaflet-geometryutil@0.9.3/src/leaflet.geometryutil.js',
      __LALMOSTOVER: 'https://unpkg.com/leaflet-almostover@1.0.1/src/leaflet.almostover.js',
      __LDISTANCEM: 'https://unpkg.com/@raruto/leaflet-elevation@1.9.6/libs/leaflet-distance-marker.min.js',

      /*
       * Add data to the diagram either from GPX or GeoJSON and update the axis domain and data
       */
      addData: function addData(d, layer) {
        var _this = this;

        this.lazyLoad(this.__D3).then(function () {
          if (typeof layer === "undefined" && d.on) {
            layer = d;
          }

          _this._addData(d);

          _this._addLayer(layer);

          _this._fireEvt("eledata_added", {
            data: d,
            layer: layer,
            track_info: _this.track_info
          });
        });
      },

      /**
       * Adds the control to the given map.
       */
      addTo: function addTo(map) {
        if (this.options.detached) {
          var eleDiv = this._initElevationDiv();

          if (!eleDiv.isConnected) insert(map.getContainer(), eleDiv, 'afterend');

          append(eleDiv, this.onAdd(map));
        } else {
          L.Control.prototype.addTo.call(this, map);
        }

        return this;
      },

      /*
       * Reset data and display
       */
      clear: function clear() {
        if (this._marker) this._marker.remove();
        if (this._chart) this._clearChart();
        if (this._layers) this._clearLayers();
        if (this._markers) this._clearMarkers();
        this._data = [];
        this.track_info = {};

        this._fireEvt("eledata_clear");

        this._updateChart();
      },
      _clearChart: function _clearChart() {
        var _this2 = this;

        if (this._events && this._events.elechart_updated) {
          this._events.elechart_updated.forEach(function (e) {
            return _this2.off('elechart_updated', e.fn, e.ctx);
          });
        }

        if (this._chart && this._chart._container) {
          this._chart._container.selectAll('g.point .point').remove();

          this._chart.clear();
        }
      },
      _clearLayers: function _clearLayers() {
        if (this._layers && this._layers.eachLayer) {
          this._layers.eachLayer(function (l) {
            return l.remove();
          });

          this._layers.clearLayers();
        }
      },
      _clearMarkers: function _clearMarkers() {
        if (this._markers && this._markers.eachLayer) {
          this._markers.eachLayer(function (l) {
            return l.remove();
          });

          this._markers.clearLayers();
        }
      },

      /**
       * TODO: Create a base class to handle custom data attributes (heart rate, cadence, temperature, ...)
       * 
       * @link https://leafletjs.com/examples/extending/extending-3-controls.html#handlers
       */
      // addHandler: function (name, HandlerClass) {
      // 	if (HandlerClass) {
      // 		let handler = this[name] = new HandlerClass(this);
      // 		this.handlers.push(handler);
      // 		if (this.options[name]) {
      // 			handler.enable();
      // 		}
      // 	}
      // 	return this;
      // },

      /**
       * Disable chart brushing.
       */
      disableBrush: function disableBrush() {
        this._chart._brushEnabled = false;

        this._resetDrag();
      },

      /**
       * Enable chart brushing.
       */
      enableBrush: function enableBrush() {
        this._chart._brushEnabled = true;
      },

      /**
       * Disable chart zooming.
       */
      disableZoom: function disableZoom() {
        this._chart._zoomEnabled = false;

        this._chart._resetZoom();
      },

      /**
       * Enable chart zooming.
       */
      enableZoom: function enableZoom() {
        this._chart._zoomEnabled = true;
      },

      /**
       * Sets a map view that contains the given geographical bounds.
       */
      fitBounds: function fitBounds(bounds) {
        bounds = bounds || this.getBounds();
        if (this._map && bounds.isValid()) this._map.fitBounds(bounds);
      },
      getBounds: function getBounds(data) {
        data = data || this._data;
        return L.latLngBounds(data.map(function (d) {
          return d.latlng;
        }));
      },

      /**
       * Get default zoom level (followMarker: true).
       */
      getZFollow: function getZFollow() {
        return this.options.zFollow;
      },

      /**
       * Hide current elevation chart profile.
       */
      hide: function hide() {
        style(this._container, "display", "none");
      },

      /**
       * Initialize chart control "options" and "container".
       */
      initialize: function initialize(options) {
        this._data = [];
        this._layers = L.featureGroup();
        this._markers = L.featureGroup();
        this._markedSegments = L.polyline([]);
        this._chartEnabled = true, this.track_info = {};
        this.handlers = [];
        L.setOptions(this, options);
        if (this.options.followMarker) this._setMapView = L.Util.throttle(this._setMapView, 300, this);
        if (this.options.legend) this.options.margins.bottom += 30;
        if (this.options.theme) this.options.polylineSegments.className += ' ' + this.options.theme;
        if (this.options.wptIcons === true) this.options.wptIcons = Options.wptIcons;
        if (this.options.distanceMarkers === true) this.options.distanceMarkers = Options.distanceMarkers;

        this._markedSegments.setStyle(this.options.polylineSegments); // Leaflet canvas renderer colors


        L.extend(Colors, this.options.colors || {}); // Various stuff

        this._fixCanvasPaths();

        this._fixTooltipSize();
      },

      /**
       * Javascript scripts downloader (lazy loader)
       */
      lazyLoad: function lazyLoad(src) {
        var condition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var loader = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        if (!this.options.lazyLoadJS) {
          return Promise.resolve();
        }

        switch (src) {
          case this.__D3:
            loader = '_d3LazyLoader';
            condition = (typeof d3 === "undefined" ? "undefined" : _typeof(d3)) !== 'object';
            break;

          case this.__TOGEOJSON:
            loader = '_togeojsonLazyLoader';
            condition = (typeof toGeoJSON === "undefined" ? "undefined" : _typeof(toGeoJSON)) !== 'object';
            break;

          case this.__LGEOMUTIL:
            loader = '_geomutilLazyLoader';
            condition = _typeof(L.GeometryUtil) !== 'object';
            break;

          case this.__LALMOSTOVER:
            loader = '_almostoverLazyLoader';
            condition = typeof L.Handler.AlmostOver !== 'function';
            break;

          case this.__LDISTANCEM:
            loader = '_distanceMarkersLazyLoader';
            condition = typeof L.DistanceMarkers !== 'function';
            break;
        }

        return L.Control.Elevation[loader] = lazyLoader(src, condition, L.Control.Elevation[loader]);
      },

      /**
       * Load elevation data (GPX, GeoJSON, KML or TCX).
       */
      load: function load(data) {
        var _this3 = this;

        this._parseFromString(data).then(function (geojson) {
          return geojson ? _this3._loadLayer(geojson) : _this3._loadFile(data);
        });
      },

      /**
       * Create container DOM element and related event listeners.
       * Called on control.addTo(map).
       */
      onAdd: function onAdd(map) {
        var _this4 = this;

        this._map = map;

        var container = this._container = create("div", "elevation-control elevation " + this.options.theme + " " + (this.options.detached ? '' : 'leaflet-control'));

        this.lazyLoad(this.__D3).then(function () {
          _this4._initButton(container);

          _this4._initChart(container);

          _this4._initSummary(container);

          _this4._initMarker(map);

          _this4._initLayer(map);

          map.on('zoom viewreset zoomanim', _this4._hideMarker, _this4).on('resize', _this4._resetView, _this4).on('resize', _this4._resizeChart, _this4).on('rotate', _this4._rotateMarker, _this4).on('mousedown', _this4._resetDrag, _this4);

          on(map.getContainer(), 'mousewheel', _this4._resetDrag, _this4);

          on(map.getContainer(), 'touchstart', _this4._resetDrag, _this4);

          on(document, 'keydown', _this4._keydownHandler, _this4);

          _this4.on('eledata_added eledata_loaded', _this4._updateChart, _this4).on('eledata_added eledata_loaded', _this4._updateSummary, _this4);

          _this4._updateChart();

          _this4._updateSummary();
        });
        return container;
      },

      /**
       * Clean up control code and related event listeners.
       * Called on control.remove().
       */
      onRemove: function onRemove(map) {
        this._container = null;
        map.off('zoom viewreset zoomanim', this._hideMarker, this).off('resize', this._resetView, this).off('resize', this._resizeChart, this).off('mousedown', this._resetDrag, this);

        off(map.getContainer(), 'mousewheel', this._resetDrag, this);

        off(map.getContainer(), 'touchstart', this._resetDrag, this);

        off(document, 'keydown', this._keydownHandler, this);

        this.off('eledata_added eledata_loaded', this._updateChart, this).off('eledata_added eledata_loaded', this._updateSummary, this);
      },

      /**
       * Redraws the chart control. Sometimes useful after screen resize.
       */
      redraw: function redraw() {
        this._resizeChart();
      },

      /**
       * Set default zoom level (followMarker: true).
       */
      setZFollow: function setZFollow(zoom) {
        this.options.zFollow = zoom;
      },

      /**
       * Hide current elevation chart profile.
       */
      show: function show() {
        style(this._container, "display", "block");
      },

      /*
       * Parsing data either from GPX or GeoJSON and update the diagram data
       */
      _addData: function _addData(d) {
        var _this5 = this;

        if (!d) {
          return;
        }
        /**
         * Standard GeoJSON --> doesn't handle "time", "heart", …
         */


        var geom = d.geometry;

        if (geom) {
          switch (geom.type) {
            case 'LineString':
              this._addGeoJSONData(geom.coordinates);

              break;

            case 'MultiLineString':
              each(geom.coordinates, function (coords) {
                return _this5._addGeoJSONData(coords);
              });

              break;

            default:
              console.warn('Unsopperted GeoJSON feature geometry type:' + geom.type);
          }
        }

        if (d.type === "FeatureCollection") {
          each(d.features, function (feature) {
            return _this5._addData(feature);
          });
        }
        /**
         * Extended GeoJSON --> rely on leaflet implementation
         */


        if (d._latlngs) {
          this._addGeoJSONData(d._latlngs, d.feature && d.feature.properties);
        }
      },

      /*
       * Parsing of GeoJSON data lines and their elevation in z-coordinate
       */
      _addGeoJSONData: function _addGeoJSONData(coords, properties) {
        var _this6 = this;

        coords.forEach(function (point, i) {
          var _point$meta, _point$lat, _point$lng, _ref, _point$alt;

          // Inspired by L.GPX layer properties
          point.meta = (_point$meta = point.meta) !== null && _point$meta !== void 0 ? _point$meta : {
            time: null,
            ele: null,
            hr: null,
            cad: null,
            atemp: null
          }; // "coordinateProperties" property is generated inside "@tmcw/toGeoJSON"

          var props = properties && properties.coordinateProperties || properties;

          _this6.fire("elepoint_init", {
            point: point,
            props: props,
            id: i
          });

          _this6._addPoint((_point$lat = point.lat) !== null && _point$lat !== void 0 ? _point$lat : point[1], (_point$lng = point.lng) !== null && _point$lng !== void 0 ? _point$lng : point[0], (_ref = (_point$alt = point.alt) !== null && _point$alt !== void 0 ? _point$alt : point.meta.ele) !== null && _ref !== void 0 ? _ref : point[2]);

          _this6.fire("elepoint_added", {
            point: point,
            index: _this6._data.length - 1
          });
        });
        this.fire("eletrack_added", {
          coords: coords,
          index: this._data.length - 1
        });
      },

      /*
       * Parse and push a single (x, y, z) point to current elevation profile.
       */
      _addPoint: function _addPoint(x, y, z) {
        if (this.options.reverseCoords) {
          var _ref2 = [y, x];
          x = _ref2[0];
          y = _ref2[1];
        }

        this._data.push({
          x: x,
          y: y,
          z: z,
          latlng: L.latLng(x, y, z)
        });

        this.fire("eledata_updated", {
          index: this._data.length - 1
        });
      },
      _addLayer: function _addLayer(layer) {
        if (layer) this._layers.addLayer(layer); // Postpone adding the distance markers (lazy: true)

        if (layer && this.options.distanceMarkers && this.options.distanceMarkers.lazy) {
          layer.on('add remove', function (e) {
            return L.DistanceMarkers && e.target instanceof L.Polyline && e.target[e.type + 'DistanceMarkers']();
          });
        }
      },
      _addMarker: function _addMarker(marker) {
        if (marker) this._markers.addLayer(marker);
      },

      /**
       * Initialize "L.AlmostOver" integration
       */
      _initAlmostOverHandler: function _initAlmostOverHandler(map, layer) {
        var _this7 = this;

        if (!map || !this.options.almostOver) return;
        this.lazyLoad(this.__LGEOMUTIL).then(function () {
          return _this7.lazyLoad(_this7.__LALMOSTOVER);
        }).then(function () {
          map.addHandler('almostOver', L.Handler.AlmostOver);

          if (L.GeometryUtil && map.almostOver && map.almostOver.enabled()) {
            map.almostOver.addLayer(layer);
            map.on('almost:move', function (e) {
              return _this7._mousemoveLayerHandler(e);
            }).on('almost:out', function (e) {
              return _this7._mouseoutHandler(e);
            });
          }
        });
      },

      /**
       * Initialize "L.DistanceMarkers" integration
       */
      _initDistanceMarkers: function _initDistanceMarkers(map, layer) {
        var _this8 = this;

        if (!map) return;

        if (this.options.distanceMarkers) {
          this.lazyLoad(this.__LGEOMUTIL).then(function () {
            return _this8.lazyLoad(_this8.__LDISTANCEM);
          }).then(function () {
            return _this8.options.polyline && layer.addTo(map);
          });
        } else if (this.options.polyline) {
          layer.addTo(map);
        }
      },

      /**
       * Adds the control to the given "detached" div.
       */
      _initElevationDiv: function _initElevationDiv() {
        var eleDiv = select(this.options.elevationDiv);

        if (!eleDiv) {
          this.options.elevationDiv = '#elevation-div_' + randomId();
          eleDiv = create('div', 'leaflet-control elevation elevation-div', {
            id: this.options.elevationDiv.substr(1)
          });
        }

        if (this.options.detached) {
          replaceClass(eleDiv, 'leaflet-control', 'elevation-detached');
        }

        return this.eleDiv = eleDiv;
      },

      /**
       * Initialize "L.AlmostOver" and "L.DistanceMarkers"
       */
      _initMapIntegrations: function _initMapIntegrations(control, layer) {
        var map = control._map;

        if (control._map) {
          map.once('layeradd', function (e) {
            return control.options.autofitBounds && control.fitBounds(layer.getBounds());
          });

          if (!L.Browser.mobile) {
            control._initAlmostOverHandler(map, layer);

            control._initDistanceMarkers(map, layer);
          } else if (control.options.polyline) {
            layer.addTo(map);
          }
        } else {
          console.warn("Undefined elevation map object");
        }
      },

      /*
       * Collapse current chart control.
       */
      _collapse: function _collapse() {
        replaceClass(this._container, 'elevation-expanded', 'elevation-collapsed');
      },

      /*
       * Expand current chart control.
       */
      _expand: function _expand() {
        replaceClass(this._container, 'elevation-collapsed', 'elevation-expanded');
      },

      /**
       * Add some basic colors to leaflet canvas renderer (preferCanvas: true).
       */
      _fixCanvasPaths: function _fixCanvasPaths() {
        var oldProto = L.Canvas.prototype._fillStroke;
        var control = this;
        L.Canvas.include({
          _fillStroke: function _fillStroke(ctx, layer) {
            if (control._layers.hasLayer(layer)) {
              var theme = control.options.theme.replace('-theme', '');
              var color = Colors[theme] || {};
              var options = layer.options;
              options.color = color.line || color.area || theme;
              options.stroke = !!options.color;
              oldProto.call(this, ctx, layer);

              if (options.stroke && options.weight !== 0) {
                var oldVal = ctx.globalCompositeOperation || 'source-over';
                ctx.globalCompositeOperation = 'destination-over';
                ctx.strokeStyle = color.outline || '#FFF';
                ctx.lineWidth = options.weight * 1.75;
                ctx.stroke();
                ctx.globalCompositeOperation = oldVal;
              }
            } else {
              oldProto.call(this, ctx, layer);
            }
          }
        });
      },

      /**
       * Partial fix for initial tooltip size
       * 
       * @link https://github.com/Raruto/leaflet-elevation/issues/81#issuecomment-713477050
       */
      _fixTooltipSize: function _fixTooltipSize() {
        var _this9 = this;

        this.on('elechart_init', function () {
          return _this9.once('elechart_change elechart_hover', function (e) {
            if (_this9._chartEnabled) {
              _this9._chart._showDiagramIndicator(e.data, e.xCoord);

              _this9._chart._showDiagramIndicator(e.data, e.xCoord);
            }

            _this9._updateMarker(e.data);
          });
        });
      },

      /*
       * Finds a data entry for the given LatLng
       */
      _findItemForLatLng: function _findItemForLatLng(latlng) {
        return this._data[this._chart._findIndexForLatLng(latlng)];
      },

      /*
       * Finds a data entry for the given xDiagCoord
       */
      _findItemForX: function _findItemForX(x) {
        return this._data[this._chart._findIndexForXCoord(x)];
      },

      /**
       * Fires an event of the specified type.
       */
      _fireEvt: function _fireEvt(type, data, propagate) {
        if (this.fire) this.fire(type, data, propagate);
        if (this._map) this._map.fire(type, data, propagate);
      },

      /**
       * Calculates chart height.
       */
      _height: function _height() {
        if (this._chart) return this._chart._height();
        var opts = this.options;
        return opts.height - opts.margins.top - opts.margins.bottom;
      },

      /*
       * Hides the position/height indicator marker drawn onto the map
       */
      _hideMarker: function _hideMarker() {
        if (this.options.autohideMarker) {
          this._marker.remove();
        }
      },

      /**
       * Generate "svg" chart (DOM element).
       */
      _initChart: function _initChart(container) {
        var opts = this.options;
        opts.xTicks = this._xTicks();
        opts.yTicks = this._yTicks();

        if (opts.detached) {
          var _this$eleDiv = this.eleDiv,
              offsetWidth = _this$eleDiv.offsetWidth,
              offsetHeight = _this$eleDiv.offsetHeight;
          if (offsetWidth > 0) opts.width = offsetWidth;
          if (offsetHeight > 20) opts.height = offsetHeight - 20; // 20 = horizontal scrollbar size.
        } else {
          var _this$_map$getContain = this._map.getContainer(),
              clientWidth = _this$_map$getContain.clientWidth;

          opts._maxWidth = opts._maxWidth > opts.width ? opts._maxWidth : opts.width;
          this._container.style.maxWidth = opts._maxWidth + 'px';
          if (opts._maxWidth > clientWidth) opts.width = clientWidth - 30;
        }

        var chart = this._chart = new Chart$1(opts, this);
        this._x = this._chart._x;
        this._y = this._chart._y;
        d3.select(container).call(chart.render());
        chart.on('reset_drag', this._hideMarker, this).on('mouse_enter', this._mouseenterHandler, this).on('dragged', this._dragendHandler, this).on('mouse_move', this._mousemoveHandler, this).on('mouse_out', this._mouseoutHandler, this).on('ruler_filter', this._rulerFilterHandler, this).on('zoom', this._updateChart, this).on('elepath_toggle', this._toggleChartHandler, this).on('margins_updated', this._resizeChart, this);
        this.fire("elechart_axis");
        if (this.options.legend) this.fire("elechart_legend");
        this.fire("elechart_init");
      },
      _initLayer: function _initLayer() {
        var _this10 = this;

        this._layers.on('layeradd layerremove', function (e) {
          var layer = e.layer;
          var node = layer.getElement && layer.getElement();

          toggleClass(node, _this10.options.polyline.className + ' ' + _this10.options.theme, e.type == 'layeradd');

          toggleEvent(layer, "mousemove", _this10._mousemoveLayerHandler.bind(_this10), e.type == 'layeradd');

          toggleEvent(layer, "mouseout", _this10._mouseoutHandler.bind(_this10), e.type == 'layeradd');
        });
      },
      _initMarker: function _initMarker(map) {
        var pane = map.getPane('elevationPane');

        if (!pane) {
          pane = this._pane = map.createPane('elevationPane', map.getPane('norotatePane') || map.getPane('mapPane'));
          pane.style.zIndex = 625; // This pane is above markers but below popups.

          pane.style.pointerEvents = 'none';
        }

        if (this._renderer) this._renderer.remove();
        this._renderer = L.svg({
          pane: "elevationPane"
        }).addTo(this._map); // default leaflet svg renderer

        this._marker = new Marker(this.options);
        this.fire("elechart_marker");
      },

      /**
       * Inspired by L.Control.Layers
       */
      _initButton: function _initButton(container) {
        if (L.Browser.mobile || !this.options.detached) {
          L.DomEvent.disableClickPropagation(container).disableScrollPropagation(container);
        }

        if (!this.options.detached) {
          var link = this._button = create('a', "elevation-toggle elevation-toggle-icon" + (this.options.autohide ? "" : " close-button"), {
            href: '#',
            title: L._('Elevation')
          }, container);

          if (this.options.collapsed) {
            this._collapse();

            if (this.options.autohide) {
              on(container, 'mouseover', this._expand, this);

              on(container, 'mouseout', this._collapse, this);
            } else {
              on(link, 'click', L.DomEvent.stop);

              on(link, 'click', this._toggle, this);
            }

            on(link, 'focus', this._toggle, this);

            this._map.on('click', this._collapse, this);
          }
        }
      },
      _initSummary: function _initSummary(container) {
        this._summary = new Summary({
          summary: this.options.summary
        }, this);
        d3.select(container).call(this._summary.render());
      },
      _keydownHandler: function _keydownHandler(e) {
        if (!this.options.detached && e.key === "Escape") {
          this._collapse();
        }
      },

      /**
       * Retrieve data from a remote url (HTTP).
       */
      _loadFile: function _loadFile(url) {
        var _this11 = this;

        fetch(url).then(function (response) {
          return response.text();
        }).then(function (data) {
          _this11._downloadURL = url; // TODO: handle multiple urls?

          _this11._parseFromString(data).then(function (geojson) {
            return geojson && _this11._loadLayer(geojson);
          });
        }).catch(function (err) {
          return console.warn(err);
        });
      },

      /**
       * Simple GeoJSON data loader (L.GeoJSON).
       */
      _loadLayer: function _loadLayer(geojson) {
        var control = this;
        var _control$options = control.options,
            wptIcons = _control$options.wptIcons,
            wptLabels = _control$options.wptLabels;
        var layer = L.geoJson(geojson, {
          distanceMarkers: control.options.distanceMarkers,
          style: function style(feature) {
            var style = L.extend({}, control.options.polyline);

            if (control.options.theme) {
              style.className += ' ' + control.options.theme;
            }

            return style;
          },
          pointToLayer: function pointToLayer(feature, latlng) {
            var _prop$desc, _prop$name, _prop$sym;

            if (!control.options.waypoints) return;
            var prop = feature.properties;
            var desc = (_prop$desc = prop.desc) !== null && _prop$desc !== void 0 ? _prop$desc : '';
            var name = (_prop$name = prop.name) !== null && _prop$name !== void 0 ? _prop$name : '';
            var sym = ((_prop$sym = prop.sym) !== null && _prop$sym !== void 0 ? _prop$sym : name).replace(' ', '-').replace('"', '').replace("'", '').toLowerCase(); // Handle chart waypoints (dots)

            if ([true, 'dots'].includes(control.options.waypoints)) {
              control._registerCheckPoint({
                latlng: latlng,
                label: [true, 'dots'].includes(wptLabels) ? name : ''
              });
            } // Handle map waypoints (markers)


            if ([true, 'markers'].includes(control.options.waypoints) && wptIcons != false) {
              // generate and cache appropriate icon symbol
              if (!wptIcons.hasOwnProperty(sym)) {
                wptIcons[sym] = L.divIcon(L.extend({}, wptIcons[""].options, {
                  html: '<i class="elevation-waypoint-icon ' + sym + '"></i>'
                }));
              }

              var marker = L.marker(latlng, {
                icon: wptIcons[sym]
              });

              if ([true, 'markers'].includes(wptLabels) && (name || desc)) {
                var content = decodeURI("<b>" + name + "</b>" + (desc.length > 0 ? '<br>' + desc : ''));
                marker.bindPopup(content, {
                  className: 'elevation-popup',
                  keepInView: true
                }).openPopup();
                marker.bindTooltip(content, {
                  className: 'elevation-tooltip',
                  direction: 'auto',
                  sticky: true,
                  opacity: 1
                }).openTooltip();
              }

              control._addMarker(marker);

              control.fire('waypoint_added', {
                point: marker,
                element: latlng,
                properties: prop
              });
              return marker;
            }
          },
          onEachFeature: function onEachFeature(feature, layer) {
            if (feature.geometry && feature.geometry.type != 'Point') {
              control.addData(layer);
              control.track_info = L.extend({}, control.track_info, {
                name: geojson.name
              });
            }
          }
        });
        control.lazyLoad(control.__D3).then(function () {
          control._initMapIntegrations(control, layer);

          control._fireEvt("eledata_loaded", {
            data: geojson,
            layer: layer,
            name: control.track_info.name,
            track_info: control.track_info
          });
        });
        return layer;
      },
      _dragendHandler: function _dragendHandler(e) {
        this._hideMarker();

        this.fitBounds(L.latLngBounds([e.dragstart.latlng, e.dragend.latlng]));
        this.fire("elechart_dragged");
      },

      /**
       * Trigger mouseenter event
       */
      _mouseenterHandler: function _mouseenterHandler(e) {
        this.fire('elechart_enter');
      },

      /*
       * Handles the moueseover the chart and displays distance and altitude level.
       */
      _mousemoveHandler: function _mousemoveHandler(e) {
        if (!this._data.length || !this._chartEnabled) {
          return;
        }

        var item = this._findItemForX(e.xCoord);

        if (item) {
          var xCoord = e.xCoord;
          if (this._chartEnabled) this._chart._showDiagramIndicator(item, xCoord);

          this._updateMarker(item);

          this._setMapView(item);

          if (this._map) {
            addClass(this._map.getContainer(), 'elechart-hover');
          }

          this.fire("elechart_change", {
            data: item,
            xCoord: xCoord
          });
          this.fire("elechart_hover", {
            data: item,
            xCoord: xCoord
          });
        }
      },

      /*
       * Handles mouseover events of the data layers on the map.
       */
      _mousemoveLayerHandler: function _mousemoveLayerHandler(e) {
        if (!this._data.length) {
          return;
        }

        var item = this._findItemForLatLng(e.latlng);

        if (item) {
          var xCoord = item.xDiagCoord;
          if (this._chartEnabled) this._chart._showDiagramIndicator(item, xCoord);

          this._updateMarker(item);

          this.fire("elechart_change", {
            data: item,
            xCoord: xCoord
          });
        }
      },

      /*
       * Handles the moueseout over the chart.
       */
      _mouseoutHandler: function _mouseoutHandler() {
        if (!this.options.detached) {
          this._hideMarker();

          this._chart._hideDiagramIndicator();
        }

        if (this._map) {
          removeClass(this._map.getContainer(), 'elechart-hover');
        }

        this.fire("elechart_leave");
      },

      /**
       * Simple GeoJSON Parser
       */
      _parseFromGeoJSONString: function _parseFromGeoJSONString(data) {
        try {
          return JSON.parse(data);
        } catch (e) {}
      },

      /**
       * Attempt to parse raw response data (GeoJSON or XML > GeoJSON)
       */
      _parseFromString: function _parseFromString(data) {
        var _this12 = this;

        return new Promise(function (resolve) {
          return _this12.lazyLoad(_this12.__TOGEOJSON).then(function () {
            var geojson;

            try {
              geojson = _this12._parseFromXMLString(data.trim());
            } catch (e) {
              geojson = _this12._parseFromGeoJSONString(data.toString());
            }

            if (geojson) {
              geojson = _this12._prepareMultiLineStrings(geojson);
              geojson = _this12._prepareAdditionalProperties(geojson);
            }

            resolve(geojson);
          });
        });
      },

      /**
       * Simple XML Parser (GPX, KML, TCX)
       */
      _parseFromXMLString: function _parseFromXMLString(data) {
        var _Array$from$find;

        if (data.indexOf("<") != 0) {
          throw 'Invalid XML';
        }

        var xml = new DOMParser().parseFromString(data, "text/xml");
        var type = xml.documentElement.tagName.toLowerCase(); // "kml" or "gpx"

        var name = xml.getElementsByTagName('name');

        if (xml.getElementsByTagName('parsererror').length) {
          throw 'Invalid XML';
        }

        if (!(type in toGeoJSON)) {
          type = xml.documentElement.tagName == "TrainingCenterDatabase" ? 'tcx' : 'gpx';
        }

        var geojson = toGeoJSON[type](xml);
        geojson.name = name.length > 0 ? ((_Array$from$find = Array.from(name).find(function (tag) {
          return tag.parentElement.tagName == "trk";
        })) !== null && _Array$from$find !== void 0 ? _Array$from$find : name[0]).textContent : '';
        return geojson;
      },

      /**
       * Extend GeoJSON properties (name, time, ...)
       */
      _prepareAdditionalProperties: function _prepareAdditionalProperties(geojson) {
        if (!geojson.name && this._downloadURL) {
          geojson.name = this._downloadURL.split('/').pop().split('#')[0].split('?')[0];
        }

        return geojson;
      },

      /**
       * Just a temporary fix for MultiLineString data (trk > trkseg + trkseg),
       * just split them into seperate LineStrings (trk > trkseg, trk > trkseg)
       * 
       * @link https://github.com/Raruto/leaflet-elevation/issues/56
       */
      _prepareMultiLineStrings: function _prepareMultiLineStrings(geojson) {
        geojson.features.forEach(function (feauture) {
          if (feauture.geometry.type == "MultiLineString") {
            feauture.geometry.coordinates.forEach(function (coords) {
              geojson.features.push({
                geometry: {
                  type: 'LineString',
                  coordinates: coords
                },
                properties: feauture.properties,
                type: 'Feature'
              });
            });
          }
        });
        return geojson.features.filter(function (feauture) {
          return feauture.geometry.type != "MultiLineString";
        });
      },

      /**
       * Add chart profile to diagram
       */
      _registerAreaPath: function _registerAreaPath(props) {
        var _this13 = this;

        this.on("elechart_init", function () {
          return _this13._chart._registerAreaPath(props);
        });
      },

      /**
       * Add chart grid to diagram
       */
      _registerAxisGrid: function _registerAxisGrid(props) {
        var _this14 = this;

        this.on("elechart_axis", function () {
          return _this14._chart._registerAxisGrid(props);
        });
      },

      /**
       * Add chart axis to diagram
       */
      _registerAxisScale: function _registerAxisScale(props) {
        var _this15 = this;

        this.on("elechart_axis", function () {
          return _this15._chart._registerAxisScale(props);
        });
      },

      /**
       * Add a point of interest over the diagram
       */
      _registerCheckPoint: function _registerCheckPoint(props) {
        var _this16 = this;

        this.on("elechart_updated", function () {
          return _this16._chart._registerCheckPoint(props);
        });
      },

      /**
       * Base handler for iterative track statistics (dist, time, z, slope, speed, acceleration, ...)
       */
      _registerDataAttribute: function _registerDataAttribute(props) {
        var _this17 = this;

        // save here a reference to last used point
        var lastValid = null; // parse of "coordinateProperties" for later usage

        if (props.init) {
          this.on("elepoint_init", function (e) {
            return props.init.call(_this17, e);
          });
        } // iteration


        this.on("elepoint_added", function (e) {
          // check and fix missing data on last added point
          if (props.skipNull === false) {
            var curr = _this17._data[e.index][props.name];

            if (e.index > 0) {
              var prev = _this17._data[e.index - 1][props.name];

              if (isNaN(prev)) {
                if (!isNaN(lastValid) && !isNaN(curr)) {
                  prev = (lastValid + curr) / 2;
                } else if (!isNaN(lastValid)) {
                  prev = lastValid;
                } else if (!isNaN(curr)) {
                  prev = curr;
                }

                if (!isNaN(prev)) return _this17._data.splice(e.index - 1, 1);
                _this17._data[e.index - 1][props.name] = prev;
              }
            } // update reference to last used point (ie. if it has data)


            if (!isNaN(curr)) {
              lastValid = curr;
            }
          } // retrieve point value


          _this17._data[e.index][props.name] = props.fetch.call(_this17, e.index, e.point); // update here some mixins (eg. "track_info", value validators, ...)

          if (props.update) _this17._data[e.index][props.name] = props.update.call(_this17, _this17._data[e.index][props.name], e.index, e.point);
        });
      },

      /**
       * Add chart or marker tooltip info
       */
      _registerTooltip: function _registerTooltip(props) {
        var _this18 = this;

        if (props.chart) {
          var label = L.extend({}, props, {
            value: props.chart
          });
          this.on("elechart_init", function () {
            return _this18._chart._registerTooltip(label);
          });
        }

        if (props.marker) {
          var _label = L.extend({}, props, {
            value: props.marker
          });

          this.on("elechart_marker", function () {
            return _this18._marker._registerTooltip(_label);
          });
        }
      },

      /**
       * Add summary info to diagram
       */
      _registerSummary: function _registerSummary(props) {
        var _this19 = this;

        this.on('elechart_summary', function () {
          return _this19._summary._registerSummary(props);
        });
      },

      /*
       * Removes the drag rectangle and zoms back to the total extent of the data.
       */
      _resetDrag: function _resetDrag() {
        this._chart._resetDrag();

        this._hideMarker();
      },

      /**
       * Resets drag, marker and bounds.
       */
      _resetView: function _resetView() {
        if (this._map && this._map._isFullscreen) return;

        this._resetDrag();

        this._hideMarker();

        if (this.options.autofitBounds) {
          this.fitBounds();
        }
      },

      /**
       * Hacky way for handling chart resize. Deletes it and redraw chart.
       */
      _resizeChart: function _resizeChart() {
        if (!this._container) return; // prevent displaying chart on resize if hidden

        if (style(this._container, "display") == "none") return;
        var opts = this.options;
        var newWidth;

        if (opts.detached) {
          newWidth = (this.eleDiv || this._container).offsetWidth;
        } else {
          var _this$_map$getContain2 = this._map.getContainer(),
              clientWidth = _this$_map$getContain2.clientWidth;

          newWidth = opts._maxWidth > clientWidth ? clientWidth - 30 : opts._maxWidth;
        }

        if (newWidth) {
          var chart = this._chart;
          opts.width = newWidth;

          if (chart && chart._chart) {
            chart._chart._resize(opts);

            opts.xTicks = this._xTicks();
            opts.yTicks = this._yTicks();

            this._updateChart();
          }
        }

        this._updateMapSegments();
      },

      /**
       * Handles the drag event over the ruler filter.
       */
      _rulerFilterHandler: function _rulerFilterHandler(e) {
        this._updateMapSegments(e.coords);
      },

      /**
       * Collapse or Expand chart control.
       */
      _toggle: function _toggle() {
        if (hasClass(this._container, "elevation-expanded")) this._collapse();else this._expand();
      },

      /**
       * Update map center and zoom (followMarker: true)
       */
      _setMapView: function _setMapView(item) {
        if (!this.options.followMarker || !this._map) return;

        var zoom = this._map.getZoom();

        var z = this.options.zFollow;

        if (typeof z === "number") {
          this._map.setView(item.latlng, zoom < z ? z : zoom, {
            animate: true,
            duration: 0.25
          });
        } else if (!this._map.getBounds().contains(item.latlng)) {
          this._map.setView(item.latlng, zoom, {
            animate: true,
            duration: 0.25
          });
        }
      },

      /**
       * Toggle chart data on legend click
       */
      _toggleChartHandler: function _toggleChartHandler(e) {
        var _this20 = this;

        var name = e.name,
            enabled = e.enabled;
        this._chartEnabled = this._chart._hasActiveLayers(); // toggle layer visibility on empty chart

        this._layers.eachLayer(function (layer) {
          return toggleClass(layer.getElement && layer.getElement(), _this20.options.polyline.className + ' ' + _this20.options.theme, _this20._chartEnabled);
        }); // toggle option value (eg. altitude = { 'disabled' || 'disabled' })


        this.options[name] = !enabled && this.options[name] == 'disabled' ? 'enabled' : 'disabled'; // remove marker on empty chart

        if (!this._chartEnabled) {
          this._chart._hideDiagramIndicator();

          this._marker.remove();
        }
      },

      /**
       * Calculates [x, y] domain and then update chart.
       */
      _updateChart: function _updateChart() {
        if (
        /*!this._data.length ||*/
        !this._chart || !this._container) return;
        this.fire("elechart_axis");
        this.fire("elechart_area");

        this._chart.update({
          data: this._data,
          options: this.options
        });

        this._x = this._chart._x;
        this._y = this._chart._y;
        this.fire('elechart_updated');
      },

      /*
       * Update the position/height indicator marker drawn onto the map
       */
      _updateMarker: function _updateMarker(item) {
        if (this._marker) {
          this._marker.update({
            map: this._map,
            item: item,
            maxElevation: this.track_info.elevation_max || 0,
            options: this.options
          });
        }
      },

      /**
       * Fix marker rotation on rotated maps
       */
      _rotateMarker: function _rotateMarker() {
        if (this._marker) {
          this._marker.update();
        }
      },

      /**
       * Highlight track segments on the map.
       */
      _updateMapSegments: function _updateMapSegments(coords) {
        this._markedSegments.setLatLngs(coords || []);

        if (coords && this._map && !this._map.hasLayer(this._markedSegments)) {
          this._markedSegments.addTo(this._map);
        }
      },

      /**
       * Update chart summary.
       */
      _updateSummary: function _updateSummary() {
        var _this21 = this;

        this._summary.reset();

        if (this.options.summary) {
          this.fire("elechart_summary");

          this._summary.update();
        }

        if (this.options.downloadLink && this._downloadURL) {
          // TODO: generate dynamically file content instead of using static file urls.
          this._summary._container.innerHTML += '<span class="download"><a href="#">' + L._('Download') + '</a></span>';

          select('.download a', this._summary._container).onclick = function (e) {
            e.preventDefault();
            var event = {
              downloadLink: _this21.options.downloadLink,
              confirm: saveFile.bind(_this21, _this21._downloadURL)
            };

            if (_this21.options.downloadLink == 'modal' && typeof CustomEvent === "function") {
              document.dispatchEvent(new CustomEvent("eletrack_download", {
                detail: event
              }));
            } else if (_this21.options.downloadLink == 'link' || _this21.options.downloadLink === true) {
              event.confirm();
            }

            _this21.fire('eletrack_download', event);
          };
        }
      },

      /**
       * Calculates chart width.
       */
      _width: function _width() {
        if (this._chart) return this._chart._width();
        var opts = this.options;
        return opts.width - opts.margins.left - opts.margins.right;
      },

      /**
       * Calculate chart xTicks
       */
      _xTicks: function _xTicks() {
        if (this.__xTicks) this.__xTicks = this.options.xTicks;
        return this.__xTicks || Math.round(this._width() / 75);
      },

      /**
       * Calculate chart yTicks
       */
      _yTicks: function _yTicks() {
        if (this.__yTicks) this.__yTicks = this.options.yTicks;
        return this.__yTicks || Math.round(this._height() / 30);
      }
    });

    Elevation.addInitHook(function () {
      var _this = this;

      var opts = this.options;
      var distance = {};

      if (opts.imperial) {
        opts.distanceFactor = this.__mileFactor;
        distance.label = "mi";
      } else {
        opts.distanceFactor = opts.distanceFactor || 1;
        distance.label = opts.xLabel;
      }

      this._registerDataAttribute({
        name: 'dist',
        init: function init() {// this.track_info.distance = 0;
        },
        fetch: function fetch(i) {
          var delta = _this._data[i].latlng.distanceTo(_this._data[i > 0 ? i - 1 : i].latlng) * opts.distanceFactor;
          return Math.round(delta / 1000 * 100000) / 100000; // handles floating points calc
        },
        update: function update(distance) {
          _this.track_info.distance = _this.track_info.distance || 0;
          _this.track_info.distance += distance;
          return _this.track_info.distance;
        }
      });

      if (this.options.distance != "summary") {
        this._registerAxisScale({
          axis: "x",
          position: "bottom",
          scale: "x",
          // this._chart._x,
          label: distance.label,
          labelY: 25,
          labelX: function labelX() {
            return _this._width() + 6;
          },
          name: "distance"
        });
      }

      this._registerAxisGrid({
        axis: "x",
        position: "bottom",
        scale: "x" // this._chart._x,

      });

      this._registerTooltip({
        name: 'x',
        chart: function chart(item) {
          return L._("x: ") + d3.format("." + opts.decimalsX + "f")(item[opts.xAttr]) + " " + distance.label;
        },
        order: 20
      });

      this._registerSummary({
        "totlen": {
          label: "Total Length: ",
          value: function value(track) {
            return (track.distance || 0).toFixed(2) + '&nbsp;' + distance.label;
          },
          order: 10
        }
      });
    });

    Elevation.addInitHook(function () {
      var _this = this;

      var opts = this.options;
      var time = {};
      time.label = opts.timeLabel || 't';
      opts.timeFactor = opts.timeFactor || 3600;
      /**
       * Common AVG speeds:
       * ----------------------
       *  slow walk = 1.8  km/h
       *  walking   = 3.6  km/h <-- default: 3.6
       *  running   = 10.8 km/h
       *  cycling   = 18   km/h
       *  driving   = 72   km/h
       * ----------------------
       */

      this._timeAVGSpeed = (opts.timeAVGSpeed || 3.6) * (opts.speedFactor || 1);

      if (!opts.timeFormat) {
        opts.timeFormat = function (time) {
          return new Date(time).toLocaleString().replaceAll('/', '-').replaceAll(',', ' ');
        };
      } else if (opts.timeFormat == 'time') {
        opts.timeFormat = function (time) {
          return new Date(time).toLocaleTimeString();
        };
      } else if (opts.timeFormat == 'date') {
        opts.timeFormat = function (time) {
          return new Date(time).toLocaleDateString();
        };
      }

      opts.xTimeFormat = opts.xTimeFormat || function (t) {
        return formatTime(t).split("'")[0];
      };

      this._registerDataAttribute({
        name: 'time',
        init: function init(_ref) {
          var point = _ref.point,
              props = _ref.props,
              id = _ref.id;

          // "coordinateProperties" property is generated inside "@tmcw/toGeoJSON"
          if (props) {
            if ("coordTimes" in props) point.meta.time = new Date(Date.parse(props.coordTimes[id]));else if ("times" in props) point.meta.time = new Date(Date.parse(props.times[id]));else if ("time" in props) point.meta.time = new Date(Date.parse(_typeof(props.time) === 'object' ? props.time[id] : props.time));
          }
        },
        fetch: function fetch(i, point) {
          // Add missing timestamps (see: options.timeAVGSpeed)
          if (!point.meta || !point.meta.time) {
            point.meta = point.meta || {};

            if (i > 0) {
              var dx = this._data[i].dist - this._data[i - 1].dist;

              var t0 = this._data[i - 1].time.getTime();

              var dt = dx / this._timeAVGSpeed * this.options.timeFactor * 1000;
              point.meta.time = new Date(t0 + dt);
            } else {
              point.meta.time = new Date(Date.now());
            }
          }

          var time = point.meta.time; // Handle timezone offset

          if (time.getTime() - time.getTimezoneOffset() * 60 * 1000 === 0) {
            time = 0;
          }

          return time;
        },
        update: function update(time, i) {
          this.track_info.time = (this.track_info.time || 0) + Math.abs(this._data[i].time - this._data[i > 0 ? i - 1 : i].time);
          this._data[i].duration = this.track_info.time;
          return time;
        }
      });

      if (opts.time && opts.time != "summary" && !L.Browser.mobile) {
        this._registerAxisScale({
          axis: "x",
          position: "top",
          scale: {
            attr: "duration",
            min: 0
          },
          label: time.label,
          labelY: -10,
          labelX: function labelX() {
            return _this._width();
          },
          name: "time",
          tickFormat: function tickFormat(d) {
            return d == 0 ? '' : opts.xTimeFormat(d);
          },
          onAxisMount: function onAxisMount(axis) {
            axis.select(".domain").remove();
            axis.selectAll("text").attr('opacity', 0.65).style('font-family', 'Monospace').style('font-size', '110%');
            axis.selectAll(".tick line").attr('y2', _this._height()).attr('stroke-dasharray', 2).attr('opacity', 0.75);
          }
        });
      }

      if (this.options.timestamps) {
        this._registerTooltip({
          name: 'date',
          chart: function chart(item) {
            return L._("t: ") + _this.options.timeFormat(item.time);
          },
          order: 20
        });
      }

      if (this.options.time) {
        this._registerTooltip({
          name: 'time',
          chart: function chart(item) {
            return L._("T: ") + formatTime(item.duration || 0);
          },
          order: 20
        });

        this._registerSummary({
          "tottime": {
            label: "Total Time: ",
            value: function value(track) {
              return formatTime(track.time || 0);
            },
            order: 20
          }
        });
      }
    });

    Elevation.addInitHook(function () {
      var _this = this;

      var opts = this.options;
      var altitude = {};
      var theme = opts.theme.replace('-theme', '');
      var color = Colors[theme] || {};

      if (opts.imperial) {
        opts.altitudeFactor = this.__footFactor;
        altitude.label = "ft";
      } else {
        opts.altitudeFactor = opts.heightFactor || opts.altitudeFactor || 1;
        altitude.label = opts.yLabel;
      }

      this._registerDataAttribute({
        name: 'z',
        skipNull: this.options.skipNullZCoords,
        init: function init(_ref) {
          var point = _ref.point;
          // "alt" property is generated inside "leaflet"
          if ("alt" in point) point.meta.ele = point.alt; // this.track_info.elevation_max = -Infinity;
          // this.track_info.elevation_min = +Infinity;
          // this.track_info.elevation_avg = 0;
        },
        fetch: function fetch(i) {
          return _this._data[i].z * opts.altitudeFactor;
        },
        update: function update(z, i) {
          _this.track_info.elevation_max = _this.track_info.elevation_max || -Infinity;
          _this.track_info.elevation_min = _this.track_info.elevation_max || +Infinity;
          _this.track_info.elevation_avg = _this.track_info.elevation_avg || 0;
          var data = _this._data;
          var track = _this.track_info; // Try to smooth "crazy" elevation values.

          if (_this.options.altitudeDeltaMax) {
            var delta = z - data[i > 0 ? i - 1 : i].z;
            var deltaMax = _this.options.altitudeDeltaMax;

            if (Math.abs(delta) > deltaMax) {
              z = data[i - 1].z + deltaMax * Math.sign(delta);
            }
          } // Range of acceptable elevation values.


          z = clamp(z, _this.options.altitudeRange);
          if (z > track.elevation_max) track.elevation_max = z;
          if (z < track.elevation_min) track.elevation_min = z;
          track.elevation_avg = (z + track.elevation_avg) / 2.0;
          return z;
        }
      });

      this._registerAxisScale({
        axis: "y",
        position: "left",
        scale: "y",
        // this._chart._y,
        label: altitude.label,
        labelX: -3,
        labelY: -8,
        name: "altitude",
        visbile: this.options.altitude != "summary"
      });

      this._registerAxisGrid({
        axis: "y",
        position: "left",
        scale: "y" // this._chart._y,

      });

      this._registerAreaPath({
        name: 'altitude',
        label: 'Altitude',
        scaleX: 'distance',
        scaleY: 'altitude',
        color: color.area || theme,
        strokeColor: opts.detached ? color.stroke : '#000',
        strokeOpacity: "1",
        fillOpacity: opts.detached ? color.alpha || '0.8' : 1,
        preferCanvas: opts.preferCanvas,
        visbile: this.options.altitude != "summary"
      });

      this._registerTooltip({
        name: 'y',
        chart: function chart(item) {
          return L._("y: ") + d3.format("." + opts.decimalsY + "f")(item[opts.yAttr]) + " " + altitude.label;
        },
        marker: function marker(item) {
          return d3.format("." + opts.decimalsY + "f")(item[opts.yAttr]) + " " + altitude.label;
        },
        order: 10
      });

      this._registerSummary({
        "maxele": {
          label: "Max Elevation: ",
          value: function value(track) {
            return (track.elevation_max || 0).toFixed(2) + '&nbsp;' + altitude.label;
          },
          order: 30
        },
        "minele": {
          label: "Min Elevation: ",
          value: function value(track) {
            return (track.elevation_min || 0).toFixed(2) + '&nbsp;' + altitude.label;
          },
          order: 30
        },
        "avgele": {
          label: "Avg Elevation: ",
          value: function value(track) {
            return (track.elevation_avg || 0).toFixed(2) + '&nbsp;' + altitude.label;
          },
          order: 30
        }
      });
    });

    Elevation.addInitHook(function () {
      var _this = this;

      if (!this.options.slope) return;
      var opts = this.options;
      var slope = {};
      slope.label = opts.slopeLabel || '%';

      this._registerDataAttribute({
        name: 'slope',
        // init: () => {
        // 	// this.track_info.ascent    = 0;         // Total Ascent
        // 	// this.track_info.descent   = 0;         // Total Descent
        // 	// this.track_info.slope_max = -Infinity; // Slope Max
        // 	// this.track_info.slope_min = +Infinity; // Slope Min
        // 	// this.track_info.slope_avg = 0;         // Acceleration Avg
        // },
        fetch: function fetch(i) {
          var data = _this._data;
          var dx = (data[i].dist - data[i > 0 ? i - 1 : i].dist) * 1000;
          var dz = data[i].z - data[i > 0 ? i - 1 : i].z;
          return !isNaN(dz) && dx !== 0 ? dz / dx * 100 : 0; // slope in % = ( height / length ) * 100;
        },
        update: function update(slope, i) {
          _this.track_info.ascent = _this.track_info.ascent || 0; // Total Ascent

          _this.track_info.descent = _this.track_info.descent || 0; // Total Descent

          _this.track_info.slope_max = _this.track_info.slope_max || -Infinity; // Slope Max

          _this.track_info.slope_min = _this.track_info.slope_min || +Infinity; // Slope Min

          _this.track_info.slope_avg = _this.track_info.slope_avg || 0; // Acceleration Avg

          var track = _this.track_info;
          var data = _this._data;
          var dz = data[i].z - data[i > 0 ? i - 1 : i].z; // Try to smooth "crazy" acceleration values.

          if (_this.options.slopeDeltaMax) {
            var delta = slop - data[i > 0 ? i - 1 : i].slope;
            var deltaMax = _this.options.slopeDeltaMax;

            if (Math.abs(delta) > deltaMax) {
              slope = data[i - 1].slope + deltaMax * Math.sign(delta);
            }
          } // Range of acceptable slope values.


          slope = clamp(slope, _this.options.slopeRange);
          if (dz > 0) _this.track_info.ascent += dz;else if (dz < 0) _this.track_info.descent -= dz;
          if (slope > track.slope_max) track.slope_max = slope;
          if (slope < track.slope_min) track.slope_min = slope;
          track.slope_avg = (slope + track.slope_avg) / 2.0;
          return L.Util.formatNum(slope, 2);
        }
      });

      this._registerAxisScale({
        axis: "y",
        position: "right",
        scale: {
          min: -1,
          max: +1
        },
        tickPadding: 16,
        label: slope.label,
        labelX: 25,
        labelY: -8,
        name: 'slope',
        visbile: this.options.slope != "summary"
      });

      this._registerAreaPath({
        name: 'slope',
        label: 'Slope',
        yAttr: 'slope',
        scaleX: 'distance',
        scaleY: 'slope',
        color: '#F00',
        strokeColor: '#000',
        strokeOpacity: "0.5",
        fillOpacity: "0.25",
        visbile: this.options.slope != "summary"
      });

      this._registerTooltip({
        name: 'slope',
        chart: function chart(item) {
          return L._("m: ") + item.slope + slope.label;
        },
        marker: function marker(item) {
          return Math.round(item.slope) + slope.label;
        },
        order: 40
      });

      this._registerSummary({
        "ascent": {
          label: "Total Ascent: ",
          value: function value(track) {
            return Math.round(track.ascent || 0) + '&nbsp;' + (_this.options.imperial ? 'ft' : 'm');
          },
          order: 40
        },
        "descent": {
          label: "Total Descent: ",
          value: function value(track) {
            return Math.round(track.descent || 0) + '&nbsp;' + (_this.options.imperial ? 'ft' : 'm');
          },
          order: 40
        },
        "minslope": {
          label: "Min Slope: ",
          value: function value(track) {
            return Math.round(track.slope_min || 0) + '&nbsp;' + slope.label;
          },
          order: 40
        },
        "maxslope": {
          label: "Max Slope: ",
          value: function value(track) {
            return Math.round(track.slope_max || 0) + '&nbsp;' + slope.label;
          },
          order: 40
        },
        "avgslope": {
          label: "Avg Slope: ",
          value: function value(track) {
            return Math.round(track.slope_avg || 0) + '&nbsp;' + slope.label;
          },
          order: 40
        }
      });
    });

    Elevation.addInitHook(function () {
      var _this = this;

      if (!this.options.speed && !this.options.acceleration) return;
      var opts = this.options;
      var speed = {};
      speed.label = opts.speedLabel || L._(opts.imperial ? 'mph' : 'km/h');
      opts.speedFactor = opts.speedFactor || 1;

      this._registerDataAttribute({
        name: 'speed',
        init: function init() {// this.track_info.speed_max = -Infinity; // Speed Max
          // this.track_info.speed_min = +Infinity; // Speed Min
          // this.track_info.speed_avg = 0;         // Speed Avg
        },
        fetch: function fetch(i) {
          var data = _this._data;
          var dx = (data[i].dist - data[i > 0 ? i - 1 : i].dist) * 1000;
          var dt = data[i].time - data[i > 0 ? i - 1 : i].time;
          return dt > 0 ? Math.abs(dx / dt * opts.timeFactor) * opts.speedFactor : 0;
        },
        update: function update(speed, i) {
          _this.track_info.speed_max = _this.track_info.speed_max || -Infinity; // Speed Max

          _this.track_info.speed_min = _this.track_info.speed_min || +Infinity; // Speed Min

          _this.track_info.speed_avg = _this.track_info.speed_avg || 0; // Speed Avg

          var data = _this._data;
          var track = _this.track_info; // Try to smooth "crazy" speed values.

          if (_this.options.speedDeltaMax) {
            var delta = speed - data[i > 0 ? i - 1 : i].speed;
            var deltaMax = _this.options.speedDeltaMax;

            if (Math.abs(delta) > deltaMax) {
              speed = data[i - 1].speed + deltaMax * Math.sign(delta);
            }
          } // Range of acceptable speed values.


          speed = clamp(speed, _this.options.speedRange);
          if (speed > track.speed_max) track.speed_max = speed;
          if (speed < track.speed_min) track.speed_min = speed;
          track.speed_avg = (speed + track.speed_avg) / 2.0;
          return L.Util.formatNum(speed, 2);
        }
      });

      if (this.options.speed && this.options.speed != "summary") {
        this._registerAxisScale({
          axis: "y",
          position: "right",
          scale: {
            min: 0,
            max: +1
          },
          tickPadding: 16,
          label: speed.label,
          labelX: 25,
          labelY: -8,
          name: "speed"
        });

        this._registerAreaPath({
          name: 'speed',
          label: 'Speed',
          yAttr: "speed",
          scaleX: 'distance',
          scaleY: 'speed',
          color: '#03ffff',
          strokeColor: '#000',
          strokeOpacity: "0.5",
          fillOpacity: "0.25"
        });
      }

      if (this.options.speed) {
        this._registerTooltip({
          name: 'speed',
          chart: function chart(item) {
            return L._('v: ') + item.speed + " " + speed.label;
          },
          marker: function marker(item) {
            return Math.round(item.speed) + " " + speed.label;
          },
          order: 50
        });

        this._registerSummary({
          "minspeed": {
            label: "Min Speed: ",
            value: function value(track) {
              return Math.round(track.speed_min || 0) + '&nbsp;' + speed.label;
            },
            order: 50
          },
          "maxspeed": {
            label: "Max Speed: ",
            value: function value(track) {
              return Math.round(track.speed_max || 0) + '&nbsp;' + speed.label;
            },
            order: 50
          },
          "avgspeed": {
            label: "Avg Speed: ",
            value: function value(track) {
              return Math.round(track.speed_avg || 0) + '&nbsp;' + speed.label;
            },
            order: 50
          }
        });
      }
    });

    Elevation.addInitHook(function () {
      var _this = this;

      if (!this.options.acceleration) return;
      var opts = this.options;
      var acceleration = {};
      acceleration.label = opts.accelerationLabel || L._(opts.imperial ? 'ft/s²' : 'm/s²');
      opts.accelerationFactor = opts.accelerationFactor || 1;

      this._registerDataAttribute({
        name: 'acceleration',
        init: function init() {// this.track_info.acceleration_max = -Infinity; // Acceleration Max
          // this.track_info.acceleration_min = +Infinity; // Acceleration Min
          // this.track_info.acceleration_avg = 0;         // Acceleration Avg
        },
        fetch: function fetch(i) {
          var data = _this._data;
          var dv = (data[i].speed - data[i > 0 ? i - 1 : i].speed) * (1000 / opts.timeFactor);
          var dt = (data[i].time - data[i > 0 ? i - 1 : i].time) / 1000;
          return dt > 0 ? Math.abs(dv / dt) * opts.accelerationFactor : 0;
        },
        update: function update(acceleration, i) {
          _this.track_info.acceleration_max = _this.track_info.acceleration_max || -Infinity; // Acceleration Max

          _this.track_info.acceleration_min = _this.track_info.acceleration_min || +Infinity; // Acceleration Min

          _this.track_info.acceleration_avg = _this.track_info.acceleration_avg || 0; // Acceleration Avg

          var data = _this._data;
          var track = _this.track_info; // Try to smooth "crazy" acceleration values.

          if (_this.options.accelerationDeltaMax) {
            var delta = acceleration - data[i > 0 ? i - 1 : i].acceleration;
            var deltaMax = _this.options.accelerationDeltaMax;

            if (Math.abs(delta) > deltaMax) {
              acceleration = data[i - 1].acceleration + deltaMax * Math.sign(delta);
            }
          } // Range of acceptable acceleration values.


          acceleration = clamp(acceleration, _this.options.accelerationRange);
          if (acceleration > track.acceleration_max) track.acceleration_max = acceleration;
          if (acceleration < track.acceleration_min) track.acceleration_min = acceleration;
          track.acceleration_avg = (acceleration + track.acceleration_avg) / 2.0;
          return L.Util.formatNum(acceleration, 2);
        }
      });

      if (this.options.acceleration != "summary") {
        this._registerAxisScale({
          axis: "y",
          position: "right",
          scale: {
            min: 0,
            max: +1
          },
          tickPadding: 16,
          label: acceleration.label,
          labelX: 25,
          labelY: -8,
          name: 'acceleration'
        });

        this._registerAreaPath({
          name: 'acceleration',
          label: 'Acceleration',
          yAttr: 'acceleration',
          scaleX: 'distance',
          scaleY: 'acceleration',
          color: '#050402',
          strokeColor: '#000',
          strokeOpacity: "0.5",
          fillOpacity: "0.25"
        });
      }

      this._registerTooltip({
        name: 'acceleration',
        chart: function chart(item) {
          return L._("a: ") + item.acceleration + " " + acceleration.label;
        },
        marker: function marker(item) {
          return Math.round(item.acceleration) + " " + acceleration.label;
        },
        order: 60
      });

      this._registerSummary({
        "minacceleration": {
          label: "Min Acceleration: ",
          value: function value(track) {
            return Math.round(track.acceleration_min || 0) + '&nbsp;' + acceleration.label;
          },
          order: 60
        },
        "maxacceleration": {
          label: "Max Acceleration: ",
          value: function value(track) {
            return Math.round(track.acceleration_max || 0) + '&nbsp;' + acceleration.label;
          },
          order: 60
        },
        "avgacceleration": {
          label: "Avg Acceleration: ",
          value: function value(track) {
            return Math.round(track.acceleration_avg || 0) + '&nbsp;' + acceleration.label;
          },
          order: 60
        }
      });
    });

    /*
     * Copyright (c) 2019, GPL-3.0+ Project, Raruto
     *
     *  This file is free software: you may copy, redistribute and/or modify it
     *  under the terms of the GNU General Public License as published by the
     *  Free Software Foundation, either version 2 of the License, or (at your
     *  option) any later version.
     *
     *  This file is distributed in the hope that it will be useful, but
     *  WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
     *  General Public License for more details.
     *
     *  You should have received a copy of the GNU General Public License
     *  along with this program.  If not, see .
     *
     * This file incorporates work covered by the following copyright and
     * permission notice:
     *
     *     Copyright (c) 2013-2016, MIT License, Felix “MrMufflon” Bache
     *
     *     Permission to use, copy, modify, and/or distribute this software
     *     for any purpose with or without fee is hereby granted, provided
     *     that the above copyright notice and this permission notice appear
     *     in all copies.
     *
     *     THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
     *     WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
     *     WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
     *     AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
     *     CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
     *     OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
     *     NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
     *     CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     */
    Elevation.Utils = _;
    Elevation.Components = D3;
    Elevation.Chart = Chart$1;
    /* Temporary fix for empty values evaluated as false (leaflet-i18n v0.3.1) */

    (function () {
      var proto = L.i18n.bind({});

      L.i18n = L._ = function (string, data) {
        if (L.locale && L.locales[L.locale] && L.locales[L.locale][string] == "") {
          L.locales[L.locale][string] = "\u200B";
        }

        return proto.call(null, string, data);
      };
    })(); // Alias deprecated functions


    Elevation.addInitHook(function () {
      this.enableDragging = this.enableBrush;
      this.disableDragging = this.disableBrush;
      this.loadChart = this.addTo;
      this.loadData = this.load;
      this.loadGPX = this.load;
      this.loadGeoJSON = this.load;
      this.loadXML = this.load;
      this.loadFile = this.load;
      this._addGPXData = this._addGeoJSONData;
      this._registerFocusLabel = this._registerTooltip;
    });

    L.control.elevation = function (options) {
      return new Elevation(options);
    };

})));
//# sourceMappingURL=leaflet-elevation.js.map
