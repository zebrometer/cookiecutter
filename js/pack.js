
var pack = (function() {
  function addLayoutProperties(blocks, x, y) {
    var margin = getCookiecutterMargin()

    blocks.forEach(function(block, index) {
      if (block.fit) {
        block.outerRect = {
          x: x + block.fit.x,
          y: y + block.fit.y,
          w: block.w,
          h: block.h
        }
        block.innerRect = {
          x: x + block.fit.x + block.o.paddingLeft + margin,
          y: y + block.fit.y + block.o.paddingTop + margin,
          w: block.w - (block.o.paddingLeft + block.o.paddingRight  + 2*margin),
          h: block.h - (block.o.paddingTop  + block.o.paddingBottom + 2*margin)
        }

        // block.outerRect.x += margin
        // block.outerRect.y += margin
        // block.outerRect.w -= margin
        // block.outerRect.h -= margin

        // if (block.parent) {
        //   block.outerRect.x += margin
        //   block.outerRect.y += margin
        //   block.outerRect.w -= 2*margin
        //   block.outerRect.h -= 2*margin
        // } else {
        //
        // }


        // if (block.parent) {
        //   block.outerRect.x += margin
        //   block.outerRect.y += margin
        //
        //   block.innerRect.x += margin
        //   block.innerRect.y += margin
        // }
        //
        // block.outerRect.w -= 2*margin
        // block.outerRect.h -= 2*margin
        //
        // block.innerRect.w -= 2*margin
        // block.innerRect.h -= 2*margin

        if (block.children) {
          var innerFrame = getInnerFrame(block)

          addLayoutProperties(
            block.children,
            block.fit.x + block.o.paddingLeft + margin,
            block.fit.y + block.o.paddingTop  + margin
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
    var margin = getCookiecutterMargin()

    return {
      w: block.w - block.o.paddingLeft - block.o.paddingRight  - 2*margin,
      h: block.h - block.o.paddingTop  - block.o.paddingBottom - 2*margin
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

  function packAttemptPage(blocks, pagesBlocks) {
    var width  = getCookiecutterWidth()
    var height = getCookiecutterHeight()

    var packer = new Packer(width, height)
    packer.fit(blocks)

    var pageBlocks   = blocks.filter(function(block) { return !!block.fit })
    var noPageBlocks = blocks.filter(function(block) { return  !block.fit })

    if (pageBlocks.length === 0) return

    addLayoutProperties(pageBlocks, 0, 0)

    pagesBlocks.push(pageBlocks)

    if (noPageBlocks.length > 0) {
      packAttemptPage(noPageBlocks, pagesBlocks)
    }
  }

  function packHeuristicsSwapDimensions(data, callback, nAttempts) {
    var margin = getCookiecutterMargin()

    var blocks = data.map(function(datum) {
      return {
        w: Math.max(datum.width, datum.height) + 2*margin,
        h: Math.min(datum.width, datum.height) + 2*margin,
        o: datum
      }
    })
    var results = []

    for (var i=0; i<nAttempts; i++) {
      var blocksAttemnt = blocks.slice()
      blocksAttemnt = blocksAttemnt.map(function(block) {
        var swap = Math.random() > .5
        return {
          w: swap ? block.h : block.w,
          h: swap ? block.w : block.h,
          o: block.o
        }
      }).sort(function(o1, o2) {
          return - o1.h + o2.h
      })
      results.push(packAttempt(blocksAttemnt, false))
    }
    results.sort(function(result1, result2) { return result1.score - result2.score })
    return results
  }

  // function packHeuristicsRandomizeInput(data, callback, nAttempts) {
  //   var margin = getCookiecutterMargin()
  //
  //   var blocks = data.map(function(datum) {
  //     return {
  //       w: Math.max(datum.width, datum.height) + margin,
  //       h: Math.min(datum.width, datum.height) + margin,
  //       o: datum
  //     }
  //   })
  //   .sort(function(o1, o2) {
  //     return - o1.w + o2.w
  //   })
  //
  //   var results = []
  //   for (var i=0; i<nAttempts; i++) {
  //     results.push(packAttempt(blocks, true))
  //   }
  //   results.sort(function(result1, result2) { return result1.score - result2.score })
  //   return results
  // }

  return function pack(data, callback) {
    // 100 attempts is usually all that you need - make it 5000 to make it look
    // like we are solving a more computationally difficult problem that it is
    var nAttempts = 100//5000
    var results   = packHeuristicsSwapDimensions(data, callback, nAttempts)
    //var results = packHeuristicsRandomizeInput(data, callback, nAttempts)

    var bestResult  = results.pop()
    var worstResult = results.shift()
    console.log('best  result: ' + bestResult.score)
    console.log('worst result: ' + worstResult.score)
    console.log('N pages: ' + bestResult.pages.length)

    nextPagePDF(bestResult.pages, [], function(dataurls) {
      showBusyView(void 0)
      callback && callback(dataurls)
    })
  }
})()
