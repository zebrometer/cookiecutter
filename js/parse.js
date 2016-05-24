

var parseFile = (function() {
  var ALPHABET         = 'abcdefghijklmnopqrstuvwxyz'
  var COLUMN_PROP_HASH = {
    width         : letterAt(9),//letterAt(1),
    height        : letterAt(8),//letterAt(0),
    paddingTop    : letterAt(3),
    paddingBottom : letterAt(4),
    paddingLeft   : letterAt(5),
    paddingRight  : letterAt(6),
    color         : letterAt(11),
    quantity      : letterAt(13)
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

  function processWorksheet(worksheet) {
    var range  = findRange(worksheet)
    var values = findValues(range, worksheet)

    values && values.filter(function(value) { return value.quantity > 1 }).forEach(function(value) {
      var nRepeat  = value.quantity - 1

      for (var i=0; i<nRepeat; i++) {
        values.push(Object.assign({}, value))
      }
    })

    return values
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

  return function parseFile(file, callback) {
    var reader = new FileReader()

    reader.onload = function(e) {
      var data = e.target.result
      var workbook = XLSX.read(data, {type: 'binary'})

      var values = workbook.SheetNames
        && workbook.SheetNames.length > 0
        && processWorksheet(workbook.Sheets[workbook.SheetNames[0]])

      callback && callback(values)
    }

    reader.readAsBinaryString(file)
  }
})()
