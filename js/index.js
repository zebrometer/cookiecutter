// https://github.com/SheetJS/js-xlsx
// https://github.com/jakesgordon/bin-packing
function bootstrapApp() {
	if ( !getCookiecutterWidth() || !getCookiecutterHeight() ) {
		setCookiecutterWidth(150)
		setCookiecutterHeight(100)
	}

	function onSizeChange(value, isHeight) {
		if (isHeight) {
			setCookiecutterHeight(value)
		} else {
			setCookiecutterWidth(value)
		}
	}

	$('.height-control').val(getCookiecutterHeight())
	$('.width-control').val(getCookiecutterWidth())

	$('.height-control').change(function(e) { onSizeChange($(this).val(), true)  })
	$('.width-control').change(function(e)  { onSizeChange($(this).val(), false) })

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

function getCookiecutterWidth()  { return +localStorage.getItem('cookiecutter_width')  }
function getCookiecutterHeight() { return +localStorage.getItem('cookiecutter_height') }

function setCookiecutterWidth(value)  { localStorage.setItem('cookiecutter_width', value)  }
function setCookiecutterHeight(value) { localStorage.setItem('cookiecutter_height', value) }
