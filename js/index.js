// https://github.com/SheetJS/js-xlsx
//https://github.com/jakesgordon/bin-packing

var bootstrapApp =  ((function() {
	var ALPHABET         = 'abcdefghijklmnopqrstuvwxyz'
	var COLUMN_PROP_HASH = {
		width         : letterAt(1),
		height        : letterAt(0),
		paddingTop    : letterAt(3),
		paddingBottom : letterAt(4),
		paddingLeft   : letterAt(5),
		paddingRight  : letterAt(6),
		color         : letterAt(11),
		quantity      : letterAt(13)
	}

	var pdfs = []	

	function initEvent() {		
		$('.dropTarget').on('drop dragdrop', function(event) {
	    event.preventDefault()
	    
	    var file = event.originalEvent.dataTransfer.files 
	    	&& event.originalEvent.dataTransfer.files.length > 0 
	    	&& event.originalEvent.dataTransfer.files[0]

	    if (file) {
	    	parseFile(file)
	    }
		})

		$('.dropTarget').on('dragenter', function(event) {
		    event.preventDefault()
		})

		$('.dropTarget').on('dragleave', function() {
		})

		$('.dropTarget').on('dragover', function(event) {
		    event.preventDefault()
		})

		$('.export').on('click', function() {					
			pdfs && pdfs.forEach((doc) => {						
				doc.save(doc.filename)
			})					
		})

		$('.reset').on('click', function() {
			pdfs = []
			$(".container").empty()
		})
	}

	function parseFile(file) {
		var reader = new FileReader()

		reader.onload = function(e) {					
			var data = e.target.result
			var workbook = XLSX.read(data, {type: 'binary'})
								
			workbook.SheetNames 
				&& workbook.SheetNames.length > 0 
				&& processWorksheet(workbook.Sheets[workbook.SheetNames[0]])										
		}

		reader.readAsBinaryString(file)
	}

	function findRange(worksheet) {
		var index      = 0
		var startIndex = -1
		var endIndex   = -1

		var maxSearchIndex = 1000

		var nextValue = function nextValue() {
			return worksheet['A' + ++(index)]
		}

		while (true) {
			var value = nextValue()

			if (startIndex < 0) {
				if (value && value.t === "n") {
					startIndex = index
				}
			} else {
				if (!value) {
					endIndex = index - 1
					break
				}
			}

			if (maxSearchIndex === index) {
				break
			}
		}

		return {
				start: startIndex, 
				end: endIndex
			}
	}

	function letterAt(index) {
		return index < (ALPHABET.length - 1) 
			&& ALPHABET[index].toUpperCase()
	}

	function findValue(index, worksheet) {
		var value = {
			width         : void 0,
			height        : void 0,
			paddingTop    : void 0,
			paddingBottom : void 0,
			paddingLeft   : void 0,
			paddingRight  : void 0,
			color         : void 0,
			quantity      : void 0
		}

		Object.keys(value).forEach(function(prop) {
			if (COLUMN_PROP_HASH[prop]) {
				var sheetCellId = COLUMN_PROP_HASH[prop] + index
				var cellValue   = worksheet[sheetCellId]

				if (cellValue && cellValue.v) {
					value[prop] = cellValue.v
				}						
			}					
		})
									
		var hasMissingValues = Object.keys(value).some(function(prop) {  
			return typeof value[prop] === 'undefined' 
		})

		return hasMissingValues 
			? void 0 
			: value
	}

	function findValues(range, worksheet) {
		var values = []

		if (range.start >= 0 && range.end >= 0) {
			for (var i=range.start; i<=range.end; i++) {						
				var value = findValue(i, worksheet)
				value && values.push(value)
			}
		}

		return values
	}

	function processWorksheet(worksheet) {						
		var range  = findRange(worksheet)
		var values = findValues(range, worksheet)				

		// var range    = worksheet['!range']
		// var columns  = (range.e && !isNaN(range.e.c) && +range.e.c) || 0
		// var rows     = (range.e && !isNaN(range.e.r) && +range.e.r) || 0

		// for (var i=0; i<rows; i++) {
		// 	printRow(worksheet, columns, i+1)
		// }

		initData(values)
	}

	function clean(s) {
		return (''+s).replace('.', '_')
	}

	function initData(data) {
		var nSteps   = data && data.length
		var deferred = data && data.map((function(datum, index) { 
			return addPdfFrame.bind({datum: datum, index: index, nSteps: nSteps}) 
		}))

		nextDeferred(deferred)
	}

	function nextDeferred(deferred) {
		var nextDeferred = deferred.shift()
		nextDeferred && nextDeferred(deferred)
	}

	function addPdfFrame(deferred) {		
		var datum  = this.datum
		var index  = this.index
		var nSteps = this.nSteps		

		setTimeout(function() {
			$('.container').append("<iframe class='preview-pane' type='application/pdf' style='width: 200%; height: 200%;' frameborder='0' src=" + generatePDF(datum) + "></iframe>")

			var percentComplete = Math.floor(100 * index/ nSteps)

			if (deferred.length === 0) {				
				$('.indicator').css('left', 0)
				$('.indicator').css('width', 0)
				$('.progress > .indicator > span').text('')
			} else {
				$('.indicator').css('left', '20px')
				$('.indicator').css('width', percentComplete+'%')
				$('.progress > .indicator > span').text(percentComplete+'%')
			}			

			nextDeferred(deferred)
		}, 500)			
	}

	/**
	 * Units: 'pt', 'mm', 'cm', 'in', 'px', 'pc', 'em', 'ex'
	 * http://mrrio.github.io/jsPDF/doc/symbols/jsPDF.html			 
	 */
	function generatePDF(datum) {				
		var swap  = datum.width > datum.height

		var width         = swap ? datum.height        : datum.width
		var height        = swap ? datum.width         : datum.height
		var paddingLeft   = swap ? datum.paddingTop    : datum.paddingLeft
		var paddingRight  = swap ? datum.paddingBottom : datum.paddingRight
		var paddingTop    = swap ? datum.paddingLeft   : datum.paddingTop
		var paddingBottom = swap ? datum.paddingRight  : datum.paddingBottom
		
		var totalWidth    = paddingLeft + width  + paddingRight
		var totalHeight   = paddingTop  + height + paddingBottom

		var doc      = new jsPDF('p', 'in', [totalWidth, totalHeight])
		doc.tag_key  = datum.width

		doc.filename = clean(datum.width) + 'x' + clean(datum.height) + '_' + datum.color

		doc.setDrawColor(100, 100, 100)
		doc.setLineWidth(1/72)
		doc.rect(paddingLeft, paddingTop, width, height, 'S')

		var hintMessage = datum.width + ' x ' + datum.height + ' (' + totalWidth + ' x ' + totalHeight + ')   Color: ' + datum.color
		doc.text(.1, totalHeight - .1, hintMessage, 0)

		pdfs.push(doc)
		return doc.output('datauristring')
	}

	return function bootstrapApp() {
		initEvent()
	}	
}))()
