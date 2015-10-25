'use strict'

function format(bytes) {
	let kb = bytes / 1024;
	let mb = bytes / 1024 / 1024;
	let gb = bytes / 1024 / 1024 / 1024;
	let tb = bytes / 1024 / 1024 / 1024 / 1024;

	var units = {
		KB: kb,
		MB: mb,
		GB: gb,
		TB: tb,
	};

	var last_unit = 'B';
	var last_value = bytes;
	for (var u in units) {
		if (units[u] < 1) {
			return last_value + ' ' + last_unit
		}
		last_unit = u;
		last_value = units[u].toFixed(2);
	}
	return last_value + ' ' + last_unit
}

function clone(json) {
	return JSON.parse(JSON.stringify(json))
}

function clone2(source, target) {
	if (!target) target = {};

	if (source.name) target.name = source.name;
	if (source.size) target.size = source.size;
	if (source.children) {
		target.children = [];
		source.children.forEach( node => {
			target.children.push(clone2(node, {}))
		})
	}

	return target;
}

function log() {
  var args = Array.prototype.slice.call(arguments)
  args.unshift('%c ' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + new Array(args.length + 1).join(' %O'), 'background: #222; color: #bada55')

  console.log.apply(console, args);
}

function memory() {
  gc()

  var mem = performance.memory

  log(
    'limit',
    (mem.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
    'heap total',
    (mem.totalJSHeapSize / 1024 / 1024).toFixed(2),
    'heap used',
    (mem.usedJSHeapSize / 1024 / 1024).toFixed(2)
  )
}

/*
 * an abstraction that runs a task in the future
 * if a task is scheduled before it's ran,
 * the previous task would be cancelled
 */
function TimeoutTask(task, time) {
	this.id = null
	this.task = task
	this.time = time
}

TimeoutTask.prototype.cancel = function() {
	this.id = clearTimeout(this.id)
}

TimeoutTask.prototype.schedule = function(t) {
	this.time = t !== undefined ? t : this.time
	this.cancel()
	this.id = setTimeout(this.run.bind(this), this.time)
}

TimeoutTask.prototype.run = function() {
	this.cancel()
	if (this.task) this.task(this.schedule.bind(this))
}

var mempoller = new TimeoutTask(function(next) {
	hidePrompt()

	mem(function(ps) {
		log('mem polled')
		onJson(null, ps)
		next()
	})
}, 5000)

// if (window) {
// 	window.format = format
// 	window.clone2 = clone
// 	window.log = log
// 	window.memory = memory
// }
