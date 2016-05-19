
var pack = (function() {
  function createPackerDocument(blocks, documentWidth, documentHeight) {
    var doc = new jsPDF('p', 'in', [documentWidth, documentHeight])
    doc.setLineWidth(1/72)

    blocks.forEach(function(block, index) {
      if (block.fit) {
        //var color = Math.floor(Math.random() * 150)
        var color

        // Outer Frame
        color = 100
        doc.setFillColor(color, color, color)
        doc.rect(block.fit.x, block.fit.y, block.w, block.h, 'F')

        // Inner Frame
        color = 255
        doc.setFillColor(color, color, color)
        doc.rect(
          block.fit.x + block.o.paddingLeft,
          block.fit.y + block.o.paddingTop,
          block.w - (block.o.paddingLeft + block.o.paddingRight),
          block.h - (block.o.paddingTop  + block.o.paddingBottom),
          'F')

        doc.setTextColor(255, 255, 255)
        var hintMessage = block.o.width + ' x ' + block.o.height + '  Color: ' + block.o.color + " -- N:" + (index + 1)
        doc.text(block.fit.x + .3, block.fit.y + .3, hintMessage, 0)
      } else {
        console.log("No fit!")
      }
    })
    doc.save()
  }

  return function pack(data) {
    var blocks = data.map(function(datum) {
      return {
        w: datum.width,
        h: datum.height,
        o: datum
      }
    }).sort(function(o1, o2) {
      return o2.h - o1.h
    })

    var orderedBlocks = blocks.slice()

    var documentWidth  = 90
    var documentHeight = 90

    var packer = new Packer(documentWidth, documentHeight)
    packer.fit(orderedBlocks)
    createPackerDocument(orderedBlocks, documentWidth, documentHeight)
  }
})()
