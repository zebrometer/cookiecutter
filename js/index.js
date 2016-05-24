// https://github.com/SheetJS/js-xlsx
// https://github.com/jakesgordon/bin-packing
function bootstrapApp() {
	if ( !getCookiecutterWidth() || !getCookiecutterHeight() ) {
		setCookiecutterWidth(150)
		setCookiecutterHeight(100)
	}

	if ( !getCookiecutterMargin() ) {
		setCookiecutterMargin(.1)
	}

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

	$('.height-control').val(getCookiecutterHeight())
	$('.width-control').val(getCookiecutterWidth())
	$('.margin-control').val(getCookiecutterMargin())

	$('.height-control').change(function(e) { onSizeChange($(this).val(), true)  })
	$('.width-control').change(function(e)  { onSizeChange($(this).val(), false) })
	$('.margin-control').change(function(e)  { onMarginChange($(this).val()) })

	$('.dropTarget').on('drop dragdrop', function(event) {
		event.preventDefault()

		var file = event.originalEvent.dataTransfer.files
			&& event.originalEvent.dataTransfer.files.length > 0
			&& event.originalEvent.dataTransfer.files[0]

		file && parseFile(file, function(values) {
			var dataurls = values && pack(values)

			$('.container').empty()
			dataurls && dataurls.forEach(function(dataurl) {
				$('.container').append("<iframe class='preview-pane' type='application/pdf' style='width: 200%; height: 200%;' frameborder='0' src=" + dataurl + "></iframe>")
			})
		 })
	})

	$('.dropTarget').on('dragenter', function(event) { event.preventDefault() })

	$('.dropTarget').on('dragleave', function() { })

	$('.dropTarget').on('dragover', function(event) { event.preventDefault() })
}

function getCookiecutterWidth()  { return getLocalStorageValue('cookiecutter_width')  }
function getCookiecutterHeight() { return getLocalStorageValue('cookiecutter_height') }
function getCookiecutterMargin() { return getLocalStorageValue('cookiecutter_margin') }

function setCookiecutterWidth(value)  { setLocalStorageValue('cookiecutter_width', value)  }
function setCookiecutterHeight(value) { setLocalStorageValue('cookiecutter_height', value) }
function setCookiecutterMargin(value) { setLocalStorageValue('cookiecutter_margin', value) }

function getLocalStorageValue(propName, defaultValue) {
	return +localStorage.getItem(propName)
}

function setLocalStorageValue(propName, value) {
	localStorage.setItem(propName, value)
}
