
var pack = (function() {
  function addLayoutProperties(blocks, x, y) {
    blocks.forEach(function(block, index) {
      if (block.fit) {
        block.outerRect = {
          x: x + block.fit.x,
          y: y + block.fit.y,
          w: block.w,
          h: block.h
        }
        block.innerRect = {
          x: x + block.fit.x + block.o.paddingLeft,
          y: y + block.fit.y + block.o.paddingTop,
          w: block.w - (block.o.paddingLeft + block.o.paddingRight),
          h: block.h - (block.o.paddingTop  + block.o.paddingBottom)
        }

        if (block.children) {
          var innerFrame = getInnerFrame(block)

          addLayoutProperties(
            block.children,
            block.fit.x + block.o.paddingLeft,
            block.fit.y + block.o.paddingTop
          )
        }
      }
    })
  }

  function nestBlocksR(blocks, processedBlocks) {
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

      nestBlocksR(blocks, processedBlocks)
    }
  }

  function getInnerFrame(block) {
    return {
      w: block.w - block.o.paddingLeft - block.o.paddingRight,
      h: block.h - block.o.paddingTop  - block.o.paddingBottom
    }
  }

  function packAttempt(blocks, randomize) {
    // Create a deep clone ...
    var inputBlocks = blocks.map(function(block) {
      return {
        w: block.w,
        h: block.h,
        o: Object.assign(block.o)
      }
    })

    if (randomize) {
      inputBlocks.sort(function(block1, block2) {
        return Math.random() > .5 ? 1 : -1
      })
    }

    var processedBlocks = []
    nestBlocksR(inputBlocks, processedBlocks)

    var topBlocks   = processedBlocks.filter(function(block) { return !block.parent })
    var pagesBlocks = [] // Each element in the array is an array of blocks for a page
    packAttemptPage(topBlocks, pagesBlocks)

    var allPagesUsedSpace = 0
    var allPagesAvailableSpace = getCookiecutterWidth() * getCookiecutterHeight() * pagesBlocks.length
    pagesBlocks.forEach(function(pageBlocks) { // do reduce
      allPagesUsedSpace += computePageS(pageBlocks)
    })
    var score = allPagesUsedSpace / allPagesAvailableSpace

    return {
      pages: pagesBlocks,
      score: score
    }
  }

  function computePageS(blocks) {
    var totalS = 0

    blocks.forEach(function(block) {
      var blockS = block.outerRect.w * block.outerRect.h - block.innerRect.w * block.innerRect.h
      totalS += blockS

      if (block.children) {
        var subS = computePageS(block.children)
        totalS  += subS
      }
    })

    return totalS
  }

  function generatePagePDF(blocks) {
    var width  = getCookiecutterWidth()
    var height = getCookiecutterHeight()

    var doc = new jsPDF('p', 'in', [width, height])
    doc.setLineWidth(1/72)

    var drawDoc = function(block) {
      doc.setFillColor(100, 100, 100)
      doc.rect(block.outerRect.x, block.outerRect.y, block.outerRect.w, block.outerRect.h, 'F')

      doc.setFillColor(255, 255, 255)
      doc.rect(block.innerRect.x, block.innerRect.y, block.innerRect.w, block.innerRect.h, 'F')
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
    doc.save()
  }

  function packAttemptPage(blocks, pagesBlocks) {
    var width  = getCookiecutterWidth()
    var height = getCookiecutterHeight()

    var packer = new Packer(width, height)
    packer.fit(blocks)

    var pageBlocks   = blocks.filter(function(block) { return !!block.fit })
    var noPageBlocks = blocks.filter(function(block) { return  !block.fit })

    addLayoutProperties(pageBlocks, 0, 0)

    pagesBlocks.push(pageBlocks)

    if (noPageBlocks.length > 0) {
      packAttemptPage(noPageBlocks, pagesBlocks)
    }
  }

  return function pack(data) {
    var blocks = data.map(function(datum) {
      return {
        w: datum.width,
        h: datum.height,
        o: datum
      }
    })
    .sort(function(o1, o2) {
      return o2.h - o1.h
    })

    var results = []
    for (var i=0; i<1000; i++) {
      results.push(packAttempt(blocks, true))
    }
    results.sort(function(result1, result2) { return result1.score - result2.score })

    var bestResult  = results.pop()
    var worstResult = results.shift()
    console.log('best  result: ' + bestResult.score)
    console.log('worst result: ' + worstResult.score)

    bestResult.pages.forEach(function(blocks) {
      generatePagePDF(blocks)
    })
  }

  // var doc = new jsPDF('p', 'in', [documentWidth, documentHeight])
  // doc.setLineWidth(1/72)
  //
  // layoutBlocks(topLevelBlocks, documentWidth, documentHeight, 0, 0)
  // doc.save()

})()





// function populateDocument(doc, blocks, documentWidth, documentHeight, x, y) {
//   blocks.forEach(function(block, index) {
//     var hintMessage = block.o.width + ' x ' + block.o.height + '  Color: ' + block.o.color
//
//     if (block.fit) {
//       // Outer Frame
//       doc.setFillColor(100, 100, 100)
//       doc.rect(
//         x + block.fit.x,
//         y + block.fit.y,
//         block.w,
//         block.h,
//         'F'
//       )
//
//       // Inner Frame
//       doc.setFillColor(255, 255, 255)
//       doc.rect(
//         x + block.fit.x + block.o.paddingLeft,
//         y + block.fit.y + block.o.paddingTop,
//         block.w - (block.o.paddingLeft + block.o.paddingRight),
//         block.h - (block.o.paddingTop  + block.o.paddingBottom),
//         'F')
//
//       doc.setTextColor(255, 255, 255)
//       doc.text(x + block.fit.x + .3, y + block.fit.y + .3, hintMessage, 0)
//
//       if (block.children) {
//         var innerFrame = getInnerFrame(block)
//
//         populateDocument(
//           doc,
//           block.children,
//           innerFrame.w,
//           innerFrame.h,
//           block.fit.x + block.o.paddingLeft,
//           block.fit.y + block.o.paddingTop
//         )
//       }
//
//     } else {
//       console.log('%c' + hintMessage + ' did not fit', 'color: red; font-size: .8em')
//     }
//   })
// }
