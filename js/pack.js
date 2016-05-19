
var pack = (function() {
  function populateDocument(doc, blocks, documentWidth, documentHeight, x, y) {
    blocks.forEach(function(block, index) {
      var hintMessage = block.o.width + ' x ' + block.o.height + '  Color: ' + block.o.color

      if (block.fit) {
        // Outer Frame
        doc.setFillColor(100, 100, 100)
        doc.rect(
          x + block.fit.x,
          y + block.fit.y,
          block.w,
          block.h,
          'F'
        )

        // Inner Frame
        doc.setFillColor(255, 255, 255)
        doc.rect(
          x + block.fit.x + block.o.paddingLeft,
          y + block.fit.y + block.o.paddingTop,
          block.w - (block.o.paddingLeft + block.o.paddingRight),
          block.h - (block.o.paddingTop  + block.o.paddingBottom),
          'F')

        doc.setTextColor(255, 255, 255)
        doc.text(x + block.fit.x + .3, y + block.fit.y + .3, hintMessage, 0)

        if (block.children) {
          var innerFrame = getInnerFrame(block)

          populateDocument(
            doc,
            block.children,
            innerFrame.w,
            innerFrame.h,
            block.fit.x + block.o.paddingLeft,
            block.fit.y + block.o.paddingTop
          )
        }

      } else {
        console.log('%c' + hintMessage + ' did not fit', 'color: red; font-size: .8em')
      }
    })
  }

  function packR(blocks, processedBlocks) {
    var nextBlock = blocks.shift()

    if (nextBlock) {
      var blcks      = blocks.filter(function(block) { return !block.parent })

      var innerFrame = getInnerFrame(nextBlock)
      var packer     = new Packer(innerFrame.w, innerFrame.h)

      packer.fit(blcks)

      var fitBlocks = blcks.filter(function(block) { return !!block.fit })

      fitBlocks.forEach(function(fitBlock) {
        fitBlock.parent = nextBlock

        nextBlock.children = nextBlock.children || []
        nextBlock.children.push(fitBlock)
      })

      processedBlocks.push(nextBlock)

      packR(blocks, processedBlocks)
    }
  }

  function getInnerFrame(block) {
    return {
      w: block.w - block.o.paddingLeft - block.o.paddingRight,
      h: block.h - block.o.paddingTop  - block.o.paddingBottom
    }
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

    var orderedBlocks   = blocks.slice()
    var processedBlocks = []

    packR(orderedBlocks, processedBlocks)

    var topLevelBlocks = processedBlocks.filter(function(block) { return !block.parent })
    var documentWidth  = getCookiecutterWidth()
    var documentHeight = getCookiecutterHeight()

    var packer = new Packer(documentWidth, documentHeight)
    packer.fit(topLevelBlocks)

    var doc = new jsPDF('p', 'in', [documentWidth, documentHeight])
    doc.setLineWidth(1/72)
    populateDocument(doc, topLevelBlocks, documentWidth, documentHeight, 0, 0)
    doc.save()
  }
})()
