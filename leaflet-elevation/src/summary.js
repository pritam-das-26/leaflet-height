import 'leaflet-i18n';
import * as _ from './utils';
import * as D3 from './components';

export var Summary = L.Class.extend({
	initialize: function(opts, control) {
		this.options = opts;
		this.control = control;
		this.labels = {};

		let summary = this._container = _.create("div", "elevation-summary " + (opts.summary ? opts.summary + "-summary" : ''));
		_.style(summary, 'max-width', opts.width ? opts.width + 'px' : '');
	},

	render: function() {
		return container => container.append(() => this._container);
	},

	reset: function() {
		this._container.innerHTML = '';
	},

	append: function(className, label, value) {
		this._container.innerHTML += `<span class="${className}"><span class="summarylabel">${label}</span><span class="summaryvalue">${value}</span></span>`;
		return this;
	},

	update: function() {
		Object
		.keys(this.labels)
		.sort((a, b) => this.labels[a].order - this.labels[b].order) // TODO: any performance issues?
		.forEach((i)=> {
			this.append(i, L._(this.labels[i].label), typeof this.labels[i].value !== "function" ? this.labels[i].value : this.labels[i].value(this.control.track_info));
		});
	},

	_registerSummary: function(data) {
		for (let i in data) {
			data[i].order = data[i].order ?? 100;
			this.labels[i] = data[i];
		}
	}

});
