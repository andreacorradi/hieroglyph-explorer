function Parser() {
	self = this

	let env = "local"

  //per fetchare i file xml da remoto, ora non attivo perché da errori in lettura
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    env = "local"
  }

	function getDescriptions() {
    let descUrl
    //per fetchare i file xml da remoto, ora non attivo perché da errori in lettura
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
    //per fetchare i file xml da remoto, ora non attivo perché da errori in lettura
    if (env === "local") { codeUrl = 'data/unicodes.xml' }
    else codeUrl = 'https://mjn.host.cs.st-andrews.ac.uk/egyptian/unicode/signunicode.xml'
    return axios({
      method: 'get',
      url: codeUrl,
      responseType: 'document'
    })
  }

  function getUse() {
    let useUrl
    //per fetchare i file xml da remoto, ora non attivo perché da errori in lettura
    if (env === "local") { useUrl = 'data/uses.xml' }
    else useUrl = 'https://mjn.host.cs.st-andrews.ac.uk/egyptian/unicode/signuse.xml'
    return axios({
      method: 'get',
      url: useUrl,
      responseType: 'document'
    })
  }

  self.buildDictionary = function() {
    axios.all([getDescriptions(), getUnicodes(), getUse()])
    .then(axios.spread(function (desc, codes, uses) {
      let descSel = $(desc.data).find('sign').toArray()
      let codeSel = $(codes.data).find('sign').toArray()
      let useSel = $(uses.data).find('sign').toArray()
      // console.log(descSel)
      // console.log(codeSel)
      // console.log(useSel)
      descSel.forEach(function(d, i) {
        APP.glyphs.push({
          id: d.id,
          description: d.textContent,
          code: APP.utilities.match(codeSel, d.id).attr("code"),
          uses: pickUses(d.id)
        })

        function getExamples(el) {
          let elArr = []
          let results = $(el).find('example > tr')
          if (results.length !== 0) {
            results.each(function(k, e) {
              elArr.push(e.innerHTML)
            })
          }
          return elArr
        }

        function pickUses(matchId) {
          let uses = []
          let descInfo = null
          let stdInfo = null
          let useEls = APP.utilities.matchMult(useSel, matchId)
          useEls.forEach(function(t, i) {
            let comps = $(t).find('sign > *')
            comps.each(function(j, c) {
              //name = type of use
              let name = c.nodeName
              //elements with tag <describe> and their <examples>
              let desc = $(c).find('describe')
              desc.each(function(k, d) {
                descInfo = {
                  descName: d.innerHTML,
                  descExamples: getExamples(c)
                }
              })
              //elements with tag <tr> (and their <examples> when present)
              let stdEl = $(c).find(c.nodeName + ' > tr')
              stdEl.each(function(k, d) {
                stdInfo = {
                  stdName: d.innerHTML,
                  stdExamples: getExamples(c)
                }
              })
              uses.push({
                name: name,
                desc: descInfo,
                std: stdInfo
              })
            }) 
          })
          //console.log(uses)
          return uses
        }
      })
      console.log(APP.glyphs)
    }))
  }

	return self
}