// https://github.com/SheetJS/js-xlsx
// https://github.com/jakesgordon/bin-packing
function bootstrapApp() {
	!getLocalStorageValue('cookiecutter_width')  && setCookiecutterWidth(30)
	!getLocalStorageValue('cookiecutter_height') && setCookiecutterHeight(40)
	!getCookiecutterMargin() && setCookiecutterMargin(.125)
	!getCookiecutterColor()  && setCookiecutterColor('#646464')
	!getCookiecutterPrefix() && setCookiecutterPrefix('Job')

	function onSizeChange(value, isHeight) {
		if (isHeight) {
			setCookiecutterHeight(value)
		} else {
			setCookiecutterWidth(value)
		}
	}

	function onMarginChange(value) {
		setCookiecutterMargin(value)
	}

	function onColorChange(value) {
		setCookiecutterColor(value)
	}

	function onPrefixChange(value) {
		setCookiecutterPrefix(value)
	}

	$('#height-control').val(getCookiecutterHeight())
	$('#width-control').val(getCookiecutterWidth())
	$('#margin-control').val(getCookiecutterMargin())
	$('#color-control').val(getCookiecutterColor())
	$('#prefix-control').val(getCookiecutterPrefix())

	$('#height-control').change(function(e) { onSizeChange($(this).val(), true)  })
	$('#width-control').change(function(e)  { onSizeChange($(this).val(), false) })
	$('#margin-control').change(function(e) { onMarginChange($(this).val())      })
	$('#color-control').change(function(e)  { onColorChange($(this).val())       })
	$('#prefix-control').change(function(e) { onPrefixChange($(this).val())       })

	$('.dropTarget').on('drop dragdrop', function(event) {
		event.preventDefault()

		$('.container').empty()

		showBusyView('Parsing Excel File...')

		var file = event.originalEvent.dataTransfer.files
			&& event.originalEvent.dataTransfer.files.length > 0
			&& event.originalEvent.dataTransfer.files[0]

		setTimeout(function() {
			file && parseFile(file, function(values) {
				showBusyView('Computing optimal frame layout...')

				setTimeout(function() {
					values && pack(values, function(documents) {
						window.cookieCutterDocuments = documents && documents.slice() // I'm bad - i know - but it's just a prototype...
						documents && appendDataURLs(documents)
					})
				}, 200)
			 })
		}, 1000)
	})

	$('.dropTarget').on('dragenter', function(event) { event.preventDefault() })

	$('.dropTarget').on('dragleave', function() { })

	$('.dropTarget').on('dragover', function(event) { event.preventDefault() })

	$('#export-pdf').click(function(e) {
		e.preventDefault()

		window.cookieCutterDocuments && window.cookieCutterDocuments.forEach(function(doc) {
			doc.save(doc.filename)
		})
	})

	$('#export-pdf').attr('disabled', 'disabled')

	$('#reset-pdf').click(function() {
		clearLocalStorageValues()
	})
}

function appendDataURLs(documents) {
	var doc = documents.shift()

	if (doc) {
		showBusyView('Embedding PDF content into page...')

		setTimeout(function() {
			var dataurl = doc.output('datauristring')
			$('.container').append("<iframe class='preview-pane' type='application/pdf' style='width: 200%; height: 200%;' frameborder='0' src=" + dataurl + "></iframe>")
			appendDataURLs(documents)
		}, 200)
	}	else {
		showBusyView(void 0)
		$('#export-pdf').prop("disabled", false)
	}
}

function showBusyView(message) {
	$('.loadmask').css('display', (message ? 'block' : 'none'))
	message && $('.loadmask > h1').html(message)
}

function getCookiecutterWidth()  {
	return Math.min(getLocalStorageValue('cookiecutter_width'), getLocalStorageValue('cookiecutter_height'))
}
function getCookiecutterHeight() {
	return Math.max(getLocalStorageValue('cookiecutter_width'), getLocalStorageValue('cookiecutter_height'))
}

// function getCookiecutterWidth()  { return getLocalStorageValue('cookiecutter_width')  }
// function getCookiecutterHeight() { return getLocalStorageValue('cookiecutter_height') }
function getCookiecutterMargin() { return getLocalStorageValue('cookiecutter_margin') }
function getCookiecutterColor()  { return getLocalStorageValue('cookiecutter_color',  true) }
function getCookiecutterPrefix() { return getLocalStorageValue('cookiecutter_prefix', true) }

function setCookiecutterWidth(value)  { setLocalStorageValue('cookiecutter_width',  value) }
function setCookiecutterHeight(value) { setLocalStorageValue('cookiecutter_height', value) }
function setCookiecutterMargin(value) { setLocalStorageValue('cookiecutter_margin', value) }
function setCookiecutterColor(value)  { setLocalStorageValue('cookiecutter_color',  value) }
function setCookiecutterPrefix(value) {	setLocalStorageValue('cookiecutter_prefix', value) }

function getLocalStorageValue(propName, isString) {
	return isString
		? localStorage.getItem(propName)
		: +localStorage.getItem(propName)
}

function setLocalStorageValue(propName, value) {
	localStorage.setItem(propName, value)
}

function clearLocalStorageValues() {
	localStorage.clear()
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
