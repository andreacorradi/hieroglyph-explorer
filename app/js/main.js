(function() {
  'use strict'
  window.APP = window.APP || {}
  APP.glyphs = []
  let gardCat = "A"
  let env = "local"

  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    env = "local"
  }

  const categories = {
    "Man and his occupations": "A",
    "Woman and her occupations": "B",
    "Anthropomorphic deities": "C",
    "Parts of the human body": "D",
    "Mammals": "E",
    "Parts of mammals": "F",
    "Birds": "G",
    "Parts of birds": "H",
    "Amphibious animals, reptiles, etc.": "I",
    "Fish and parts of fish": "K",
    "Invertebrates and lesser animals": "L",
    "Trees and plants": "M",
    "Sky, earth, water": "N",
    "Buildings, parts of buildings, etc.": "O",
    "Ships and parts of ships": "P",
    "Domestics and funerary furniture": "Q",
    "Temple furniture and sacred emblems": "R",
    "Crowns, dress, staves, etc.": "S",
    "Warfare, hunting, and butchery": "T",
    "Agriculture, crafts, and professions": "U",
    "Rope, fiber, baskets, bags, etc.": "V",
    "Vessels of stone and earthenware": "W",
    "Loaves and cakes": "X",
    "Writings, games, music": "Y",
    "Strokes, signs derived from Hieratic, geometrical figures": "Z",
    "Unclassified": "Aa"
  }
    

  function match(arr, prop) {
    let el = _.find(arr, function(p) { return p.id === prop })
    return $(el)
  }

  function getDescriptions() {
    let descUrl
    if (env === "local") { descUrl = 'data/description.xml' }
    else descUrl = 'https://mjn.host.cs.st-andrews.ac.uk/egyptian/unicode/signdescriptioneng.xml'
    return axios({
      method: 'get',
      url: descUrl,
      responseType: 'document'
    })
  }

  function getUnicodes() {
    let codeUrl
    if (env === "local") { codeUrl = 'data/unicodes.xml' }
    else codeUrl = 'https://mjn.host.cs.st-andrews.ac.uk/egyptian/unicode/signunicode.xml'
    return axios({
      method: 'get',
      url: codeUrl,
      responseType: 'document'
    })
  }


  axios.all([getDescriptions(), getUnicodes()])
    .then(axios.spread(function (desc, codes) {
      let descSel = $(desc.data).find('sign').toArray()
      let codeSel = $(codes.data).find('sign').toArray()
      // console.log(descSel)
      // console.log(codeSel)
      descSel.forEach(function(d, i) {
        APP.glyphs.push({
          id: d.id,
          description: d.textContent,
          code: match(codeSel, d.id).attr("code")
        })
      })
      //console.log(APP.glyphs)
      init()
    }))


  function init() {
    //populate category select
    _.forOwn(categories, function(c, key) {
      let el = '<option>' + key + '</option>'
      $('select#cat-selector').append(el)
    })
    run()
  }

  function run() {
    //category select event listener
    $('select#cat-selector').change(function(e){
      gardCat = categories[$(this).val()]
      //first remove old categories
      $('select#item-selector option').remove()
      //pick items belonging to the chosen category
      let items = _.filter(APP.glyphs, function(g) { 
        if (gardCat !== "Aa") {
          return g.id.slice(0, 1) === gardCat && g.id.slice(0, 2) !== "Aa"
        } else return g.id.slice(0, 2) === gardCat
      })
      //populate item select
      _.forOwn(items, function(i, key) {
        let index
        if (gardCat !== "Aa") { index = i.id.slice(1) } else index = i.id.slice(2)
        let el = '<option id="item' + index +'">' + i.description + '</option>'
        $('select#item-selector').append(el)
      })
      //init item select, first item of the category as default
      let itemValue = gardCat + "1"
      displayHieroglyph(itemValue)
    })
    //item select event listener
    $('select#item-selector').change(function(e){
      let itemValue = gardCat + $(this).find('option:selected').attr('id').slice(4)
      displayHieroglyph(itemValue)
    })
  }

  //picks and displays the hieroglyph associated with itemId 
  function displayHieroglyph(itemId) {
    let hierogliph = match(APP.glyphs, itemId)
    if (hierogliph.attr("code") !== undefined) {
      let hieroCode = hierogliph.attr("code").slice(2)
      let hieroDesc = hierogliph.attr("description")
      $('.pictogram').html('&#x' + hieroCode + ';')
      $('.description').html(hieroDesc)
    } else {
      $('.pictogram').html('')
      $('.description').html('Code not existent')
    }
  }
  
})()