
var nextPagePDF = (function() {
  function generatePagePDF(blocks) {
    var width  = getCookiecutterWidth()
    var height = getCookiecutterHeight()

    var doc = new jsPDF('p', 'in', [width, height])
    doc.setLineWidth(1/72)

    var drawDoc = function(block) {
      var color = hexToRgb(getCookiecutterColor())

      doc.setFillColor(color.r, color.g, color.b)
      doc.rect(block.outerRect.x, block.outerRect.y, block.outerRect.w, block.outerRect.h, 'F')

      doc.setFillColor(255, 255, 255)
      doc.rect(block.innerRect.x, block.innerRect.y, block.innerRect.w, block.innerRect.h, 'F')

      var hintMessage = block.o.width + ' x ' + block.o.height + '  Color: ' + block.o.color
      doc.setTextColor(255, 255, 255)
      doc.text(block.outerRect.x + .3, block.outerRect.y + .3, hintMessage, 0)
    }

    var drawDocs = function(blocks) {
      blocks.forEach(function(block) {
        drawDoc(block)

        if (block.children && block.children.length > 0) {
          drawDocs(block.children)
        }
      })
    }

    drawDocs(blocks)

    return doc
  }

  return function nextPagePDF(pageBlocks, docs, callback) {
    var pageBlks = pageBlocks.shift()

    if (pageBlks) {
      showBusyView('Generating PDF content...')

      setTimeout(function() {
        docs.push(generatePagePDF(pageBlks))
        nextPagePDF(pageBlocks, docs, callback)
      }, 200)
    } else {
      callback && callback(docs)
    }
  }

})()
